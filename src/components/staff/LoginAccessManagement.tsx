
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Search, Key, Lock } from "lucide-react";

const LoginAccessManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Mock users data
  const users = [
    { id: "1", name: "John Doe", email: "john@example.com", role: "teacher", active: true, lastLogin: "2023-05-15 10:30" },
    { id: "2", name: "Jane Smith", email: "jane@example.com", role: "school_admin", active: true, lastLogin: "2023-05-20 14:45" },
    { id: "3", name: "Robert Johnson", email: "robert@example.com", role: "teacher", active: false, lastLogin: "2023-04-10 09:15" }
  ];

  const handleToggleAccess = (id: string) => {
    toast({
      title: "Access updated",
      description: "User access has been updated successfully",
    });
  };

  const handleResetPassword = () => {
    toast({
      title: "Password reset",
      description: "Password reset link has been sent to the user's email",
    });
    setResetPasswordOpen(false);
  };

  const handleRoleChange = (id: string, role: string) => {
    toast({
      title: "Role updated",
      description: "User role has been updated successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Login Access Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-8" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school_admin">School Admin</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{user.lastLogin || "Never"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.active} 
                        onCheckedChange={() => handleToggleAccess(user.id)} 
                      />
                      <span>{user.active ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user.name);
                        setResetPasswordOpen(true);
                      }}
                    >
                      <Key className="h-4 w-4 mr-1" /> Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to reset the password for {selectedUser}?</p>
            <p className="text-muted-foreground text-sm mt-2">
              A password reset link will be sent to the user's email address.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              <Lock className="h-4 w-4 mr-1" />
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginAccessManagement;
