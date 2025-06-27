
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, RefreshCw } from "lucide-react";
import { FeeStructure as OriginalFeeStructure } from "@/types/finance";
import { useFeeStructures } from "@/hooks/useFeeStructures";
import { FeeStructure } from "@/services/feeStructureService";
import FeeStructureForm from "./FeeStructureForm";

const FeeStructures = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [deletingStructure, setDeletingStructure] = useState<FeeStructure | null>(null);
  
  const {
    feeStructures,
    loading,
    error,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    refreshFeeStructures,
    searchFeeStructures,
    clearSearch,
    searchQuery
  } = useFeeStructures();

  const handleCreateStructure = async (newStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createFeeStructure({
        name: newStructure.name,
        academicYear: newStructure.academicYear,
        components: newStructure.components.map(comp => ({
          name: comp.name,
          amount: comp.amount,
          dueDate: comp.dueDate,
          recurring: comp.recurring
        }))
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to create fee structure:', error);
    }
  };

  const handleEditStructure = async (updatedStructure: FeeStructure) => {
    try {
      await updateFeeStructure(updatedStructure.id, {
        name: updatedStructure.name,
        academicYear: updatedStructure.academicYear,
        components: updatedStructure.components
      });
      setEditingStructure(null);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to update fee structure:', error);
    }
  };

  const handleDeleteStructure = async (structure: FeeStructure) => {
    try {
      await deleteFeeStructure(structure.id);
      setDeletingStructure(null);
    } catch (error) {
      // Error is already handled in the hook
      console.error('Failed to delete fee structure:', error);
    }
  };

  const handleSearchChange = (value: string) => {
    searchFeeStructures(value);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Structures</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage fee structure templates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFeeStructures}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Structure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Fee Structure</DialogTitle>
                </DialogHeader>
                <FeeStructureForm
                  onSubmit={handleCreateStructure}
                  onCancel={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fee structures..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && feeStructures.length === 0 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Table */}
        {!loading || feeStructures.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Structure Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Components</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeStructures.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No fee structures found. Create your first fee structure to get started.
                  </TableCell>
                </TableRow>
              ) : (
                feeStructures.map((structure) => (
                                <TableRow key={structure.id}>
                    <TableCell className="font-medium">{structure.name}</TableCell>
                    <TableCell>{structure.academicYear}</TableCell>
                    <TableCell>₹{structure.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {structure.components.length} components
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStructure(structure)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingStructure(structure)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : null}

        {/* Edit Modal */}
        {editingStructure && (
          <Dialog open={true} onOpenChange={() => setEditingStructure(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Fee Structure</DialogTitle>
              </DialogHeader>
              <FeeStructureForm
                initialData={editingStructure}
                onSubmit={handleEditStructure}
                onCancel={() => setEditingStructure(null)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingStructure && (
          <AlertDialog open={true} onOpenChange={() => setDeletingStructure(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{deletingStructure.name}"? 
                  This action cannot be undone and will remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDeleteStructure(deletingStructure)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeStructures;
