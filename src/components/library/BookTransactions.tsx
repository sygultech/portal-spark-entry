
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, RotateCcw, CheckCircle, AlertCircle, Calendar, Search } from 'lucide-react';
import { useBookTransactions, useBooks, useLibraryMembers, useLibraryMutations } from '@/hooks/useLibrary';
import { IssueBookData, ReturnBookData } from '@/types/library';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

const BookTransactions = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const { data: transactions = [], isLoading } = useBookTransactions({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined
  });
  const { data: books = [] } = useBooks({ availability: 'available' });
  const { data: members = [] } = useLibraryMembers();
  const { issueBook, returnBook, renewBook } = useLibraryMutations();

  const {
    register: registerIssue,
    handleSubmit: handleIssueSubmit,
    reset: resetIssue,
    setValue: setIssueValue,
    formState: { errors: issueErrors }
  } = useForm<IssueBookData>();

  const {
    register: registerReturn,
    handleSubmit: handleReturnSubmit,
    reset: resetReturn,
    setValue: setReturnValue,
    formState: { errors: returnErrors }
  } = useForm<ReturnBookData>();

  const filteredTransactions = transactions.filter(transaction => {
    const searchableText = `${transaction.book_title || ''} ${transaction.member_name || ''}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  const onIssueBook = async (data: IssueBookData) => {
    try {
      await issueBook.mutateAsync(data);
      resetIssue();
      setIsIssueDialogOpen(false);
    } catch (error) {
      console.error('Error issuing book:', error);
    }
  };

  const onReturnBook = async (data: ReturnBookData) => {
    try {
      await returnBook.mutateAsync(data);
      resetReturn();
      setIsReturnDialogOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const handleRenewBook = async (transactionId: string) => {
    try {
      await renewBook.mutateAsync(transactionId);
    } catch (error) {
      console.error('Error renewing book:', error);
    }
  };

  const openReturnDialog = (transaction: any) => {
    setSelectedTransaction(transaction);
    setReturnValue('transaction_id', transaction.id);
    setReturnValue('return_date', new Date().toISOString().split('T')[0]);
    setIsReturnDialogOpen(true);
  };

  const calculateFine = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    
    // Simple fine calculation: ₹1 per day
    return diffDays * 1;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'issued':
        return <Badge variant="default">Issued</Badge>;
      case 'returned':
        return <Badge variant="secondary">Returned</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'lost':
        return <Badge variant="destructive">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionStats = () => {
    return {
      total: transactions.length,
      issued: transactions.filter(t => t.status === 'issued').length,
      returned: transactions.filter(t => t.status === 'returned').length,
      overdue: transactions.filter(t => t.status === 'overdue').length,
      renewed: transactions.filter(t => t.renewal_count > 0).length
    };
  };

  const stats = getTransactionStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Book Transactions</h2>
          <p className="text-muted-foreground">Issue, return, and manage book transactions</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Issue Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue Book</DialogTitle>
                <DialogDescription>Issue a book to a library member</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleIssueSubmit(onIssueBook)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="book_id">Select Book *</Label>
                  <Select onValueChange={(value) => setIssueValue('book_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select available book" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.filter(b => b.available_copies > 0).map(book => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title} by {book.author} (Available: {book.available_copies})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="member_id">Select Member *</Label>
                  <Select onValueChange={(value) => setIssueValue('member_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.is_active).map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.student_name || member.staff_name} ({member.member_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date *</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...registerIssue('due_date', { required: 'Due date is required' })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {issueErrors.due_date && (
                    <p className="text-sm text-red-500">{issueErrors.due_date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...registerIssue('notes')} rows={2} />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" type="button" onClick={() => setIsIssueDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={issueBook.isPending}>
                    Issue Book
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Issued</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.issued}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Returned</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returned}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewals</CardTitle>
            <RotateCcw className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.renewed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by book title or member name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="issued">Currently Issued</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="returned">Returned</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading transactions...</div>
          ) : filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search' : 'Start by issuing your first book'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredTransactions.map(transaction => (
                <Card key={transaction.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{transaction.book_title}</h3>
                          {getStatusBadge(transaction.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Issued to: {transaction.member_name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Issue Date: {format(new Date(transaction.issue_date), 'MMM dd, yyyy')}</span>
                          <span>Due Date: {format(new Date(transaction.due_date), 'MMM dd, yyyy')}</span>
                          {transaction.return_date && (
                            <span>Returned: {format(new Date(transaction.return_date), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                        {transaction.renewal_count > 0 && (
                          <Badge variant="outline">Renewed {transaction.renewal_count} times</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {transaction.status === 'issued' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRenewBook(transaction.id)}
                              disabled={transaction.renewal_count >= transaction.max_renewals}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Renew
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openReturnDialog(transaction)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Return
                            </Button>
                          </>
                        )}
                        {transaction.fine_amount > 0 && (
                          <Badge variant="destructive">
                            Fine: ₹{transaction.fine_amount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {transaction.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{transaction.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issued">
          <div className="grid gap-4">
            {filteredTransactions.filter(t => t.status === 'issued').map(transaction => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{transaction.book_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Issued to: {transaction.member_name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Due: {format(new Date(transaction.due_date), 'MMM dd, yyyy')}</span>
                        {new Date(transaction.due_date) < new Date() && (
                          <Badge variant="destructive">
                            Overdue by {Math.ceil((new Date().getTime() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRenewBook(transaction.id)}
                        disabled={transaction.renewal_count >= transaction.max_renewals}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                      <Button size="sm" onClick={() => openReturnDialog(transaction)}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue">
          <div className="grid gap-4">
            {filteredTransactions.filter(t => t.status === 'overdue' || (t.status === 'issued' && new Date(t.due_date) < new Date())).map(transaction => (
              <Card key={transaction.id} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{transaction.book_title}</h3>
                        <Badge variant="destructive">Overdue</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Issued to: {transaction.member_name}
                      </p>
                      <div className="text-sm">
                        <span className="text-red-600">
                          Overdue by {Math.ceil((new Date().getTime() - new Date(transaction.due_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </span>
                        <span className="ml-4">
                          Fine: ₹{calculateFine(transaction.due_date)}
                        </span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => openReturnDialog(transaction)}>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Return
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="returned">
          <div className="grid gap-4">
            {filteredTransactions.filter(t => t.status === 'returned').map(transaction => (
              <Card key={transaction.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{transaction.book_title}</h3>
                        <Badge variant="secondary">Returned</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Member: {transaction.member_name}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span>Issued: {format(new Date(transaction.issue_date), 'MMM dd, yyyy')}</span>
                        <span>Returned: {format(new Date(transaction.return_date!), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    {transaction.fine_amount > 0 && (
                      <Badge variant={transaction.fine_paid ? "secondary" : "destructive"}>
                        Fine: ₹{transaction.fine_amount} {transaction.fine_paid ? '(Paid)' : '(Unpaid)'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Return Book Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Book</DialogTitle>
            <DialogDescription>
              Process book return for: {selectedTransaction?.book_title}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleReturnSubmit(onReturnBook)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="return_date">Return Date *</Label>
              <Input
                id="return_date"
                type="date"
                {...registerReturn('return_date', { required: 'Return date is required' })}
              />
              {returnErrors.return_date && (
                <p className="text-sm text-red-500">{returnErrors.return_date.message}</p>
              )}
            </div>

            {selectedTransaction && new Date(selectedTransaction.due_date) < new Date() && (
              <div className="space-y-2">
                <Label htmlFor="fine_amount">Fine Amount (₹)</Label>
                <Input
                  id="fine_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...registerReturn('fine_amount', { valueAsNumber: true })}
                  defaultValue={calculateFine(selectedTransaction.due_date)}
                />
                <p className="text-sm text-muted-foreground">
                  Calculated fine for overdue period
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="return_notes">Notes</Label>
              <Textarea id="return_notes" {...registerReturn('notes')} rows={2} />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setIsReturnDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={returnBook.isPending}>
                Return Book
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookTransactions;
