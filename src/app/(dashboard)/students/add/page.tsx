
import { AddStudentForm } from '@/components/students/AddStudentForm';
import { useAuth } from '@/hooks/useAuth';

export default function AddStudentPage() {
  const { user } = useAuth();

  if (!user?.primary_school_id) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">You must be associated with a school to add students.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <AddStudentForm 
          isOpen={true}
          onClose={() => {
            // Handle close
          }}
          onSubmit={async (data) => {
            // Convert to async function by adding async keyword and returning a Promise
            // Handle submission logic here
            return Promise.resolve();
          }} 
        />
      </div>
    </div>
  );
}
