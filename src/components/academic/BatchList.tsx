
import { Button } from "@/components/ui/button";
import { Batch } from "@/types/academic";
import { Plus, Edit, Trash, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BatchListProps {
  batches: Batch[];
  courseId: string;
  academicYearId: string;
}

const BatchList = ({ batches, courseId, academicYearId }: BatchListProps) => {
  const { toast } = useToast();
  
  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} functionality will be available soon.`
    });
  };
  
  return (
    <div className="space-y-2">
      {batches.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-muted-foreground text-sm">No batches created yet for this course</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => handleAction("Add Batch")}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Batch
          </Button>
        </div>
      ) : (
        <>
          {batches.map(batch => (
            <div 
              key={batch.id}
              className="flex items-center justify-between p-3 border rounded-md" 
            >
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">{batch.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {batch.capacity && `Capacity: ${batch.capacity} students`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleAction("Manage Students")}
                >
                  <Users className="h-4 w-4 mr-1" /> Students
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => handleAction("Edit Batch")}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => handleAction("Delete Batch")}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default BatchList;

// force update

// force update
