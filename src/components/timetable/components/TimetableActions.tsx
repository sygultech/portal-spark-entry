
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Calendar } from "lucide-react";

interface TimetableActionsProps {
  isWeeklyMode: boolean;
  onModeChange: (isWeekly: boolean) => void;
  onSaveConfiguration: () => void;
  fortnightStartDate?: string;
  onFortnightStartDateChange?: (date: string) => void;
}

export const TimetableActions = ({
  isWeeklyMode,
  onModeChange,
  onSaveConfiguration,
  fortnightStartDate,
  onFortnightStartDateChange
}: TimetableActionsProps) => {
  const handleModeChange = (checked: boolean) => {
    if (checked && isWeeklyMode) {
      // Switching from weekly to fortnightly mode - show warning
      const confirmSwitch = window.confirm(
        "⚠️ ADVANCED CONFIGURATION WARNING ⚠️\n\n" +
        "You are about to enable Fortnightly timetable mode. This is an advanced feature that:\n\n" +
        "• Creates a 2-week rotating schedule instead of a weekly one\n" +
        "• Requires careful planning and understanding of complex scheduling\n" +
        "• Is used by very few schools with specialized needs\n" +
        "• Can complicate timetable management significantly\n\n" +
        "Most schools should use Weekly mode. Do you really know what you're doing?\n\n" +
        "If you're unsure, we strongly recommend:\n" +
        "1. Staying with Weekly mode\n" +
        "2. Consulting with your IT administrator\n" +
        "3. Seeking support from our team\n\n" +
        "Do you want to proceed with Fortnightly mode?"
      );
      
      if (!confirmSwitch) {
        return; // Don't change mode if user cancels
      }
    }
    onModeChange(!checked);
  };

  return (
    <div className="space-y-4">
      {/* Fortnightly Mode Warning */}
      {!isWeeklyMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">⚠️ Advanced Configuration Active</p>
              <p className="text-sm">
                You are using Fortnightly mode - an advanced timetable configuration. 
                This creates a 2-week rotating schedule that most schools don't need.
              </p>
              <p className="text-sm">
                <strong>Why Fortnight Start Date is required:</strong> The system needs to know 
                which week of your fortnight cycle corresponds to which calendar dates. This ensures 
                the correct timetable is displayed on the right days.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Fortnight Start Date Input */}
      {!isWeeklyMode && (
        <div className="space-y-2">
          <Label htmlFor="fortnight-start-date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Fortnight Start Date *
          </Label>
          <Input
            id="fortnight-start-date"
            type="date"
            value={fortnightStartDate || ''}
            onChange={(e) => onFortnightStartDateChange?.(e.target.value)}
            className="max-w-md"
            required
          />
          <p className="text-sm text-muted-foreground">
            Select the Monday that starts Week 1 of your fortnight cycle. 
            This date determines which week pattern is active on any given day.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          <Label htmlFor="timetable-mode" className="text-sm font-medium">
            Timetable Mode:
          </Label>
          <div className="flex items-center gap-2">
            <span className={`text-sm ${isWeeklyMode ? 'font-medium' : 'text-muted-foreground'}`}>
              Weekly
            </span>
            <Switch
              id="timetable-mode"
              checked={!isWeeklyMode}
              onCheckedChange={handleModeChange}
            />
            <span className={`text-sm ${!isWeeklyMode ? 'font-medium text-orange-600' : 'text-muted-foreground'}`}>
              Fortnightly
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            Save as Template
          </Button>
          <Button onClick={onSaveConfiguration}>
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
