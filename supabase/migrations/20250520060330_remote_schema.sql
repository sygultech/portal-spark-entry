create policy "School admins can access their school's student files"
on "storage"."objects"
as permissive
for all
to public
using (((bucket_id = 'student_files'::text) AND (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'school_admin'::user_role)))))
with check (((bucket_id = 'student_files'::text) AND (auth.uid() IN ( SELECT profiles.id
   FROM profiles
  WHERE (profiles.role = 'school_admin'::user_role)))));



