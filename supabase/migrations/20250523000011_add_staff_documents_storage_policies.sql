-- Add storage policies for staff-documents bucket
create policy "Staff documents are viewable by school admins"
on storage.objects for select
to authenticated
using (
  bucket_id = 'staff-documents' and
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details 
      where id::text = (storage.foldername(name))[1]
    )
    and role = 'school_admin'
  )
);

create policy "Staff documents are insertable by school admins"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'staff-documents' and
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details 
      where id::text = (storage.foldername(name))[1]
    )
    and role = 'school_admin'
  )
);

create policy "Staff documents are updatable by school admins"
on storage.objects for update
to authenticated
using (
  bucket_id = 'staff-documents' and
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details 
      where id::text = (storage.foldername(name))[1]
    )
    and role = 'school_admin'
  )
);

create policy "Staff documents are deletable by school admins"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'staff-documents' and
  auth.uid() in (
    select id from profiles 
    where school_id = (
      select school_id from staff_details 
      where id::text = (storage.foldername(name))[1]
    )
    and role = 'school_admin'
  )
); 