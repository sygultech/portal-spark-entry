
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Download, 
  Calendar as CalendarIcon, 
  FileText, 
  PieChart, 
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Eye,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const ReportsAnalytics = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Mock data for charts
  const feeCollectionTrend = [
    { month: 'Jan', collected: 450000, target: 500000 },
    { month: 'Feb', collected: 520000, target: 500000 },
    { month: 'Mar', collected: 480000, target: 500000 },
    { month: 'Apr', collected: 610000, target: 550000 },
    { month: 'May', collected: 580000, target: 550000 },
    { month: 'Jun', collected: 650000, target: 600000 },
  ];

  const defaulterAnalysis = [
    { class: 'Grade 1', students: 45, defaulters: 3, percentage: 6.7 },
    { class: 'Grade 2', students: 48, defaulters: 2, percentage: 4.2 },
    { class: 'Grade 3', students: 50, defaulters: 5, percentage: 10.0 },
    { class: 'Grade 4', students: 46, defaulters: 1, percentage: 2.2 },
    { class: 'Grade 5', students: 52, defaulters: 4, percentage: 7.7 },
  ];

  const expenseBreakdown = [
    { category: 'Salaries', amount: 450000, percentage: 65, color: '#8884d8' },
    { category: 'Utilities', amount: 80000, percentage: 12, color: '#82ca9d' },
    { category: 'Maintenance', amount: 60000, percentage: 9, color: '#ffc658' },
    { category: 'Supplies', amount: 45000, percentage: 7, color: '#ff7300' },
    { category: 'Transport', amount: 35000, percentage: 5, color: '#0088fe' },
    { category: 'Others', amount: 20000, percentage: 3, color: '#00c49f' },
  ];

  const availableReports = [
    {
      name: 'Fee Collection Report',
      description: 'Detailed fee collection summary by class and student',
      category: 'Collection',
      frequency: 'Daily/Monthly',
      lastGenerated: '2024-01-15'
    },
    {
      name: 'Defaulter List',
      description: 'Students with overdue fee payments',
      category: 'Collection',
      frequency: 'Weekly',
      lastGenerated: '2024-01-14'
    },
    {
      name: 'Expense Report',
      description: 'Detailed breakdown of all expenses by category',
      category: 'Expenses',
      frequency: 'Monthly',
      lastGenerated: '2024-01-10'
    },
    {
      name: 'Profit & Loss Statement',
      description: 'Financial performance summary',
      category: 'Financial',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01'
    },
    {
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      category: 'Financial',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01'
    },
    {
      name: 'Balance Sheet',
      description: 'Assets, liabilities, and equity summary',
      category: 'Financial',
      frequency: 'Quarterly',
      lastGenerated: '2023-12-31'
    },
    {
      name: 'Budget Variance Report',
      description: 'Budget vs actual comparison',
      category: 'Budget',
      frequency: 'Monthly',
      lastGenerated: '2024-01-05'
    },
    {
      name: 'GST Returns',
      description: 'Tax calculation and filing report',
      category: 'Compliance',
      frequency: 'Monthly',
      lastGenerated: '2024-01-01'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Collection': return 'bg-green-100 text-green-800';
      case 'Expenses': return 'bg-red-100 text-red-800';
      case 'Financial': return 'bg-blue-100 text-blue-800';
      case 'Budget': return 'bg-purple-100 text-purple-800';
      case 'Compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">Comprehensive financial reporting and analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Schedule Reports
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">94.2%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">+2.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Dues</p>
                <p className="text-2xl font-bold">₹2,34,000</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-red-600 mt-1">245 students pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">₹6,50,000</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-blue-600 mt-1">This month target: ₹6,00,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profit Margin</p>
                <p className="text-2xl font-bold">18.5%</p>
              </div>
              <PieChart className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-1">Above industry average</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Collection Trend</CardTitle>
            <CardDescription>Monthly collection vs target comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={feeCollectionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="target" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                <Area type="monotone" dataKey="collected" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Current month expense breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {expenseBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    {item.category}
                  </div>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Defaulter Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Defaulter Analysis by Class</CardTitle>
          <CardDescription>Students with overdue payments by grade</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defaulterAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="class" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="defaulters" fill="#ff7300" name="Defaulters" />
              <Bar dataKey="students" fill="#8884d8" name="Total Students" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
          <CardDescription>Generate and download financial reports</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Date Range:</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateFrom ? format(dateFrom, 'MMM dd') : 'From'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {dateTo ? format(dateTo, 'MMM dd') : 'To'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="collection">Collection</SelectItem>
                <SelectItem value="expenses">Expenses</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">Apply Filters</Button>
          </div>

          {/* Available Reports Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableReports.map((report, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{report.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{report.description}</p>
                      <Badge className={getCategoryColor(report.category)} variant="secondary">
                        {report.category}
                      </Badge>
                    </div>
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Last Generated:</span>
                      <span>{report.lastGenerated}</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automatically generated and emailed reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'Daily Collection Summary', frequency: 'Daily at 6:00 PM', recipients: 'finance@school.com', status: 'Active' },
              { name: 'Weekly Defaulter Report', frequency: 'Every Monday at 9:00 AM', recipients: 'admin@school.com', status: 'Active' },
              { name: 'Monthly Financial Statement', frequency: '1st of every month', recipients: 'principal@school.com', status: 'Active' },
              { name: 'Quarterly Budget Review', frequency: 'Every 3 months', recipients: 'board@school.com', status: 'Inactive' },
            ].map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{schedule.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {schedule.frequency} → {schedule.recipients}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={schedule.status === 'Active' ? 'default' : 'secondary'}>
                    {schedule.status}
                  </Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;
