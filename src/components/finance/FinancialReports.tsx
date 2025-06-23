
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Download,
  Calendar as CalendarIcon,
  FileText,
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Eye,
  Mail,
  Printer
} from 'lucide-react';

const FinancialReports = () => {
  const [reportType, setReportType] = useState('income-statement');
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Mock report data
  const reportTypes = [
    { value: 'income-statement', label: 'Income Statement', icon: FileText },
    { value: 'balance-sheet', label: 'Balance Sheet', icon: BarChart3 },
    { value: 'cash-flow', label: 'Cash Flow Statement', icon: TrendingUp },
    { value: 'budget-vs-actual', label: 'Budget vs Actual', icon: Target },
    { value: 'fee-collection', label: 'Fee Collection Report', icon: DollarSign },
    { value: 'expense-analysis', label: 'Expense Analysis', icon: PieChart },
  ];

  const savedReports = [
    {
      id: 1,
      name: 'Monthly Income Statement - January 2024',
      type: 'Income Statement',
      generatedDate: '2024-01-31',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      name: 'Q4 2023 Budget vs Actual',
      type: 'Budget Analysis',
      generatedDate: '2024-01-15',
      status: 'completed',
      size: '3.1 MB'
    },
    {
      id: 3,
      name: 'Fee Collection Report - December 2023',
      type: 'Fee Collection',
      generatedDate: '2024-01-10',
      status: 'processing',
      size: 'Pending'
    },
    {
      id: 4,
      name: 'Annual Cash Flow Analysis 2023',
      type: 'Cash Flow',
      generatedDate: '2024-01-05',
      status: 'completed',
      size: '5.2 MB'
    },
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Monthly Income Statement',
      frequency: 'Monthly',
      nextRun: '2024-02-01',
      recipients: ['finance@school.edu', 'principal@school.edu'],
      status: 'active'
    },
    {
      id: 2,
      name: 'Weekly Fee Collection Summary',
      frequency: 'Weekly',
      nextRun: '2024-01-22',
      recipients: ['accounts@school.edu'],
      status: 'active'
    },
    {
      id: 3,
      name: 'Quarterly Budget Review',
      frequency: 'Quarterly',
      nextRun: '2024-04-01',
      recipients: ['management@school.edu'],
      status: 'paused'
    },
  ];

  const quickInsights = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    netIncome: 40000,
    feeCollectionRate: 78,
    expenseGrowth: 5.2,
    revenueGrowth: 12.3
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Financial Insights */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${quickInsights.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600">+{quickInsights.revenueGrowth}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${quickInsights.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-red-600">+{quickInsights.expenseGrowth}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">${quickInsights.netIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{quickInsights.feeCollectionRate}%</div>
            <p className="text-xs text-muted-foreground">Fee collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <PieChart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">32%</div>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <AlertTriangle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Financial Report</CardTitle>
          <CardDescription>Create comprehensive financial reports for analysis and compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Saved Reports and Scheduled Reports */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Previously generated financial reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{report.type}</Badge>
                      <span className="text-xs text-muted-foreground">{report.generatedDate}</span>
                      <span className="text-xs text-muted-foreground">{report.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    {report.status === 'completed' && (
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
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
            <CardTitle>Scheduled Reports</CardTitle>
            <CardDescription>Automated report generation schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledReports.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{schedule.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{schedule.frequency}</Badge>
                      <span className="text-xs text-muted-foreground">Next: {schedule.nextRun}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recipients: {schedule.recipients.length} users
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(schedule.status)}>
                      {schedule.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule New Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinancialReports;
