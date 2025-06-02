
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Clock, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Coffee,
  BookOpen,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Period } from "../types/TimePeriodTypes";
import { validatePeriodTimings, ValidationError } from "../utils/timeValidation";

interface PeriodConfigurationFormProps {
  totalPeriods: number;
  periods: Period[];
  isPeriodsExpanded: boolean;
  onTotalPeriodsChange: (value: string) => void;
  onPeriodsExpandedChange: (expanded: boolean) => void;
  onUpdatePeriodTime: (id: string, field: 'startTime' | 'endTime', value: string) => void;
  onAddBreakAfterPeriod: (afterPeriodId: string) => void;
  onRemoveBreak: (breakId: string) => void;
  onUpdateBreakLabel: (id: string, label: string) => void;
}

export const PeriodConfigurationForm = ({
  totalPeriods,
  periods,
  isPeriodsExpanded,
  onTotalPeriodsChange,
  onPeriodsExpandedChange,
  onUpdatePeriodTime,
  onAddBreakAfterPeriod,
  onRemoveBreak,
  onUpdateBreakLabel
}: PeriodConfigurationFormProps) => {
  const validationErrors = validatePeriodTimings(periods);
  const hasErrors = validationErrors.length > 0;

  const getErrorsForPeriod = (periodId: string): ValidationError[] => {
    return validationErrors.filter(error => error.id === periodId);
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    onUpdatePeriodTime(id, field, value);
    
    // Show toast for validation errors after a brief delay to allow state to update
    setTimeout(() => {
      const newErrors = validatePeriodTimings(periods);
      const periodErrors = newErrors.filter(error => error.id === id);
      
      if (periodErrors.length > 0) {
        toast({
          title: "Timing Conflict",
          description: periodErrors[0].message,
          variant: "destructive"
        });
      }
    }, 100);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="total-periods">Total Periods Per Day</Label>
        <Input
          id="total-periods"
          type="number"
          min="1"
          max="12"
          value={totalPeriods}
          onChange={(e) => onTotalPeriodsChange(e.target.value)}
          className="w-24"
        />
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Timing conflicts detected:</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {validationErrors.slice(0, 3).map((error, index) => (
                  <li key={`${error.id}-${index}`}>{error.message}</li>
                ))}
                {validationErrors.length > 3 && (
                  <li>... and {validationErrors.length - 3} more conflicts</li>
                )}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Collapsible open={isPeriodsExpanded} onOpenChange={onPeriodsExpandedChange}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Period & Break Timings
              {hasErrors && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </span>
            {isPeriodsExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-4">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {periods.map((period, index) => {
              const periodErrors = getErrorsForPeriod(period.id);
              const hasError = periodErrors.length > 0;
              
              return (
                <div key={period.id} className={`flex items-center gap-3 p-3 rounded-lg border ${
                  hasError 
                    ? 'bg-red-50 border-red-200' 
                    : period.type === 'break' 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {period.type === 'period' ? (
                      <>
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">Period {period.number}</span>
                      </>
                    ) : (
                      <>
                        <Coffee className="h-4 w-4 text-orange-600" />
                        <Input
                          value={period.label || ''}
                          onChange={(e) => onUpdateBreakLabel(period.id, e.target.value)}
                          placeholder="Break name"
                          className="text-sm h-8 max-w-32"
                        />
                      </>
                    )}
                    {hasError && (
                      <span title={periodErrors[0].message}>
                        <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={period.startTime}
                      onChange={(e) => handleTimeChange(period.id, 'startTime', e.target.value)}
                      className={`w-24 h-8 text-sm ${hasError ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={period.endTime}
                      onChange={(e) => handleTimeChange(period.id, 'endTime', e.target.value)}
                      className={`w-24 h-8 text-sm ${hasError ? 'border-red-300 focus:border-red-500' : ''}`}
                    />
                  </div>

                  <div className="flex gap-1">
                    {period.type === 'period' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAddBreakAfterPeriod(period.id)}
                        className="h-8 w-8 p-0"
                        title="Add break after this period"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {period.type === 'break' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveBreak(period.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        title="Remove break"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
