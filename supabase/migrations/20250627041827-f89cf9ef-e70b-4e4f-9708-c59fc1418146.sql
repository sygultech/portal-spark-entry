
-- Create library-related tables for the multi-tenant system (corrected version)

-- Books table to store book catalog
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT,
    edition TEXT,
    publisher TEXT,
    genre TEXT,
    language TEXT DEFAULT 'English',
    rack_location TEXT, -- shelf code
    total_copies INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    cover_image_url TEXT,
    description TEXT,
    subject_category TEXT,
    grade_level TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Library members table (references students and staff)
CREATE TABLE library_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL, -- barcode/library ID
    member_type TEXT NOT NULL CHECK (member_type IN ('student', 'teacher', 'staff')),
    student_id UUID REFERENCES student_details(id),
    staff_id UUID REFERENCES staff_details(id),
    borrowing_limit INTEGER NOT NULL DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    suspended_until DATE,
    suspension_reason TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id, member_id)
);

-- Book transactions (issue/return)
CREATE TABLE book_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id),
    member_id UUID NOT NULL REFERENCES library_members(id),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('issue', 'return', 'renew')),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    renewal_count INTEGER DEFAULT 0,
    max_renewals INTEGER DEFAULT 2,
    fine_amount DECIMAL(10,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT FALSE,
    fine_paid_date DATE,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue', 'lost')),
    issued_by UUID NOT NULL REFERENCES profiles(id),
    returned_by UUID REFERENCES profiles(id),
    notes TEXT,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Book reservations
CREATE TABLE book_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id),
    member_id UUID NOT NULL REFERENCES library_members(id),
    reservation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'fulfilled', 'expired', 'cancelled')),
    available_date DATE,
    expiry_date DATE,
    notification_sent BOOLEAN DEFAULT FALSE,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Library settings for fine policies
CREATE TABLE library_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    fine_per_day DECIMAL(10,2) DEFAULT 1.00,
    grace_period_days INTEGER DEFAULT 0,
    max_fine_amount DECIMAL(10,2) DEFAULT 100.00,
    student_borrowing_limit INTEGER DEFAULT 3,
    teacher_borrowing_limit INTEGER DEFAULT 5,
    staff_borrowing_limit INTEGER DEFAULT 3,
    student_borrowing_days INTEGER DEFAULT 14,
    teacher_borrowing_days INTEGER DEFAULT 30,
    staff_borrowing_days INTEGER DEFAULT 21,
    max_renewals INTEGER DEFAULT 2,
    reservation_hold_days INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(school_id)
);

-- Book inventory logs for tracking lost/damaged books
CREATE TABLE book_inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES books(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('added', 'removed', 'lost', 'damaged', 'discarded')),
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_books_school_id ON books(school_id);
CREATE INDEX idx_books_isbn ON books(isbn);
CREATE INDEX idx_books_genre ON books(genre);

CREATE INDEX idx_library_members_school_id ON library_members(school_id);
CREATE INDEX idx_library_members_type ON library_members(member_type);
CREATE INDEX idx_library_members_student_id ON library_members(student_id);
CREATE INDEX idx_library_members_staff_id ON library_members(staff_id);

CREATE INDEX idx_book_transactions_school_id ON book_transactions(school_id);
CREATE INDEX idx_book_transactions_book_id ON book_transactions(book_id);
CREATE INDEX idx_book_transactions_member_id ON book_transactions(member_id);
CREATE INDEX idx_book_transactions_status ON book_transactions(status);
CREATE INDEX idx_book_transactions_due_date ON book_transactions(due_date);

CREATE INDEX idx_book_reservations_school_id ON book_reservations(school_id);
CREATE INDEX idx_book_reservations_status ON book_reservations(status);

-- RLS Policies for multi-tenant security using the existing user role system
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_inventory_logs ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "Super admins can view all books" ON books
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view books in their school" ON books
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all books" ON books
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage books in their school" ON books
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );

-- Library members policies
CREATE POLICY "Super admins can view all library members" ON library_members
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view library members in their school" ON library_members
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all library members" ON library_members
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage library members in their school" ON library_members
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );

-- Book transactions policies
CREATE POLICY "Super admins can view all transactions" ON book_transactions
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view transactions in their school" ON book_transactions
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all transactions" ON book_transactions
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage transactions in their school" ON book_transactions
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );

-- Book reservations policies
CREATE POLICY "Super admins can view all reservations" ON book_reservations
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view reservations in their school" ON book_reservations
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all reservations" ON book_reservations
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage reservations in their school" ON book_reservations
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );

-- Library settings policies
CREATE POLICY "Super admins can view all library settings" ON library_settings
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view library settings in their school" ON library_settings
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all library settings" ON library_settings
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage library settings in their school" ON library_settings
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );

-- Book inventory logs policies
CREATE POLICY "Super admins can view all inventory logs" ON book_inventory_logs
    FOR SELECT USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School users can view inventory logs in their school" ON book_inventory_logs
    FOR SELECT USING (
        NOT public.is_super_admin(auth.uid()) AND
        public.has_any_role_in_school(auth.uid(), school_id)
    );

CREATE POLICY "Super admins can manage all inventory logs" ON book_inventory_logs
    FOR ALL USING (
        public.is_super_admin(auth.uid())
    );

CREATE POLICY "School admins can manage inventory logs in their school" ON book_inventory_logs
    FOR ALL USING (
        public.is_school_admin(auth.uid(), school_id)
    );
