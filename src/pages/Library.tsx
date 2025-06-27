
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Book, Users, FileText, Settings, BarChart3, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import { useLibraryStats } from '@/hooks/useLibrary';
import LibraryBooks from '@/components/library/LibraryBooks';
import LibraryMembers from '@/components/library/LibraryMembers';
import BookTransactions from '@/components/library/BookTransactions';
import LibraryReservations from '@/components/library/LibraryReservations';
import LibrarySettingsForm from '@/components/library/LibrarySettingsForm';

const Library = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: stats, isLoading: statsLoading } = useLibraryStats();

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string;
    value: number;
    icon: React.ElementType;
    description: string;
    trend?: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{statsLoading ? '...' : value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <Badge variant="secondary" className="mt-1">
            {trend}
          </Badge>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
          <p className="text-muted-foreground">Manage books, members, and transactions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Books"
              value={stats?.total_books || 0}
              icon={Book}
              description="Books in catalog"
            />
            <StatCard
              title="Active Members"
              value={stats?.total_members || 0}
              icon={Users}
              description="Registered library members"
            />
            <StatCard
              title="Books Issued"
              value={stats?.books_issued || 0}
              icon={BookOpen}
              description="Currently issued books"
            />
            <StatCard
              title="Overdue Books"
              value={stats?.overdue_books || 0}
              icon={AlertCircle}
              description="Books past due date"
              trend={stats?.overdue_books ? 'Needs attention' : 'All good'}
            />
            <StatCard
              title="Pending Fines"
              value={stats?.total_fines || 0}
              icon={FileText}
              description="Total unpaid fines (₹)"
            />
            <StatCard
              title="Reservations"
              value={stats?.pending_reservations || 0}
              icon={Calendar}
              description="Pending reservations"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common library tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => setActiveTab('books')}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Add New Book</div>
                  <div className="text-sm text-muted-foreground">Add books to your catalog</div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Issue Book</div>
                  <div className="text-sm text-muted-foreground">Issue books to members</div>
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Return Book</div>
                  <div className="text-sm text-muted-foreground">Process book returns</div>
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className="w-full p-3 text-left border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium">Add Member</div>
                  <div className="text-sm text-muted-foreground">Register new library member</div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest library transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground text-center py-8">
                  Recent activity will appear here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="books">
          <LibraryBooks />
        </TabsContent>

        <TabsContent value="members">
          <LibraryMembers />
        </TabsContent>

        <TabsContent value="transactions">
          <BookTransactions />
        </TabsContent>

        <TabsContent value="reservations">
          <LibraryReservations />
        </TabsContent>

        <TabsContent value="settings">
          <LibrarySettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Library;
