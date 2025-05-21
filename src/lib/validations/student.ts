import * as z from "zod";

export const studentFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().email("Invalid email address").optional()
  ),
  admission_number: z.string().min(1, "Admission number is required"),
  gender: z.string().min(1, "Gender is required"),
  batch_id: z.string().min(1, "Batch is required"),
  date_of_birth: z.string().optional(),
  address: z.string().optional(),
  nationality: z.string().optional(),
  mother_tongue: z.string().optional(),
  blood_group: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  category: z.string().optional(),
  phone: z.string().optional(),
  previous_school_name: z.string().optional(),
  previous_school_board: z.string().optional(),
  previous_school_year: z.string().optional(),
  previous_school_percentage: z.number().optional(),
  guardians: z.array(z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    relation: z.string().min(1, "Relation is required"),
    occupation: z.string().optional(),
    email: z.string().email("Invalid email address").optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    is_emergency_contact: z.boolean().optional(),
    can_pickup: z.boolean().optional(),
    is_primary: z.boolean().optional()
  })).optional()
}); 
// force update
