-- Drop existing function if it exists
DROP FUNCTION IF EXISTS clone_academic_structure(source_year_id UUID, target_year_id UUID, clone_courses BOOLEAN, clone_batches BOOLEAN, clone_subjects BOOLEAN, clone_grading BOOLEAN, clone_electives BOOLEAN);

-- Create function to clone academic structure with proper table qualifications
CREATE OR REPLACE FUNCTION clone_academic_structure(
  source_year_id UUID,
  target_year_id UUID,
  clone_courses BOOLEAN DEFAULT true,
  clone_batches BOOLEAN DEFAULT true,
  clone_subjects BOOLEAN DEFAULT true,
  clone_grading BOOLEAN DEFAULT false,
  clone_electives BOOLEAN DEFAULT false
) RETURNS JSONB AS $$
DECLARE
  source_year academic_years;
  target_year academic_years;
  courses_cloned INTEGER := 0;
  batches_cloned INTEGER := 0;
  subjects_cloned INTEGER := 0;
  grading_systems_cloned INTEGER := 0;
  elective_groups_cloned INTEGER := 0;
  source_course RECORD;
  target_course_id UUID;
  source_batch RECORD;
  target_batch_id UUID;
BEGIN
  -- Get source and target academic years
  SELECT * INTO source_year FROM academic_years ay WHERE ay.id = source_year_id;
  SELECT * INTO target_year FROM academic_years ay WHERE ay.id = target_year_id;
  
  -- Verify both academic years exist and belong to the same school
  IF source_year IS NULL OR target_year IS NULL THEN
    RAISE EXCEPTION 'Source or target academic year not found';
  END IF;
  
  IF source_year.school_id != target_year.school_id THEN
    RAISE EXCEPTION 'Source and target academic years must belong to the same school';
  END IF;

  -- Clone courses if requested
  IF clone_courses THEN
    FOR source_course IN 
      SELECT * FROM courses c WHERE c.academic_year_id = source_year_id
    LOOP
      INSERT INTO courses (
        name,
        description,
        academic_year_id,
        school_id,
        created_at,
        updated_at
      ) VALUES (
        source_course.name,
        source_course.description,
        target_year_id,
        source_course.school_id,
        NOW(),
        NOW()
      ) RETURNING id INTO target_course_id;
      
      courses_cloned := courses_cloned + 1;
      
      -- Clone batches if requested
      IF clone_batches THEN
        FOR source_batch IN 
          SELECT * FROM batches b WHERE b.course_id = source_course.id
        LOOP
          INSERT INTO batches (
            name,
            course_id,
            capacity,
            class_teacher_id,
            academic_year_id,
            is_active,
            is_archived,
            school_id,
            created_at,
            updated_at
          ) VALUES (
            source_batch.name,
            target_course_id,
            source_batch.capacity,
            source_batch.class_teacher_id,
            target_year_id,
            false,
            false,
            source_batch.school_id,
            NOW(),
            NOW()
          );
          
          batches_cloned := batches_cloned + 1;
        END LOOP;
      END IF;
    END LOOP;
  END IF;

  -- Clone subjects if requested
  IF clone_subjects THEN
    INSERT INTO subjects (
      name,
      code,
      description,
      category_id,
      is_core,
      is_language,
      max_marks,
      pass_marks,
      academic_year_id,
      school_id,
      created_at,
      updated_at
    )
    SELECT 
      s.name,
      s.code,
      s.description,
      s.category_id,
      s.is_core,
      s.is_language,
      s.max_marks,
      s.pass_marks,
      target_year_id,
      s.school_id,
      NOW(),
      NOW()
    FROM subjects s
    WHERE s.academic_year_id = source_year_id;
    
    GET DIAGNOSTICS subjects_cloned = ROW_COUNT;
  END IF;

  -- Clone grading systems if requested
  IF clone_grading THEN
    INSERT INTO grading_systems (
      name,
      description,
      type,
      academic_year_id,
      school_id,
      created_at,
      updated_at
    )
    SELECT 
      gs.name,
      gs.description,
      gs.type,
      target_year_id,
      gs.school_id,
      NOW(),
      NOW()
    FROM grading_systems gs
    WHERE gs.academic_year_id = source_year_id;
    
    GET DIAGNOSTICS grading_systems_cloned = ROW_COUNT;
  END IF;

  -- Clone elective groups if requested
  IF clone_electives THEN
    INSERT INTO elective_groups (
      name,
      description,
      academic_year_id,
      school_id,
      created_at,
      updated_at
    )
    SELECT 
      eg.name,
      eg.description,
      target_year_id,
      eg.school_id,
      NOW(),
      NOW()
    FROM elective_groups eg
    WHERE eg.academic_year_id = source_year_id;
    
    GET DIAGNOSTICS elective_groups_cloned = ROW_COUNT;
  END IF;

  -- Return the results
  RETURN jsonb_build_object(
    'courses_cloned', courses_cloned,
    'batches_cloned', batches_cloned,
    'subjects_cloned', subjects_cloned,
    'grading_systems_cloned', grading_systems_cloned,
    'elective_groups_cloned', elective_groups_cloned
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 