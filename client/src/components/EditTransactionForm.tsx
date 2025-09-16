import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign } from "lucide-react";
import type { Transaction, InsertTransaction } from "@shared/schema";

interface EditTransactionFormProps {
  transaction: Transaction;
  onSubmit?: (id: string, data: Partial<InsertTransaction>) => void;
  onCancel?: () => void;
}

export default function EditTransactionForm({ transaction, onSubmit, onCancel }: EditTransactionFormProps) {
  const [formData, setFormData] = useState({
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    source: transaction.source,
    date: new Date(transaction.date).toISOString().split('T')[0],
    status: transaction.status
  });

  const [errors, setErrors] = useState<{
    amount?: string;
    description?: string;
    category?: string;
    source?: string;
    date?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.source) {
      newErrors.source = 'Please select a source';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData: Partial<InsertTransaction> = {
        amount: formData.amount,
        description: formData.description,
        category: formData.category as any,
        source: formData.source as any,
        status: formData.status as any,
        date: new Date(formData.date)
      };
      onSubmit?.(transaction.id, submitData);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'wave': return 'bg-secondary text-secondary-foreground';
      case 'orange-money': return 'bg-primary text-primary-foreground';
      default: return '';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Edit Transaction
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                className={errors.amount ? 'border-destructive' : ''}
                data-testid="input-amount"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className={errors.date ? 'border-destructive' : ''}
                  data-testid="input-date"
                />
                <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Web development services, Product sales..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              className={errors.description ? 'border-destructive' : ''}
              data-testid="input-description"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
                <SelectTrigger className={errors.category ? 'border-destructive' : ''} data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">Session</SelectItem>
                  <SelectItem value="session-coaching">Session and coaching</SelectItem>
                  <SelectItem value="monthly-subscription">Monthly subscription</SelectItem>
                  <SelectItem value="weekly-subscription">Weekly subscription</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label htmlFor="source">Payment Source *</Label>
              <Select value={formData.source} onValueChange={(value) => updateField('source', value)}>
                <SelectTrigger className={errors.source ? 'border-destructive' : ''} data-testid="select-source">
                  <SelectValue placeholder="Select payment source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wave">
                    <div className="flex items-center gap-2">
                      Wave
                      <Badge className="bg-secondary text-secondary-foreground text-xs">Auto-sync</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="orange-money">
                    <div className="flex items-center gap-2">
                      Orange Money
                      <Badge className="bg-primary text-primary-foreground text-xs">Auto-sync</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                </SelectContent>
              </Select>
              {errors.source && (
                <p className="text-sm text-destructive">{errors.source}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
              <SelectTrigger data-testid="select-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {formData.amount && formData.description && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Preview:</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formData.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {formData.category && <span className="capitalize">{formData.category}</span>}
                    {formData.source && (
                      <Badge className={`text-xs ${getSourceColor(formData.source)}`}>
                        {formData.source === 'orange-money' ? 'Orange Money' : 
                         formData.source === 'wave' ? 'Wave' : 'Manual'}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {formData.status}
                    </Badge>
                  </div>
                </div>
                {formData.amount && (
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ${parseFloat(formData.amount).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="flex-1" data-testid="button-submit">
              Update Transaction
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
