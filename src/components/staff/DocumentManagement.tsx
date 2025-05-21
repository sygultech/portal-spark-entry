
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, Download, FileText, FilePlus, Mail, Plus, Search, Filter, AlertTriangle } from "lucide-react";

const DocumentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [documentType, setDocumentType] = useState("all");
  const [activeTab, setActiveTab] = useState("documents");
  const { toast } = useToast();
  
  // Mock document data
  const documents = [
    { id: 1, name: "Employment Contract", staffName: "John Doe", type: "Contract", uploadDate: "2023-01-15", expiry: "2024-01-15", status: "Active" },
    { id: 2, name: "Teaching Certificate", staffName: "Sarah Williams", type: "Certificate", uploadDate: "2022-06-10", expiry: null, status: "Active" },
    { id: 3, name: "ID Proof", staffName: "Michael Brown", type: "Identity", uploadDate: "2022-11-05", expiry: "2027-11-04", status: "Active" },
    { id: 4, name: "Professional License", staffName: "Jennifer Davis", type: "License", uploadDate: "2022-09-15", expiry: "2023-09-15", status: "Expired" },
    { id: 5, name: "COVID Vaccination", staffName: "Robert Johnson", type: "Medical", uploadDate: "2021-05-20", expiry: null, status: "Active" },
  ];

  // Mock staff certificates data
  const certificates = [
    { 
      id: 1, 
      name: "Experience Certificate", 
      staffName: "Emily Wilson", 
      issuedDate: "2023-05-10", 
      type: "Experience", 
      status: "Issued" 
    },
    { 
      id: 2, 
      name: "Salary Certificate", 
      staffName: "John Doe", 
      issuedDate: "2023-04-15", 
      type: "Salary", 
      status: "Drafted" 
    },
    { 
      id: 3, 
      name: "Appreciation Letter", 
      staffName: "Sarah Williams", 
      issuedDate: "2023-03-01", 
      type: "Appreciation", 
      status: "Issued" 
    },
  ];
  
  // Mock certificate templates
  const certificateTemplates = [
    { id: 1, name: "Experience Certificate", type: "Experience", lastUpdated: "2023-01-10" },
    { id: 2, name: "Salary Certificate", type: "Salary", lastUpdated: "2023-02-15" },
    { id: 3, name: "Appreciation Letter", type: "Appreciation", lastUpdated: "2023-03-20" },
    { id: 4, name: "Relieving Letter", type: "Relieving", lastUpdated: "2023-04-05" },
  ];

  const expiringDocuments = documents.filter(doc => doc.expiry && new Date(doc.expiry) < new Date("2024-01-01"));

  const handleUpload = () => {
    toast({
      title: "Document uploaded",
      description: "The document has been successfully uploaded",
    });
  };
  
  const handleIssueCertificate = () => {
    toast({
      title: "Certificate generated",
      description: "The certificate has been successfully generated",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="documents">Staff Documents</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="templates">Certificate Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-6">
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
                        <SelectItem value="License">Licenses</SelectItem>
                        <SelectItem value="Medical">Medical Documents</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" /> Upload Document
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
                              <SelectItem value="License">License</SelectItem>
                              <SelectItem value="Medical">Medical Document</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                          <Input id="expiryDate" type="date" />
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
              
              {expiringDocuments.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <div className="flex gap-2 items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-medium text-yellow-800">Expiring Documents</h3>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    {expiringDocuments.length} document(s) will expire soon. Please review and renew them.
                  </p>
                </div>
              )}
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents
                    .filter(doc => documentType === "all" || doc.type === documentType)
                    .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             doc.staffName.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.name}</TableCell>
                      <TableCell>{doc.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{doc.type}</Badge>
                      </TableCell>
                      <TableCell>{doc.uploadDate}</TableCell>
                      <TableCell>{doc.expiry || "No Expiry"}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === "Active" ? "success" : "destructive"}>
                          {doc.status}
                        </Badge>
                      </TableCell>
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
              
              {documents.filter(doc => documentType === "all" || doc.type === documentType)
                .filter(doc => doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        doc.staffName.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No documents found with the current filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="certificates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Staff Certificates</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <FilePlus className="mr-2 h-4 w-4" /> Issue Certificate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Issue New Certificate</DialogTitle>
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
                      <Label htmlFor="certificateType">Certificate Type</Label>
                      <Select>
                        <SelectTrigger id="certificateType">
                          <SelectValue placeholder="Select certificate type" />
                        </SelectTrigger>
                        <SelectContent>
                          {certificateTemplates.map(template => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Issue Date</Label>
                      <Input id="issueDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="remarks">Remarks (Optional)</Label>
                      <Input id="remarks" placeholder="Enter any additional information" />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="sendEmail" />
                      <Label htmlFor="sendEmail">Send certificate to staff via email</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleIssueCertificate}>Issue Certificate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-8" 
                  placeholder="Search certificates..." 
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate</TableHead>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Issued Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-medium">{cert.name}</TableCell>
                      <TableCell>{cert.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{cert.type}</Badge>
                      </TableCell>
                      <TableCell>{cert.issuedDate}</TableCell>
                      <TableCell>
                        <Badge variant={cert.status === "Issued" ? "success" : "outline"}>
                          {cert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" /> Download
                          </Button>
                          {cert.status === "Issued" && (
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-1" /> Resend
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Certificate Templates</CardTitle>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificateTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Type:</span>
                        <span className="text-sm">{template.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated:</span>
                        <span className="text-sm">{template.lastUpdated}</span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" size="sm" className="flex-1">Edit</Button>
                        <Button variant="outline" size="sm" className="flex-1">Preview</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentManagement;
