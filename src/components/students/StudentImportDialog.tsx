
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Download, AlertCircle } from "lucide-react";

interface StudentImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any) => void;
}

export default function StudentImportDialog({
  isOpen,
  onClose,
  onImport,
}: StudentImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);
    
    // Simulate preview generation
    setTimeout(() => {
      setPreview([
        { first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com' },
        { first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@example.com' },
        // More preview data would go here in a real implementation
      ]);
    }, 500);
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    
    try {
      // This is a placeholder for the actual import logic
      // In a real implementation, you would parse the CSV file and process the data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pass the parsed data to the parent component
      onImport(preview);
    } catch (err) {
      setError('An error occurred during import');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Create a template CSV
    const template = 'first_name,last_name,email,gender,date_of_birth,phone,address,admission_date\n';
    
    // Create a blob and download it
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'student_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Students</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Download the CSV template, fill it with student data, and upload it back.
            </p>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          
          {preview.length > 0 && (
            <div>
              <Label>Preview (first 2 rows)</Label>
              <div className="border rounded-md mt-1 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">First Name</th>
                      <th className="p-2 text-left">Last Name</th>
                      <th className="p-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{row.first_name}</td>
                        <td className="p-2">{row.last_name}</td>
                        <td className="p-2">{row.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The full import will include all rows from your CSV file.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={!file || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <FileUp className="h-4 w-4" />
                <span>Import Students</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// force update

// force update
