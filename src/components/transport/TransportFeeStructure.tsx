
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Plus, Edit } from 'lucide-react';

const TransportFeeStructure = () => {
  // Mock data for now - will be replaced with actual hook
  const feeStructures = [
    {
      id: '1',
      zone: 'Zone A (0-5 km)',
      monthly_fee: 800,
      one_time_fee: 100,
      effective_from: '2024-04-01',
      is_active: true,
    },
    {
      id: '2',
      zone: 'Zone B (5-10 km)',
      monthly_fee: 1200,
      one_time_fee: 150,
      effective_from: '2024-04-01',
      is_active: true,
    },
    {
      id: '3',
      zone: 'Zone C (10+ km)',
      monthly_fee: 1800,
      one_time_fee: 200,
      effective_from: '2024-04-01',
      is_active: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transport Fee Structure</h2>
          <p className="text-muted-foreground">Manage transport fees based on zones and routes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {feeStructures.map((fee) => (
          <Card key={fee.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {fee.zone}
                </CardTitle>
                <Badge variant={fee.is_active ? 'default' : 'secondary'}>
                  {fee.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                Effective from: {new Date(fee.effective_from).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly Fee:</span>
                  <span className="font-bold text-lg">₹{fee.monthly_fee}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">One-time Fee:</span>
                  <span className="font-medium">₹{fee.one_time_fee}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {feeStructures.length === 0 && (
        <div className="text-center py-8">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No fee structures found</h3>
          <p className="text-muted-foreground mb-4">
            Create fee structures based on zones or routes.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Fee Structure
          </Button>
        </div>
      )}
    </div>
  );
};

export default TransportFeeStructure;
