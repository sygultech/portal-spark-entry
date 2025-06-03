-- Fix the column name case in timetable_configurations table
ALTER TABLE "public"."timetable_configurations" RENAME COLUMN "Fortnight_Start_Date" TO "fortnight_start_date"; 