
-- Create helper functions for book inventory management

-- Function to decrement book available copies when issuing
CREATE OR REPLACE FUNCTION decrement_book_copies(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE books 
    SET available_copies = available_copies - 1,
        updated_at = now()
    WHERE id = book_id 
    AND available_copies > 0;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Book not found or no copies available';
    END IF;
END;
$$;

-- Function to increment book available copies when returning
CREATE OR REPLACE FUNCTION increment_book_copies(book_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE books 
    SET available_copies = available_copies + 1,
        updated_at = now()
    WHERE id = book_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Book not found';
    END IF;
END;
$$;

-- Function to update book transaction status to overdue based on due date
CREATE OR REPLACE FUNCTION update_overdue_transactions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE book_transactions 
    SET status = 'overdue',
        updated_at = now()
    WHERE status = 'issued' 
    AND due_date < CURRENT_DATE;
END;
$$;

-- Add triggers to automatically update book totals when components change
CREATE OR REPLACE FUNCTION update_book_inventory_on_transaction()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log inventory changes
    IF TG_OP = 'INSERT' AND NEW.transaction_type = 'issue' THEN
        INSERT INTO book_inventory_logs (
            book_id, 
            action_type, 
            quantity_change, 
            reason, 
            performed_by, 
            school_id
        ) VALUES (
            NEW.book_id, 
            'removed', 
            -1, 
            'Book issued to member', 
            NEW.issued_by, 
            NEW.school_id
        );
    ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned' THEN
        INSERT INTO book_inventory_logs (
            book_id, 
            action_type, 
            quantity_change, 
            reason, 
            performed_by, 
            school_id
        ) VALUES (
            NEW.book_id, 
            'added', 
            1, 
            'Book returned by member', 
            NEW.returned_by, 
            NEW.school_id
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for book transactions
DROP TRIGGER IF EXISTS book_transaction_inventory_trigger ON book_transactions;
CREATE TRIGGER book_transaction_inventory_trigger
    AFTER INSERT OR UPDATE ON book_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_book_inventory_on_transaction();
