
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { FileText, Upload, Download, Search, Filter } from "lucide-react";

const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const { toast } = useToast();
  
  // Mock document data
  const documents = [
    { id: 1, name: "Employment Contract", staffName: "John Doe", type: "Contract", uploadDate: "2023-01-15", expiry: "2024-01-15", status: "Active" },
    { id: 2, name: "Teaching Certificate", staffName: "Sarah Williams", type: "Certificate", uploadDate: "2022-06-10", expiry: null, status: "Active" },
    { id: 3, name: "ID Proof", staffName: "Michael Brown", type: "Identity", uploadDate: "2022-11-05", expiry: "2027-11-04", status: "Active" },
  ];

  const handleUpload = () => {
    toast({
      title: "Document uploaded",
      description: "The document has been successfully uploaded",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Staff Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8" 
                placeholder="Search documents..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Document Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Contract">Contracts</SelectItem>
                    <SelectItem value="Certificate">Certificates</SelectItem>
                    <SelectItem value="Identity">ID Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" /> Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="staffMember">Staff Member</Label>
                      <Select>
                        <SelectTrigger id="staffMember">
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">John Doe</SelectItem>
                          <SelectItem value="2">Jane Smith</SelectItem>
                          <SelectItem value="3">Sarah Williams</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentName">Document Name</Label>
                      <Input id="documentName" placeholder="Enter document name" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type</Label>
                      <Select>
                        <SelectTrigger id="documentType">
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Certificate">Certificate</SelectItem>
                          <SelectItem value="Identity">ID Document</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentFile">Upload File</Label>
                      <Input id="documentFile" type="file" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleUpload}>Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Staff Member</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.name}</TableCell>
                  <TableCell>{doc.staffName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doc.type}</Badge>
                  </TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-1" /> Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentManagement;
