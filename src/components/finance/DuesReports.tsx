import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Filter, FileText, TrendingUp, Loader2 } from "lucide-react";
import { DuesSummary } from "@/types/finance";
import { useAuth } from "@/hooks/useAuth";
import { duesReportsService, DuesReportSummary } from "@/services/duesReportsService";
import { toast } from "sonner";

const DuesReports = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  
  const [duesData, setDuesData] = useState<DuesSummary[]>([]);
  const [summary, setSummary] = useState<DuesReportSummary>({
    totalStudents: 0,
    paidStudents: 0,
    partialPayments: 0,
    overdueStudents: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    collectionRate: 0
  });
  const [batches, setBatches] = useState<string[]>([]);

  useEffect(() => {
    if (user?.school_id) {
      loadDuesData();
    }
  }, [user?.school_id]);

  const loadDuesData = async () => {
    if (!user?.school_id) return;
    
    try {
      setLoading(true);
      console.log('Loading dues data for school:', user.school_id);
      
      // Load all data in parallel
      const [duesResult, summaryResult, batchesResult] = await Promise.all([
        duesReportsService.getDuesSummary(user.school_id),
        duesReportsService.getDuesReportSummary(user.school_id),
        duesReportsService.getAvailableBatches(user.school_id)
      ]);
      
      console.log('Dues data loaded:', {
        dues: duesResult.length,
        summary: summaryResult,
        batches: batchesResult.length
      });
      
      setDuesData(duesResult);
      setSummary(summaryResult);
      setBatches(batchesResult);
      
    } catch (error) {
      console.error('Error loading dues data:', error);
      toast.error('Failed to load dues reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = duesData.filter(record => {
    const matchesSearch = 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.admissionNumber.includes(searchTerm) ||
      record.batchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch = batchFilter === "all" || record.batchName === batchFilter;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const getStatusBadge = (status: DuesSummary['status']) => {
    const variants = {
      paid: "default",
      partial: "secondary", 
      overdue: "destructive"
    };
    
    const labels = {
      paid: "Paid",
      partial: "Partial",
      overdue: "Overdue"
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  // Calculate summary statistics from filtered data
  const totalStudents = filteredData.length;
  const paidStudents = filteredData.filter(d => d.status === 'paid').length;
  const partialPayments = filteredData.filter(d => d.status === 'partial').length;
  const overdueStudents = filteredData.filter(d => d.status === 'overdue').length;
  const totalCollected = filteredData.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalOutstanding = filteredData.reduce((sum, d) => sum + d.balance, 0);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!user?.school_id) return;
    
    try {
      setExporting(format);
      console.log(`Exporting dues report in ${format} format`);
      
      const filters = {
        batch: batchFilter,
        status: statusFilter,
        search: searchTerm
      };
      
      const blob = await duesReportsService.exportDuesReport(user.school_id, format, filters);
      
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dues-report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success(`Dues report exported as ${format.toUpperCase()}`);
      } else {
        if (format === 'csv') {
          toast.error('Failed to generate CSV report');
        } else {
          toast.info(`${format.toUpperCase()} export feature coming soon`);
        }
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading dues reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{summary.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{summary.paidStudents}</p>
                <p className="text-xs text-muted-foreground">Fully Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{summary.partialPayments}</p>
                <p className="text-xs text-muted-foreground">Partial Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{summary.overdueStudents}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ₹{summary.totalCollected.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Collection Rate: {summary.collectionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              ₹{summary.totalOutstanding.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {summary.overdueStudents + summary.partialPayments} students with pending dues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dues Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dues Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track pending dues and payment status by student
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={() => handleExport('pdf')}
                disabled={exporting === 'pdf'}
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('csv')}
                disabled={exporting === 'csv'}
              >
                {exporting === 'csv' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                CSV
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleExport('excel')}
                disabled={exporting === 'excel'}
              >
                {exporting === 'excel' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 flex-1 min-w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(batch => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          {filteredData.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No dues records found.</p>
              {duesData.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  No student fees have been assigned yet.
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Total Fees</TableHead>
                  <TableHead>Paid Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Days Past Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((record) => (
                  <TableRow key={record.studentId}>
                    <TableCell className="font-medium">{record.studentName}</TableCell>
                    <TableCell>{record.admissionNumber}</TableCell>
                    <TableCell>{record.batchName}</TableCell>
                    <TableCell>₹{record.totalFees.toLocaleString()}</TableCell>
                    <TableCell>₹{record.paidAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={record.balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                        ₹{record.balance.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      {record.lastPaymentDate 
                        ? new Date(record.lastPaymentDate).toLocaleDateString() 
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.daysPastDue ? (
                        <span className="text-red-600 font-medium">
                          {record.daysPastDue} days
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DuesReports;
