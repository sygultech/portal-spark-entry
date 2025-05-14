import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

import { 
  Calendar, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Clock, 
  HardDrive, 
  Users, 
  BookOpen,
  Bus,
  FileText,
  Package,
  Users2,
  Video,
  Check,
  X,
} from "lucide-react";

import type { School } from "@/types/school";

interface SchoolDetailViewProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
}

// Define interfaces for our new data types
interface TenantStats {
  id: string;
  school_id: string;
  students_count: number;
  teachers_count: number;
  parents_count: number;
  storage_used: number;
  last_active_date: string;
  created_at: string;
  updated_at: string;
}

interface Subscription {
  id: string;
  school_id: string;
  plan_name: string;
  start_date: string;
  expiry_date: string | null;
  payment_method: string | null;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

const SchoolDetailView: React.FC<SchoolDetailViewProps> = ({
  isOpen,
  onClose,
  school,
}) => {
  // Fetch school details including stats
  const { data: tenantStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['tenant-stats', school.id],
    queryFn: async () => {
      try {
        // Use any to bypass TypeScript error for now since tenant_stats is not in the generated types
        const { data, error } = await supabase
          .from('tenant_stats' as any)
          .select('*')
          .eq('school_id', school.id)
          .maybeSingle();
        
        if (error) throw error;
        return data as TenantStats | null;
      } catch (error) {
        console.error("Error fetching tenant stats:", error);
        return null;
      }
    },
    enabled: isOpen && !!school.id,
  });

  // Fetch subscription information
  const { data: subscription, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription', school.id],
    queryFn: async () => {
      try {
        // Use any to bypass TypeScript error for now since subscriptions is not in the generated types
        const { data, error } = await supabase
          .from('subscriptions' as any)
          .select('*')
          .eq('school_id', school.id)
          .maybeSingle();
        
        if (error) throw error;
        return data as Subscription | null;
      } catch (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }
    },
    enabled: isOpen && !!school.id,
  });

  // Fetch admin users for this school
  const { data: admins, isLoading: isAdminsLoading } = useQuery({
    queryKey: ['school-admins', school.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url')
        .eq('school_id', school.id)
        .eq('role', 'school_admin');
      
      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!school.id,
  });

  // Format created date
  const formattedDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Helper to get initials from name
  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>School Details</DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold">{school.name}</h2>
              <p className="text-muted-foreground">
                Created on {formattedDate(school.created_at)}
              </p>
            </div>
            <Badge variant={school.status === 'active' ? 'default' : 'destructive'} className="capitalize">
              {school.status || "Status N/A"}
            </Badge>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="admins">Administrators</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Admin Email</p>
                        <p>{school.admin_email || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Number</p>
                        <p>{school.contact_number || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Globe className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Domain</p>
                        <p>{school.domain || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Region</p>
                        <p>{school.region || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Timezone</p>
                        <p>{school.timezone || "Not set"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Updated</p>
                        <p>{formattedDate(school.updated_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isSubscriptionLoading ? (
                      Array(4).fill(0).map((_, index) => (
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-40" />
                        </div>
                      ))
                    ) : subscription ? (
                      <>
                        <div className="mb-4">
                          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-lg px-3 py-1 capitalize">
                            {subscription.plan_name}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p>{formattedDate(subscription.start_date)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                          <p>{subscription.expiry_date ? formattedDate(subscription.expiry_date) : "No expiry"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Method</p>
                          <p>{subscription.payment_method || "Not specified"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Auto Renewal</p>
                          <p>{subscription.auto_renew ? "Enabled" : "Disabled"}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mb-4">
                          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-lg px-3 py-1 capitalize">
                            {school.plan || "Free"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">No subscription details available</p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tenant Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Students</p>
                      <p className="text-xl font-bold">
                        {isStatsLoading ? (
                          <Skeleton className="h-7 w-12 inline-block" />
                        ) : (
                          tenantStats?.students_count || 0
                        )}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Teachers</p>
                      <p className="text-xl font-bold">
                        {isStatsLoading ? (
                          <Skeleton className="h-7 w-12 inline-block" />
                        ) : (
                          tenantStats?.teachers_count || 0
                        )}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Parents</p>
                      <p className="text-xl font-bold">
                        {isStatsLoading ? (
                          <Skeleton className="h-7 w-12 inline-block" />
                        ) : (
                          tenantStats?.parents_count || 0
                        )}
                      </p>
                    </div>
                    <div className="border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium">
                        {isStatsLoading ? (
                          <Skeleton className="h-5 w-28 inline-block" />
                        ) : (
                          tenantStats?.last_active_date 
                            ? format(new Date(tenantStats.last_active_date), "MMM d, yyyy")
                            : "Never"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Administrators Tab */}
            <TabsContent value="admins" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>School Administrators</CardTitle>
                </CardHeader>
                <CardContent>
                  {isAdminsLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : admins && admins.length > 0 ? (
                    <div className="space-y-4">
                      {admins.map((admin) => (
                        <div key={admin.id} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(admin.first_name, admin.last_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {admin.first_name} {admin.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {admin.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No administrators found for this school.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Usage Tab */}
            <TabsContent value="usage" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center">
                          <HardDrive className="h-4 w-4 mr-1" /> Storage Usage
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isStatsLoading ? (
                            <Skeleton className="h-4 w-24 inline-block" />
                          ) : (
                            `${tenantStats?.storage_used || 0} MB / ${school.storage_limit || 5120} MB`
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {isStatsLoading ? "..." : (
                          `${Math.round(((tenantStats?.storage_used || 0) / (school.storage_limit || 5120)) * 100)}%`
                        )}
                      </p>
                    </div>
                    <Progress 
                      value={isStatsLoading ? 0 : ((tenantStats?.storage_used || 0) / (school.storage_limit || 5120)) * 100}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="space-y-1">
                        <p className="font-medium flex items-center">
                          <Users className="h-4 w-4 mr-1" /> User Quota
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isStatsLoading ? (
                            <Skeleton className="h-4 w-24 inline-block" />
                          ) : (
                            `${(tenantStats?.students_count || 0) + (tenantStats?.teachers_count || 0) + (tenantStats?.parents_count || 0)} / ${school.user_limit || 100} Users`
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-medium">
                        {isStatsLoading ? "..." : (
                          `${Math.round((((tenantStats?.students_count || 0) + (tenantStats?.teachers_count || 0) + (tenantStats?.parents_count || 0)) / (school.user_limit || 100)) * 100)}%`
                        )}
                      </p>
                    </div>
                    <Progress 
                      value={
                        isStatsLoading ? 0 : 
                        (((tenantStats?.students_count || 0) + 
                          (tenantStats?.teachers_count || 0) + 
                          (tenantStats?.parents_count || 0)) / 
                          (school.user_limit || 100)) * 100
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modules Tab */}
            <TabsContent value="modules" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Modules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-primary" />
                        <p>Library Module</p>
                      </div>
                      {school.modules?.library ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Bus className="h-5 w-5 mr-2 text-primary" />
                        <p>Transport Module</p>
                      </div>
                      {school.modules?.transport ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        <p>Finance Module</p>
                      </div>
                      {school.modules?.finance ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-primary" />
                        <p>Inventory Module</p>
                      </div>
                      {school.modules?.inventory ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Users2 className="h-5 w-5 mr-2 text-primary" />
                        <p>Alumni Module</p>
                      </div>
                      {school.modules?.alumni ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <Video className="h-5 w-5 mr-2 text-primary" />
                        <p>Online Classes Module</p>
                      </div>
                      {school.modules?.online_classes ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDetailView;
