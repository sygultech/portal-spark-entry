-- Insert default departments
INSERT INTO departments (name, description, school_id) VALUES
    ('Mathematics', 'Mathematics Department', (SELECT id FROM schools LIMIT 1)),
    ('Science', 'Science Department', (SELECT id FROM schools LIMIT 1)),
    ('English', 'English Department', (SELECT id FROM schools LIMIT 1)),
    ('Administration', 'Administration Department', (SELECT id FROM schools LIMIT 1)),
    ('Physical Education', 'Physical Education Department', (SELECT id FROM schools LIMIT 1));

-- Insert default designations
INSERT INTO designations (name, description, department_id, school_id) VALUES
    ('Teacher', 'Teaching Staff', (SELECT id FROM departments LIMIT 1), (SELECT id FROM schools LIMIT 1)),
    ('Principal', 'School Principal', (SELECT id FROM departments LIMIT 1), (SELECT id FROM schools LIMIT 1)),
    ('Vice Principal', 'Vice Principal', (SELECT id FROM departments LIMIT 1), (SELECT id FROM schools LIMIT 1)),
    ('Administrator', 'Administrative Staff', (SELECT id FROM departments LIMIT 1), (SELECT id FROM schools LIMIT 1)),
    ('Coordinator', 'Department Coordinator', (SELECT id FROM departments LIMIT 1), (SELECT id FROM schools LIMIT 1)); 