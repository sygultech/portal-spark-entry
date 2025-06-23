
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Search, 
  Download, 
  Lock, 
  User, 
  Calendar,
  FileText,
  AlertTriangle,
  Eye,
  Settings,
  CheckCircle,
  Clock
} from 'lucide-react';

const AuditingCompliance = () => {
  const [activeTab, setActiveTab] = useState('audit-trail');

  // Mock audit trail data
  const auditTrail = [
    {
      id: 'AT001',
      timestamp: '2024-01-15 14:30:25',
      user: 'John Smith',
      role: 'Finance Officer',
      action: 'Payment Recorded',
      description: 'Fee payment recorded for Sarah Wilson - ₹5,500',
      ipAddress: '192.168.1.100',
      module: 'Fee Collection',
      status: 'success'
    },
    {
      id: 'AT002',
      timestamp: '2024-01-15 11:20:15',
      user: 'Admin User',
      role: 'School Admin',
      action: 'Budget Modified',
      description: 'Academic department budget increased by ₹50,000',
      ipAddress: '192.168.1.101',
      module: 'Budget Management',
      status: 'success'
    },
    {
      id: 'AT003',
      timestamp: '2024-01-15 09:45:10',
      user: 'Jane Doe',
      role: 'Accountant',
      action: 'Expense Deleted',
      description: 'Attempted to delete expense record EXP-2024-001',
      ipAddress: '192.168.1.102',
      module: 'Expense Management',
      status: 'blocked'
    },
    {
      id: 'AT004',
      timestamp: '2024-01-14 16:15:30',
      user: 'Finance Manager',
      role: 'Finance Manager',
      action: 'Report Generated',
      description: 'Monthly financial report exported',
      ipAddress: '192.168.1.103',
      module: 'Reports',
      status: 'success'
    }
  ];

  const accessRoles = [
    {
      role: 'Super Admin',
      permissions: ['Full Access', 'User Management', 'System Settings'],
      users: 2,
      description: 'Complete system access'
    },
    {
      role: 'School Admin',
      permissions: ['Finance Management', 'Budget Approval', 'Report Generation'],
      users: 3,
      description: 'School-level administrative access'
    },
    {
      role: 'Finance Officer',
      permissions: ['Fee Collection', 'Expense Recording', 'Transaction Management'],
      users: 5,
      description: 'Daily financial operations'
    },
    {
      role: 'Accountant',
      permissions: ['View Reports', 'Transaction Verification'],
      users: 2,
      description: 'Read-only access with verification rights'
    }
  ];

  const complianceChecks = [
    {
      category: 'GST Compliance',
      status: 'compliant',
      lastCheck: '2024-01-15',
      issues: 0,
      description: 'Tax calculations and reporting up to date'
    },
    {
      category: 'Data Security',
      status: 'compliant',
      lastCheck: '2024-01-14',
      issues: 0,
      description: 'All financial data properly encrypted'
    },
    {
      category: 'Audit Requirements',
      status: 'warning',
      lastCheck: '2024-01-10',
      issues: 2,
      description: 'Missing documentation for 2 transactions'
    },
    {
      category: 'Financial Reporting',
      status: 'compliant',
      lastCheck: '2024-01-12',
      issues: 0,
      description: 'All required reports generated on time'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'compliant': return 'default';
      case 'warning': return 'secondary';
      case 'blocked':
      case 'non-compliant': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'blocked':
      case 'non-compliant': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Auditing & Compliance</h2>
          <p className="text-muted-foreground">Monitor system security and ensure regulatory compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Audit Log
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Audit Entries</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <User className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">With finance access</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">Excellent rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Locked Periods</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Lock className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Financial periods</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="access-control">Access Control</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>

        {/* Audit Trail Tab */}
        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Trail</CardTitle>
              <CardDescription>Complete log of all financial system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search audit logs..." className="max-w-sm" />
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date Range
                </Button>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  User Filter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditTrail.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-mono text-sm">{entry.timestamp}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{entry.user}</div>
                          <div className="text-sm text-muted-foreground">{entry.role}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.action}</Badge>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>{entry.module}</TableCell>
                      <TableCell className="font-mono text-sm">{entry.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(entry.status)}
                          <Badge variant={getStatusColor(entry.status)}>
                            {entry.status}
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Control Tab */}
        <TabsContent value="access-control" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
              <CardDescription>Manage user roles and permissions for financial modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {accessRoles.map((role, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{role.role}</h4>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{role.users} users</div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, idx) => (
                        <Badge key={idx} variant="secondary">{permission}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>Monitor currently logged-in users with finance access</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { user: 'John Smith', role: 'Finance Officer', loginTime: '09:30 AM', ip: '192.168.1.100', lastActivity: '2 min ago' },
                    { user: 'Jane Doe', role: 'Accountant', loginTime: '08:45 AM', ip: '192.168.1.102', lastActivity: '15 min ago' },
                    { user: 'Admin User', role: 'School Admin', loginTime: '08:00 AM', ip: '192.168.1.101', lastActivity: '5 min ago' },
                  ].map((session, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{session.user}</TableCell>
                      <TableCell>{session.role}</TableCell>
                      <TableCell>{session.loginTime}</TableCell>
                      <TableCell className="font-mono text-sm">{session.ip}</TableCell>
                      <TableCell>{session.lastActivity}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Monitor
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>Monitor regulatory and internal compliance requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.category}</div>
                        <div className="text-sm text-muted-foreground">{check.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        Last check: {check.lastCheck}
                      </div>
                      {check.issues > 0 && (
                        <div className="text-sm text-red-600">
                          {check.issues} issues found
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Period Lock</CardTitle>
              <CardDescription>Lock completed financial periods to prevent backdated changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { period: 'April 2023', status: 'locked', lockDate: '2023-05-15', lockedBy: 'Finance Manager' },
                  { period: 'May 2023', status: 'locked', lockDate: '2023-06-15', lockedBy: 'Finance Manager' },
                  { period: 'June 2023', status: 'locked', lockDate: '2023-07-15', lockedBy: 'Finance Manager' },
                  { period: 'July 2023', status: 'open', lockDate: null, lockedBy: null },
                ].map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {period.status === 'locked' ? 
                        <Lock className="h-5 w-5 text-red-500" /> : 
                        <Clock className="h-5 w-5 text-green-500" />
                      }
                      <div>
                        <div className="font-medium">{period.period}</div>
                        {period.lockDate && (
                          <div className="text-sm text-muted-foreground">
                            Locked on {period.lockDate} by {period.lockedBy}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={period.status === 'locked' ? 'destructive' : 'default'}>
                        {period.status}
                      </Badge>
                      {period.status === 'open' && (
                        <Button variant="outline" size="sm">
                          <Lock className="h-4 w-4 mr-2" />
                          Lock Period
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Configure security settings for the financial system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all finance users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">IP Restriction</Label>
                    <p className="text-sm text-muted-foreground">Limit access to specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Audit Log Retention</Label>
                    <p className="text-sm text-muted-foreground">Keep audit logs for compliance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Data Encryption</Label>
                    <p className="text-sm text-muted-foreground">Encrypt sensitive financial data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Recovery</CardTitle>
              <CardDescription>Configure data backup and recovery settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Automatic Backups</div>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Daily backups at 2:00 AM with 30-day retention
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Configure</Button>
                    <Button variant="outline" size="sm">Test Restore</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">Last Backup</div>
                    <div className="text-sm text-muted-foreground">Today, 2:00 AM</div>
                  </div>
                  <div className="text-sm text-green-600">Backup completed successfully</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuditingCompliance;
