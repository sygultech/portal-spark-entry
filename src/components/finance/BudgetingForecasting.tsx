
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle,
  Calendar,
  Calculator,
  PieChart,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const BudgetingForecasting = () => {
  const [activeTab, setActiveTab] = useState('budgets');

  // Mock budget data
  const departmentBudgets = [
    { 
      id: 1, 
      department: 'Academic', 
      budgeted: 500000, 
      spent: 320000, 
      remaining: 180000, 
      utilization: 64,
      status: 'on-track'
    },
    { 
      id: 2, 
      department: 'Administration', 
      budgeted: 200000, 
      spent: 180000, 
      remaining: 20000, 
      utilization: 90,
      status: 'warning'
    },
    { 
      id: 3, 
      department: 'Facilities', 
      budgeted: 150000, 
      spent: 95000, 
      remaining: 55000, 
      utilization: 63,
      status: 'on-track'
    },
    { 
      id: 4, 
      department: 'Transport', 
      budgeted: 100000, 
      spent: 105000, 
      remaining: -5000, 
      utilization: 105,
      status: 'exceeded'
    },
  ];

  const monthlyBudgets = [
    { month: 'Jan', budgeted: 95000, actual: 87000 },
    { month: 'Feb', budgeted: 95000, actual: 92000 },
    { month: 'Mar', budgeted: 95000, actual: 89000 },
    { month: 'Apr', budgeted: 95000, actual: 98000 },
    { month: 'May', budgeted: 95000, actual: 94000 },
    { month: 'Jun', budgeted: 95000, actual: 96000 },
  ];

  const cashFlowForecast = [
    { month: 'Jul', projected: 150000, optimistic: 165000, pessimistic: 135000 },
    { month: 'Aug', projected: 160000, optimistic: 175000, pessimistic: 145000 },
    { month: 'Sep', projected: 155000, optimistic: 170000, pessimistic: 140000 },
    { month: 'Oct', projected: 165000, optimistic: 180000, pessimistic: 150000 },
    { month: 'Nov', projected: 170000, optimistic: 185000, pessimistic: 155000 },
    { month: 'Dec', projected: 175000, optimistic: 190000, pessimistic: 160000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'default';
      case 'warning': return 'secondary';
      case 'exceeded': return 'destructive';
      default: return 'outline';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization > 100) return 'text-red-600';
    if (utilization > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgeting & Forecasting</h2>
          <p className="text-muted-foreground">Plan and track your school's financial performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Budget Calculator
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>Set up a new budget for a department or category</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="budget-name">Budget Name</Label>
                  <Input id="budget-name" placeholder="e.g., Academic Year 2024-25" />
                </div>
                <div>
                  <Label htmlFor="budget-department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget-amount">Budget Amount</Label>
                  <Input id="budget-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="budget-period">Budget Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Budget</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-2xl font-bold">₹9,50,000</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Annual allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold">₹7,00,000</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">74% utilized</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p className="text-2xl font-bold">₹2,50,000</p>
              </div>
              <Calculator className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variance</p>
                <p className="text-2xl font-bold text-green-600">-₹50,000</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">Under budget</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="budgets">Budget Tracking</TabsTrigger>
          <TabsTrigger value="forecasting">Cash Flow Forecast</TabsTrigger>
          <TabsTrigger value="analysis">Budget Analysis</TabsTrigger>
        </TabsList>

        {/* Budget Tracking Tab */}
        <TabsContent value="budgets" className="space-y-6">
          {/* Department Budget Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Department Budget Overview</CardTitle>
              <CardDescription>Budget allocation and utilization by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {departmentBudgets.map((budget) => (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{budget.department}</h4>
                        <Badge variant={getStatusColor(budget.status)}>
                          {budget.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getUtilizationColor(budget.utilization)}`}>
                          {budget.utilization}% utilized
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ₹{budget.spent.toLocaleString()} / ₹{budget.budgeted.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Progress value={budget.utilization} className="h-2" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Remaining: ₹{budget.remaining.toLocaleString()}</span>
                      <span>
                        {budget.utilization > 100 ? 'Exceeded by' : 'Available'}: 
                        ₹{Math.abs(budget.remaining).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Budget vs Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget vs Actual</CardTitle>
              <CardDescription>Comparison of budgeted vs actual expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyBudgets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                  <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Budget Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Alerts</CardTitle>
              <CardDescription>Departments requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-red-200 rounded-lg bg-red-50">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div className="flex-1">
                    <div className="font-medium text-red-800">Transport Department</div>
                    <div className="text-sm text-red-600">Budget exceeded by ₹5,000 (105% utilized)</div>
                  </div>
                  <Button variant="outline" size="sm">Review</Button>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <div className="font-medium text-yellow-800">Administration</div>
                    <div className="text-sm text-yellow-600">90% of budget utilized - approaching limit</div>
                  </div>
                  <Button variant="outline" size="sm">Monitor</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cash Flow Forecast Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          {/* Cash Flow Projection */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projection</CardTitle>
              <CardDescription>Projected cash flow for the next 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="pessimistic" stackId="1" stroke="#ff7300" fill="#ff7300" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="projected" stackId="2" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="optimistic" stackId="3" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Scenarios */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Optimistic Scenario</CardTitle>
                <CardDescription>Best case projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Projected Income</div>
                    <div className="text-2xl font-bold text-green-600">₹10,65,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="font-medium">+15% YoY</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on increased enrollment and fee collection rates
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Realistic Scenario</CardTitle>
                <CardDescription>Most likely projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Projected Income</div>
                    <div className="text-2xl font-bold text-blue-600">₹9,85,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="font-medium">+8% YoY</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on current trends and historical data
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Conservative Scenario</CardTitle>
                <CardDescription>Worst case projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Projected Income</div>
                    <div className="text-2xl font-bold text-red-600">₹9,15,000</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Growth Rate</div>
                    <div className="font-medium">+2% YoY</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Accounting for potential challenges and reduced collections
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Forecast Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Assumptions</CardTitle>
              <CardDescription>Key assumptions used in financial projections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Revenue Assumptions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Student enrollment growth: 5-10% annually</li>
                    <li>• Fee collection rate: 95-98%</li>
                    <li>• Fee increase: 8% annually</li>
                    <li>• New program revenue: ₹50,000/month</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">Expense Assumptions</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Salary increments: 10% annually</li>
                    <li>• Utility cost increase: 5% annually</li>
                    <li>• Maintenance expenses: ₹15,000/month</li>
                    <li>• New infrastructure: ₹2,00,000/year</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {/* Variance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Variance Analysis</CardTitle>
              <CardDescription>Detailed analysis of budget vs actual performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Salaries', budgeted: 200000, actual: 195000, variance: -5000, percentage: -2.5 },
                  { category: 'Utilities', budgeted: 25000, actual: 28000, variance: 3000, percentage: 12 },
                  { category: 'Supplies', budgeted: 15000, actual: 12000, variance: -3000, percentage: -20 },
                  { category: 'Maintenance', budgeted: 20000, actual: 22000, variance: 2000, percentage: 10 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">
                        Budgeted: ₹{item.budgeted.toLocaleString()} | Actual: ₹{item.actual.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${item.variance < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.variance < 0 ? '' : '+'}₹{item.variance.toLocaleString()}
                      </div>
                      <div className={`text-sm ${item.percentage < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.percentage < 0 ? '' : '+'}{item.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Budget Adherence</span>
                    <span className="font-bold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Departments On Track</span>
                    <span className="font-bold">2 of 4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Variance</span>
                    <span className="font-bold text-green-600">-2.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Budget Utilization Rate</span>
                    <span className="font-bold">74%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to improve budget performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">Optimize Transport Costs</div>
                    <div className="text-sm text-blue-600">Review transport contracts to reduce overspend</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="font-medium text-green-800">Reallocate Savings</div>
                    <div className="text-sm text-green-600">Move unused supplies budget to infrastructure</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-800">Monitor Utilities</div>
                    <div className="text-sm text-yellow-600">Implement energy-saving measures</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetingForecasting;
