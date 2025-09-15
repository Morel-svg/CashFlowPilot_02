import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, RotateCcw } from "lucide-react";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangeFilterProps {
  onRangeChange?: (range: DateRange) => void;
  defaultRange?: DateRange;
}

export default function DateRangeFilter({ onRangeChange, defaultRange }: DateRangeFilterProps) {
  const [range, setRange] = useState<DateRange>(
    defaultRange || {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  );

  const presetRanges = [
    {
      label: "Last 7 days",
      value: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      label: "Last 30 days", 
      value: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      label: "This month",
      value: {
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    },
    {
      label: "Last month",
      value: (() => {
        const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1));
        return {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString().split('T')[0],
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).toISOString().split('T')[0]
        };
      })()
    }
  ];

  const handleRangeUpdate = (newRange: DateRange) => {
    setRange(newRange);
    onRangeChange?.(newRange);
    console.log('Date range updated:', newRange);
  };

  const handlePresetClick = (preset: DateRange) => {
    handleRangeUpdate(preset);
  };

  const handleCustomRangeChange = (field: keyof DateRange, value: string) => {
    const newRange = { ...range, [field]: value };
    setRange(newRange);
  };

  const applyCustomRange = () => {
    onRangeChange?.(range);
    console.log('Custom date range applied:', range);
  };

  const resetRange = () => {
    const defaultRange = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    };
    handleRangeUpdate(defaultRange);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysDifference = () => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range Filter
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1" data-testid="badge-current-range">
            <TrendingUp className="h-3 w-3" />
            {formatDate(range.startDate)} - {formatDate(range.endDate)}
          </Badge>
          <Badge variant="secondary" className="text-xs" data-testid="badge-days-count">
            {getDaysDifference()} days
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Select</Label>
          <div className="grid grid-cols-2 gap-2">
            {presetRanges.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
                className="justify-start text-sm hover-elevate"
                data-testid={`button-preset-${index}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Range */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Custom Range</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={range.startDate}
                onChange={(e) => handleCustomRangeChange('startDate', e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={range.endDate}
                min={range.startDate}
                onChange={(e) => handleCustomRangeChange('endDate', e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={applyCustomRange}
              size="sm"
              className="flex-1"
              data-testid="button-apply-range"
            >
              Apply Range
            </Button>
            <Button 
              onClick={resetRange}
              size="sm"
              variant="outline"
              data-testid="button-reset-range"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Range Summary */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Selected Period</p>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {formatDate(range.startDate)} → {formatDate(range.endDate)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {getDaysDifference()} days
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}