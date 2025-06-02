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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodConfigurationFormProps {
  totalPeriods: number;
  periods: Period[];
  isPeriodsExpanded: boolean;
  onTotalPeriodsChange: (value: string) => void;
  onPeriodsExpandedChange: (expanded: boolean) => void;
  onPeriodsChange: (periods: Period[]) => void;
}

export const PeriodConfigurationForm: React.FC<PeriodConfigurationFormProps> = ({
  totalPeriods,
  periods,
  isPeriodsExpanded,
  onTotalPeriodsChange,
  onPeriodsExpandedChange,
  onPeriodsChange
}) => {
  const validationErrors = validatePeriodTimings(periods);
  const hasErrors = validationErrors.length > 0;

  const getErrorsForPeriod = (periodId: string): ValidationError[] => {
    return validationErrors.filter(error => error.id === periodId);
  };

  const handlePeriodChange = (index: number, field: keyof Period, value: any) => {
    const updatedPeriods = [...periods];
    updatedPeriods[index] = {
      ...updatedPeriods[index],
      [field]: value
    };
    onPeriodsChange(updatedPeriods);
  };

  const addPeriod = () => {
    const newPeriod: Period = {
      id: crypto.randomUUID(),
      number: periods.length + 1,
      startTime: '',
      endTime: '',
      type: 'period',
      dayOfWeek: periods[0]?.dayOfWeek || null,
      isFortnightly: periods[0]?.isFortnightly || false,
      fortnightWeek: periods[0]?.fortnightWeek || null
    };
    onPeriodsChange([...periods, newPeriod]);
  };

  const removePeriod = (index: number) => {
    const updatedPeriods = periods.filter((_, i) => i !== index);
    // Renumber remaining periods
    updatedPeriods.forEach((period, i) => {
      period.number = i + 1;
    });
    onPeriodsChange(updatedPeriods);
  };

  const addBreak = (afterPeriodIndex: number) => {
    const newBreak: Period = {
      id: crypto.randomUUID(),
      number: periods[afterPeriodIndex].number + 0.5,
      startTime: periods[afterPeriodIndex].endTime,
      endTime: periods[afterPeriodIndex + 1]?.startTime || '',
      type: 'break',
      label: 'Break',
      dayOfWeek: periods[0]?.dayOfWeek || null,
      isFortnightly: periods[0]?.isFortnightly || false,
      fortnightWeek: periods[0]?.fortnightWeek || null
    };

    const updatedPeriods = [
      ...periods.slice(0, afterPeriodIndex + 1),
      newBreak,
      ...periods.slice(afterPeriodIndex + 1)
    ];

    onPeriodsChange(updatedPeriods);
  };

  const handleTimeChange = (id: string, field: 'startTime' | 'endTime', value: string) => {
    handlePeriodChange(periods.findIndex(p => p.id === id), field, value);
    
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
                <div key={period.id} className={`flex items-start gap-4 p-4 border rounded-lg ${
                  hasError 
                    ? 'bg-red-50 border-red-200' 
                    : period.type === 'break' 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-24">
                        <Label>Type</Label>
                        <Select
                          value={period.type}
                          onValueChange={(value: 'period' | 'break') => handlePeriodChange(index, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="period">Period</SelectItem>
                            <SelectItem value="break">Break</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {period.type === 'break' && (
                        <div className="flex-1">
                          <Label>Label</Label>
                          <Input
                            value={period.label || ''}
                            onChange={(e) => handlePeriodChange(index, 'label', e.target.value)}
                            placeholder="e.g., Lunch Break"
                          />
                        </div>
                      )}

                      <div className="w-32">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={period.startTime}
                          onChange={(e) => handleTimeChange(period.id, 'startTime', e.target.value)}
                        />
                      </div>

                      <div className="w-32">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={period.endTime}
                          onChange={(e) => handleTimeChange(period.id, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removePeriod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {period.type === 'period' && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => addBreak(index)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button onClick={addPeriod} className="w-full">
        Add Period
      </Button>
    </div>
  );
};
