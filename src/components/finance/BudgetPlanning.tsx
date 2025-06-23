
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
  PieChart,
  Calendar
} from 'lucide-react';

const BudgetPlanning = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isCreateBudgetOpen, setIsCreateBudgetOpen] = useState(false);

  // Mock budget data
  const budgetPeriods = [
    {
      id: 1,
      name: 'January 2024',
      period: 'monthly',
      totalBudget: 75000,
      totalSpent: 62400,
      totalRemaining: 12600,
      status: 'active',
      categories: [
        { name: 'Salaries & Benefits', budgeted: 45000, spent: 42000, variance: -3000 },
        { name: 'Infrastructure', budgeted: 15000, spent: 8500, variance: -6500 },
        { name: 'Educational Materials', budgeted: 8000, spent: 6200, variance: -1800 },
        { name: 'Utilities', budgeted: 5000, spent: 4200, variance: -800 },
        { name: 'Marketing', budgeted: 2000, spent: 1500, variance: -500 },
      ]
    },
    {
      id: 2,
      name: 'Q1 2024',
      period: 'quarterly',
      totalBudget: 225000,
      totalSpent: 180000,
      totalRemaining: 45000,
      status: 'active',
      categories: [
        { name: 'Salaries & Benefits', budgeted: 135000, spent: 120000, variance: -15000 },
        { name: 'Infrastructure', budgeted: 45000, spent: 35000, variance: -10000 },
        { name: 'Educational Materials', budgeted: 24000, spent: 15000, variance: -9000 },
        { name: 'Utilities', budgeted: 15000, spent: 8000, variance: -7000 },
        { name: 'Marketing', budgeted: 6000, spent: 2000, variance: -4000 },
      ]
    }
  ];

  const currentBudget = budgetPeriods.find(bp => bp.period === selectedPeriod) || budgetPeriods[0];

  const getBudgetStatus = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 90) return { status: 'danger', color: 'bg-red-500' };
    if (percentage >= 75) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'good', color: 'bg-green-500' };
  };

  const getVarianceColor = (variance: number) => {
    return variance < 0 ? 'text-green-600' : 'text-red-600';
  };

  const upcomingBudgetItems = [
    { category: 'IT Equipment Renewal', amount: 25000, dueDate: '2024-02-15', priority: 'high' },
    { category: 'Annual Insurance', amount: 12000, dueDate: '2024-03-01', priority: 'medium' },
    { category: 'Staff Training Program', amount: 8000, dueDate: '2024-02-28', priority: 'medium' },
    { category: 'Building Maintenance', amount: 15000, dueDate: '2024-03-15', priority: 'low' },
  ];

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Budget Planning & Management</h2>
          <p className="text-muted-foreground">Plan, track, and manage institutional budgets</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="annual">Annual</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateBudgetOpen} onOpenChange={setIsCreateBudgetOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set up a new budget for a specific period
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="budgetName">Budget Name</Label>
                  <Input id="budgetName" placeholder="e.g., February 2024" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budgetPeriod">Period</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="totalBudget">Total Budget Amount</Label>
                  <Input id="totalBudget" type="number" placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budgetDescription">Description</Label>
                  <Textarea 
                    id="budgetDescription"
                    placeholder="Budget description or notes..."
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateBudgetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsCreateBudgetOpen(false)}>
                  Create Budget
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Current Budget Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentBudget.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{currentBudget.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentBudget.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((currentBudget.totalSpent / currentBudget.totalBudget) * 100)}% utilized
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${currentBudget.totalRemaining.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available to spend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Good</div>
            <p className="text-xs text-muted-foreground">On track</p>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Budget Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Budget Analysis</CardTitle>
          <CardDescription>Detailed breakdown by expense categories for {currentBudget.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {currentBudget.categories.map((category, index) => {
              const spentPercentage = (category.spent / category.budgeted) * 100;
              const budgetStatus = getBudgetStatus(category.spent, category.budgeted);
              
              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Budgeted: ${category.budgeted.toLocaleString()}</span>
                        <span>Spent: ${category.spent.toLocaleString()}</span>
                        <span className={getVarianceColor(category.variance)}>
                          Variance: ${Math.abs(category.variance).toLocaleString()} 
                          {category.variance < 0 ? ' under' : ' over'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{Math.round(spentPercentage)}%</div>
                      <Badge variant={budgetStatus.status === 'danger' ? 'destructive' : 
                                   budgetStatus.status === 'warning' ? 'secondary' : 'default'}>
                        {budgetStatus.status === 'danger' ? 'Over Budget' :
                         budgetStatus.status === 'warning' ? 'Near Limit' : 'On Track'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={spentPercentage} className="w-full" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Budget Items & Forecasting */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Budget Items</CardTitle>
            <CardDescription>Planned expenses for the next period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBudgetItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.category}</h4>
                    <p className="text-sm text-muted-foreground">Due: {item.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${item.amount.toLocaleString()}</p>
                    <Badge variant={
                      item.priority === 'high' ? 'destructive' :
                      item.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {item.priority} priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget Item
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Alerts & Recommendations</CardTitle>
            <CardDescription>AI-powered insights and suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Infrastructure Budget Alert</h4>
                  <p className="text-sm text-yellow-700">
                    You're significantly under budget in Infrastructure. Consider allocating funds for facility improvements.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Optimization Suggestion</h4>
                  <p className="text-sm text-blue-700">
                    Based on historical data, you could save 8% on utilities by implementing energy-efficient practices.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Budget Performance</h4>
                  <p className="text-sm text-green-700">
                    Great job! You're on track with your budget and maintaining healthy reserves.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetPlanning;
