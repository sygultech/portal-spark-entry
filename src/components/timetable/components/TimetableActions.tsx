
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TimetableActionsProps {
  isWeeklyMode: boolean;
  onModeChange: (isWeekly: boolean) => void;
  onSaveConfiguration: () => void;
}

export const TimetableActions = ({
  isWeeklyMode,
  onModeChange,
  onSaveConfiguration
}: TimetableActionsProps) => {
  return (
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
            onCheckedChange={(checked) => onModeChange(!checked)}
          />
          <span className={`text-sm ${!isWeeklyMode ? 'font-medium' : 'text-muted-foreground'}`}>
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
  );
};
