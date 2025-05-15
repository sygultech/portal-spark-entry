
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Check, Loader2, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AuthUserDetails, updateAuthUserDetails } from '@/utils/authUtils';
import { useAuth } from '@/contexts/AuthContext';

interface AuthUserDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  userData: AuthUserDetails | null;
  onRefresh: () => void;
}

const AuthUserDetailView: React.FC<AuthUserDetailViewProps> = ({
  isOpen,
  onClose,
  userData,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [editedUserData, setEditedUserData] = useState<AuthUserDetails | null>(userData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { profile } = useAuth();
  
  // Check if current user is a super admin
  const isSuperAdmin = profile?.role === 'super_admin';
  
  React.useEffect(() => {
    setEditedUserData(userData);
  }, [userData]);
  
  if (!editedUserData) return null;
  
  const handleToggleSetting = (field: keyof AuthUserDetails, value: boolean) => {
    if (!editedUserData) return;
    
    setEditedUserData({
      ...editedUserData,
      [field]: value
    });
  };

  const handleInputChange = (field: keyof AuthUserDetails, value: any) => {
    if (!editedUserData) return;
    
    setEditedUserData({
      ...editedUserData,
      [field]: value
    });
  };
  
  const updateUserMetadata = (key: string, value: any) => {
    if (!editedUserData) return;
    
    const newMetadata = {
      ...editedUserData.user_metadata,
      [key]: value
    };
    
    setEditedUserData({
      ...editedUserData,
      user_metadata: newMetadata
    });
  };
  
  const handleSaveChanges = async () => {
    if (!editedUserData) return;
    
    setIsSubmitting(true);
    try {
      const updateData = {
        email: editedUserData.email,
        phone: editedUserData.phone,
        emailConfirmed: editedUserData.email_confirmed,
        phoneConfirmed: editedUserData.phone_confirmed,
        isBanned: editedUserData.is_banned,
        userMetadata: editedUserData.user_metadata,
        appMetadata: editedUserData.app_metadata
      };
      
      const { success, error } = await updateAuthUserDetails(editedUserData.id, updateData);
      
      if (success) {
        toast({
          title: "User updated",
          description: "User details have been saved successfully",
        });
        onRefresh();
      } else {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update user details",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Authentication Details</DialogTitle>
          <DialogDescription>
            View and manage authentication details for this user.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="metadata">Metadata</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input 
                      value={editedUserData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)} 
                      disabled={!isSuperAdmin}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone</label>
                    <Input 
                      value={editedUserData.phone || ''} 
                      onChange={(e) => handleInputChange('phone', e.target.value)} 
                      disabled={!isSuperAdmin}
                      placeholder="No phone number"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <div className="bg-muted p-2 rounded text-sm font-mono overflow-auto">
                      {editedUserData.id}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Role</label>
                    <div className="bg-muted p-2 rounded text-sm">
                      {editedUserData.role || 'authenticated'}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Created At</label>
                    <div className="bg-muted p-2 rounded text-sm">
                      {formatDate(editedUserData.created_at)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Sign In</label>
                    <div className="bg-muted p-2 rounded text-sm">
                      {formatDate(editedUserData.last_sign_in_at)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Status & Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Email Confirmed</h4>
                    <p className="text-sm text-muted-foreground">User has verified their email address</p>
                  </div>
                  <Switch 
                    checked={editedUserData.email_confirmed}
                    onCheckedChange={(checked) => handleToggleSetting('email_confirmed', checked)}
                    disabled={!isSuperAdmin}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Phone Confirmed</h4>
                    <p className="text-sm text-muted-foreground">User has verified their phone number</p>
                  </div>
                  <Switch 
                    checked={editedUserData.phone_confirmed}
                    onCheckedChange={(checked) => handleToggleSetting('phone_confirmed', checked)}
                    disabled={!isSuperAdmin}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Banned</h4>
                    <p className="text-sm text-muted-foreground">Prevent user from signing in</p>
                    {editedUserData.is_banned && (
                      <Badge variant="destructive" className="mt-1">Banned until: {formatDate(editedUserData.banned_until)}</Badge>
                    )}
                  </div>
                  <Switch 
                    checked={editedUserData.is_banned}
                    onCheckedChange={(checked) => handleToggleSetting('is_banned', checked)}
                    disabled={!isSuperAdmin}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Authentication Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <h4 className="text-sm font-medium">Confirmation Sent</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedUserData.confirmation_sent_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Confirmed At</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedUserData.confirmed_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Invited At</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedUserData.invited_at)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <h4 className="text-sm font-medium">Recovery Sent</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedUserData.recovery_sent_at)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Last Email Change</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(editedUserData.email_change_sent_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Metadata Tab */}
          <TabsContent value="metadata" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editedUserData.user_metadata && Object.entries(editedUserData.user_metadata).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-2 items-center">
                    <div className="font-medium">{key}</div>
                    <div className="col-span-2">
                      <Input 
                        value={typeof value === 'string' ? value : JSON.stringify(value)}
                        onChange={(e) => updateUserMetadata(key, e.target.value)}
                        disabled={!isSuperAdmin}
                      />
                    </div>
                  </div>
                ))}
                
                {(!editedUserData.user_metadata || Object.keys(editedUserData.user_metadata).length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    No user metadata available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">App Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-40">
                  <pre>{JSON.stringify(editedUserData.app_metadata, null, 2)}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Advanced Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <span className="font-medium">Is Super Admin</span>
                    <Badge>{editedUserData.is_super_admin ? 'Yes' : 'No'}</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <span className="font-medium">Is SSO User</span>
                    <Badge>{editedUserData.is_sso_user ? 'Yes' : 'No'}</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <span className="font-medium">Is Anonymous</span>
                    <Badge>{editedUserData.is_anonymous ? 'Yes' : 'No'}</Badge>
                  </div>
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <span className="font-medium">Deleted At</span>
                    <Badge variant={editedUserData.deleted_at ? "destructive" : "outline"}>
                      {editedUserData.deleted_at ? formatDate(editedUserData.deleted_at) : 'Active'}
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">All Raw Properties</h4>
                  <div className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-60">
                    <pre>{JSON.stringify(editedUserData, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={isSubmitting || !isSuperAdmin}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>Save Changes</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthUserDetailView;
