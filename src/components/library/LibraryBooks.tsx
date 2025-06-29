
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, BookOpen, Filter } from 'lucide-react';
import { useBooks, useLibraryMutations } from '@/hooks/useLibrary';
import { CreateBookData } from '@/types/library';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const LibraryBooks = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'issued'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);

  const { data: books = [], isLoading } = useBooks({
    search: searchTerm,
    genre: genreFilter && genreFilter !== 'all' ? genreFilter : undefined,
    availability: availabilityFilter
  });

  const { createBook, updateBook, deleteBook } = useLibraryMutations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<CreateBookData>();

  const genres = [
    'Fiction', 'Non-Fiction', 'Science', 'Mathematics', 'History', 'Geography',
    'Literature', 'Biography', 'Reference', 'Children', 'Young Adult', 'Academic'
  ];

  const gradeLevels = [
    'Pre-K', 'K', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College'
  ];

  const onSubmit = async (data: CreateBookData) => {
    try {
      if (editingBook) {
        await updateBook.mutateAsync({ bookId: editingBook.id, updates: data });
        setEditingBook(null);
      } else {
        await createBook.mutateAsync(data);
      }
      reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleEdit = (book: any) => {
    setEditingBook(book);
    // Populate form with book data
    Object.keys(book).forEach(key => {
      setValue(key as keyof CreateBookData, book[key]);
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (bookId: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBook.mutateAsync(bookId);
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const resetForm = () => {
    reset();
    setEditingBook(null);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Books Catalog</h2>
          <p className="text-muted-foreground">Manage your library's book collection</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
              <DialogDescription>
                {editingBook ? 'Update book information' : 'Add a new book to your library catalog'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    {...register('author', { required: 'Author is required' })}
                  />
                  {errors.author && (
                    <p className="text-sm text-red-500">{errors.author.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input id="isbn" {...register('isbn')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edition">Edition</Label>
                  <Input id="edition" {...register('edition')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" {...register('language')} defaultValue="English" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input id="publisher" {...register('publisher')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rack_location">Rack Location</Label>
                  <Input id="rack_location" {...register('rack_location')} placeholder="e.g., A-1-5" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select onValueChange={(value) => setValue('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject_category">Subject Category</Label>
                  <Input id="subject_category" {...register('subject_category')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade_level">Grade Level</Label>
                  <Select onValueChange={(value) => setValue('grade_level', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradeLevels.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_copies">Number of Copies *</Label>
                <Input
                  id="total_copies"
                  type="number"
                  min="1"
                  {...register('total_copies', { 
                    required: 'Number of copies is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Must have at least 1 copy' }
                  })}
                />
                {errors.total_copies && (
                  <p className="text-sm text-red-500">{errors.total_copies.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_image_url">Cover Image URL</Label>
                <Input id="cover_image_url" {...register('cover_image_url')} placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} rows={3} />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createBook.isPending || updateBook.isPending}>
                  {editingBook ? 'Update Book' : 'Add Book'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books by title, author, or ISBN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={genreFilter} onValueChange={setGenreFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={(value: any) => setAvailabilityFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Books</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading books...</div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || (genreFilter && genreFilter !== 'all') ? 'Try adjusting your filters' : 'Add your first book to get started'}
            </p>
            {!searchTerm && (!genreFilter || genreFilter === 'all') && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Book
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map(book => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <CardDescription className="mt-1">by {book.author}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(book)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(book.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {book.genre && <Badge variant="secondary">{book.genre}</Badge>}
                  {book.grade_level && <Badge variant="outline">{book.grade_level}</Badge>}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total:</span> {book.total_copies}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available:</span> {book.available_copies}
                  </div>
                  {book.isbn && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">ISBN:</span> {book.isbn}
                    </div>
                  )}
                  {book.rack_location && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Location:</span> {book.rack_location}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant={book.available_copies > 0 ? "default" : "destructive"}>
                    {book.available_copies > 0 ? 'Available' : 'Issued Out'}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    {book.total_copies - book.available_copies} issued
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryBooks;
