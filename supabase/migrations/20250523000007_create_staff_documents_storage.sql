-- Create storage bucket for staff documents
insert into storage.buckets (id, name, public)
values ('staff-documents', 'staff-documents', false);

-- Add RLS policies for staff_documents table
alter table "public"."staff_documents" enable row level security;

create policy "Staff documents are viewable by school admins"
on "public"."staff_documents"
for select
to authenticated
using (
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details where id = staff_documents.staff_id
    )
    and role = 'school_admin'
  )
);

create policy "Staff documents are insertable by school admins"
on "public"."staff_documents"
for insert
to authenticated
with check (
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details where id = staff_documents.staff_id
    )
    and role = 'school_admin'
  )
);

create policy "Staff documents are deletable by school admins"
on "public"."staff_documents"
for delete
to authenticated
using (
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details where id = staff_documents.staff_id
    )
    and role = 'school_admin'
  )
); 