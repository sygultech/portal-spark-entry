import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { AuthUserDetails, updateAuthUserDetails } from '@/utils/authUtils';
import { useAuth } from '@/contexts/AuthContext';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

interface AuthUserDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  userData: AuthUserDetails | null;
  onRefresh: () => void;
}

interface UserMetadataField {
  key: string;
  value: any;
}

const AuthUserDetailView: React.FC<AuthUserDetailViewProps> = ({
  isOpen,
  onClose,
  userData,
  onRefresh
}) => {
  const [editedUserData, setEditedUserData] = useState<AuthUserDetails | null>(userData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userMetadataFields, setUserMetadataFields] = useState<UserMetadataField[]>([]);
  const { profile } = useAuth();
  
  // Check if current user is a super admin
  const isSuperAdmin = profile?.role === 'super_admin';
  
  React.useEffect(() => {
    setEditedUserData(userData);
    
    // Convert user_metadata object to array of fields
    if (userData?.user_metadata) {
      const metadataEntries = Object.entries(userData.user_metadata).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : value
      }));
      setUserMetadataFields(metadataEntries);
    } else {
      setUserMetadataFields([]);
    }
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
  
  const handleMetadataKeyChange = (index: number, newKey: string) => {
    const updatedFields = [...userMetadataFields];
    updatedFields[index].key = newKey;
    setUserMetadataFields(updatedFields);
    updateUserMetadataFromFields(updatedFields);
  };
  
  const handleMetadataValueChange = (index: number, newValue: string) => {
    const updatedFields = [...userMetadataFields];
    updatedFields[index].value = newValue;
    setUserMetadataFields(updatedFields);
    updateUserMetadataFromFields(updatedFields);
  };
  
  const addMetadataField = () => {
    setUserMetadataFields([...userMetadataFields, { key: '', value: '' }]);
  };
  
  const removeMetadataField = (index: number) => {
    const updatedFields = userMetadataFields.filter((_, i) => i !== index);
    setUserMetadataFields(updatedFields);
    updateUserMetadataFromFields(updatedFields);
  };
  
  const updateUserMetadataFromFields = (fields: UserMetadataField[]) => {
    if (!editedUserData) return;
    
    // Convert array of fields back to object
    const metadata: Record<string, any> = {};
    
    fields.forEach(field => {
      if (field.key) {
        let processedValue = field.value;
        
        // Try to parse the value as JSON if it looks like JSON
        if (typeof processedValue === 'string') {
          try {
            if (processedValue.trim().startsWith('{') || processedValue.trim().startsWith('[')) {
              processedValue = JSON.parse(processedValue);
            }
          } catch (e) {
            // If parsing fails, keep the original string
          }
        }
        
        metadata[field.key] = processedValue;
      }
    });
    
    setEditedUserData({
      ...editedUserData,
      user_metadata: metadata
    });
  };
  
  const handleSaveChanges = async () => {
    if (!editedUserData) return;
    
    setIsSubmitting(true);
    try {
      // Prepare user metadata from the fields
      const userMetadata = editedUserData.user_metadata;
      
      const updateData = {
        email: editedUserData.email,
        phone: editedUserData.phone,
        emailConfirmed: editedUserData.email_confirmed,
        phoneConfirmed: editedUserData.phone_confirmed,
        isBanned: editedUserData.is_banned,
        confirmationToken: editedUserData.confirmation_token,
        confirmationSentAt: editedUserData.confirmation_sent_at,
        instanceId: editedUserData.instance_id,
        userMetadata,  // This is already processed as an object
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

        <div className="space-y-6">
          {/* User Basic Info */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={editedUserData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isSuperAdmin}
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editedUserData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isSuperAdmin}
                    placeholder="No phone number"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="userId">User ID</Label>
                  <div className="bg-muted p-2 rounded text-sm font-mono overflow-auto">
                    {editedUserData.id}
                  </div>
                </div>
                
                <div>
                  <Label>Created</Label>
                  <div className="bg-muted p-2 rounded text-sm">
                    {formatDate(editedUserData.created_at)}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="instance_id">Instance ID</Label>
                <Input
                  id="instance_id"
                  value={editedUserData.instance_id || ''}
                  onChange={(e) => handleInputChange('instance_id', e.target.value)}
                  disabled={!isSuperAdmin}
                  placeholder="No instance ID"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Account Status */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Account Status</h3>
              
              <div className="space-y-4">
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
              </div>
            </CardContent>
          </Card>

          {/* Confirmation & Token */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Confirmation Details</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="confirmation_token">Confirmation Token</Label>
                  <Input
                    id="confirmation_token"
                    value={editedUserData.confirmation_token || ''}
                    onChange={(e) => handleInputChange('confirmation_token', e.target.value)}
                    disabled={!isSuperAdmin}
                    placeholder="No confirmation token"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmation_sent_at">Confirmation Sent At</Label>
                  <Input
                    id="confirmation_sent_at"
                    value={editedUserData.confirmation_sent_at || ''}
                    onChange={(e) => handleInputChange('confirmation_sent_at', e.target.value)}
                    disabled={!isSuperAdmin}
                    placeholder="No confirmation sent date"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Format: YYYY-MM-DD HH:MM:SS+00 (e.g. 2025-05-15 10:30:00+00)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* User Metadata */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">User Metadata</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addMetadataField}
                  disabled={!isSuperAdmin}
                >
                  Add Field
                </Button>
              </div>
              
              {userMetadataFields.map((field, index) => (
                <div key={index} className="grid grid-cols-8 gap-2 items-center">
                  <Input
                    className="col-span-3"
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) => handleMetadataKeyChange(index, e.target.value)}
                    disabled={!isSuperAdmin}
                  />
                  <Input
                    className="col-span-4"
                    placeholder="Value"
                    value={typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value)}
                    onChange={(e) => handleMetadataValueChange(index, e.target.value)}
                    disabled={!isSuperAdmin}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeMetadataField(index)}
                    disabled={!isSuperAdmin} 
                    className="col-span-1"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              {userMetadataFields.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No user metadata available
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* App Metadata */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">App Metadata</h3>
              <Textarea
                rows={5}
                className="font-mono text-xs"
                value={JSON.stringify(editedUserData.app_metadata, null, 2)}
                readOnly
              />
            </CardContent>
          </Card>
          
          {/* Additional Properties */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-medium">Additional Properties</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Label>Is Super Admin</Label>
                  <Badge className="w-fit mt-1">
                    {editedUserData.is_super_admin ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex flex-col">
                  <Label>Is SSO User</Label>
                  <Badge className="w-fit mt-1">
                    {editedUserData.is_sso_user ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
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

// force update

// force update
