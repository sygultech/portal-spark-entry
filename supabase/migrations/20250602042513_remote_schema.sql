alter table "public"."certificates" drop constraint "certificates_status_check";

alter table "public"."disciplinary_records" drop constraint "disciplinary_records_severity_check";

alter table "public"."disciplinary_records" drop constraint "disciplinary_records_status_check";

alter table "public"."student_documents" drop constraint "student_documents_verification_status_check";

alter table "public"."transfer_records" drop constraint "transfer_records_status_check";

alter table "public"."transfer_records" drop constraint "transfer_records_type_check";

alter table "public"."certificates" add constraint "certificates_status_check" CHECK (((status)::text = ANY ((ARRAY['draft'::character varying, 'issued'::character varying, 'revoked'::character varying])::text[]))) not valid;

alter table "public"."certificates" validate constraint "certificates_status_check";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_severity_check" CHECK (((severity)::text = ANY ((ARRAY['minor'::character varying, 'moderate'::character varying, 'severe'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_severity_check";

alter table "public"."disciplinary_records" add constraint "disciplinary_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'resolved'::character varying, 'escalated'::character varying])::text[]))) not valid;

alter table "public"."disciplinary_records" validate constraint "disciplinary_records_status_check";

alter table "public"."student_documents" add constraint "student_documents_verification_status_check" CHECK (((verification_status)::text = ANY ((ARRAY['pending'::character varying, 'verified'::character varying, 'rejected'::character varying])::text[]))) not valid;

alter table "public"."student_documents" validate constraint "student_documents_verification_status_check";

alter table "public"."transfer_records" add constraint "transfer_records_status_check" CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_status_check";

alter table "public"."transfer_records" add constraint "transfer_records_type_check" CHECK (((type)::text = ANY ((ARRAY['internal'::character varying, 'external'::character varying])::text[]))) not valid;

alter table "public"."transfer_records" validate constraint "transfer_records_type_check";


