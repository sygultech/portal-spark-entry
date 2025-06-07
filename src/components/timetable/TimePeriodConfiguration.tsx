
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Save, X } from "lucide-react";
import { Period } from "./types/TimePeriodTypes";
import { PeriodConfigurationForm } from "./components/PeriodConfigurationForm";
import { WeekDaysSelector } from "./components/WeekDaysSelector";
import { DaySpecificConfig } from "./components/DaySpecificConfig";
import { TimetableActions } from "./components/TimetableActions";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTimetableConfiguration } from "@/hooks/useTimetableConfiguration";
import React, { useState, useEffect } from "react";
import { TimePeriodConfigurationReadOnly } from "./components/TimePeriodConfigurationReadOnly";

interface TimePeriodConfigurationProps {
  configId: string;
  onClose: () => void;
  onSave: () => void;
  academicYearId: string;
  configName: string;
  isActive: boolean;
  isDefault: boolean;
  mode?: 'view' | 'edit';
}

export const TimePeriodConfiguration = ({
  configId,
  onClose,
  onSave,
  academicYearId,
  configName,
  isActive,
  isDefault,
  mode = 'edit'
}: TimePeriodConfigurationProps) => {
  const { profile } = useAuth();
  const { saveTimetableConfiguration, getTimetableConfigurations } = useTimetableConfiguration();
  const [totalPeriods, setTotalPeriods] = useState(6);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [isPeriodsExpanded, setIsPeriodsExpanded] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
  ]);
  const [isWeeklyMode, setIsWeeklyMode] = useState(true);
  const [fortnightStartDate, setFortnightStartDate] = useState<string>('');
  const [daySpecificPeriods, setDaySpecificPeriods] = useState<Record<string, Period[]>>({});
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingConfig, setIsExistingConfig] = useState(false);

  // Check if this is an existing configuration (not a new one)
  useEffect(() => {
    // If configId doesn't start with 'config-' (our new config pattern), it's an existing config
    setIsExistingConfig(!configId.startsWith('config-'));
  }, [configId]);

  // Fetch configuration data when editing existing configuration or in view mode
  useEffect(() => {
    const fetchConfigurationData = async () => {
      if ((mode === 'edit' && isExistingConfig) || mode === 'view') {
        if (!profile?.school_id || !academicYearId) return;
        
        setIsLoading(true);
        try {
          console.log('Fetching configuration data for editing/viewing...', { configId, mode, isExistingConfig });
          const configs = await getTimetableConfigurations(profile.school_id, academicYearId);
          const currentConfig = configs.find(config => config.id === configId);
          
          if (currentConfig) {
            console.log('Found configuration for editing:', currentConfig);
            
            // Set periods and calculate total periods count
            setPeriods(currentConfig.defaultPeriods);
            setTotalPeriods(currentConfig.defaultPeriods.filter(p => p.type === 'period').length);
            
            // Set selected days
            setSelectedDays(currentConfig.selectedDays);
            
            // Set mode and fortnight settings
            setIsWeeklyMode(currentConfig.isWeeklyMode);
            setFortnightStartDate(currentConfig.fortnightStartDate || '');
            
            // Set day-specific periods
            setDaySpecificPeriods(currentConfig.daySpecificPeriods || {});
          } else {
            console.warn('Configuration not found for editing:', configId);
            toast({
              title: "Configuration Not Found",
              description: "The requested configuration could not be loaded.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error fetching configuration for editing:', error);
          toast({
            title: "Error Loading Configuration",
            description: "Failed to load configuration data for editing.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchConfigurationData();
  }, [mode, configId, isExistingConfig, profile?.school_id, academicYearId, getTimetableConfigurations]);

  // Handle mode changes and reset selected days appropriately
  useEffect(() => {
    if (mode === 'edit' && !isLoading) {
      if (isWeeklyMode) {
        // Convert fortnightly days back to weekly days if switching from fortnightly to weekly
        const weeklyDays = selectedDays
          .map(dayId => {
            if (dayId.includes('-')) {
              const [_, dayPart] = dayId.split('-');
              return dayPart;
            }
            return dayId;
          })
          .filter((day, index, array) => array.indexOf(day) === index); // Remove duplicates
        
        if (weeklyDays.length !== selectedDays.length || selectedDays.some(day => day.includes('-'))) {
          setSelectedDays(weeklyDays);
          setDaySpecificPeriods({}); // Reset day-specific periods when switching modes
        }
      } else {
        // Convert weekly days to fortnightly days if switching from weekly to fortnightly
        if (selectedDays.length > 0 && !selectedDays.some(day => day.includes('-'))) {
          const fortnightDays: string[] = [];
          selectedDays.forEach(day => {
            fortnightDays.push(`week1-${day}`);
            fortnightDays.push(`week2-${day}`);
          });
          setSelectedDays(fortnightDays);
          setDaySpecificPeriods({}); // Reset day-specific periods when switching modes
        }
      }
      
      // Reset validation state when mode changes
      if (hasTriedToSubmit) {
        setHasTriedToSubmit(false);
      }
    }
  }, [isWeeklyMode, mode, isLoading]);

  // Generate default periods based on total periods count (only for new configurations)
  useEffect(() => {
    if (!isExistingConfig && mode === 'edit' && !isLoading) {
      const newPeriods: Period[] = [];
      
      for (let i = 1; i <= totalPeriods; i++) {
        const startHour = 8 + Math.floor((i - 1) * 0.75); // Roughly 45 min periods
        const startMinute = ((i - 1) * 45) % 60;
        const endMinute = (i * 45) % 60;
        const endHour = 8 + Math.floor((i * 45) / 60);
        
        newPeriods.push({
          id: `period-${i}`,
          number: i,
          startTime: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
          endTime: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
          type: 'period',
          label: `Period ${i}`
        });
      }
      
      setPeriods(newPeriods);
    }
  }, [totalPeriods, isExistingConfig, mode, isLoading]);

  const handleSaveConfiguration = async () => {
    setHasTriedToSubmit(true);

    // Validate school days selection
    if (selectedDays.length === 0) {
      toast({
        title: "School Days Required",
        description: "Please select at least one school day before submitting the configuration.",
        variant: "destructive"
      });
      return;
    }

    // Validate that all ACTUAL period numbers (not breaks) are integers
    const actualPeriods = periods.filter(period => period.type === 'period');
    const hasNonIntegerNumbers = actualPeriods.some(period => !Number.isInteger(period.number));
    if (hasNonIntegerNumbers) {
      toast({
        title: "Validation Error",
        description: "All period numbers must be integers",
        variant: "destructive"
      });
      return;
    }

    // Validate configuration before saving
    if (!isWeeklyMode && !fortnightStartDate) {
      toast({
        title: "Validation Error",
        description: "Fortnight start date is required for fortnightly mode",
        variant: "destructive"
      });
      return;
    }

    if (!profile?.school_id) {
      toast({
        title: "Error",
        description: "School information not found",
        variant: "destructive"
      });
      return;
    }

    const result = await saveTimetableConfiguration({
      schoolId: profile.school_id,
      name: configName,
      isActive,
      isDefault,
      academicYearId,
      isWeeklyMode,
      fortnightStartDate: isWeeklyMode ? null : fortnightStartDate,
      selectedDays, // Keep the full day IDs (e.g., 'week1-monday')
      defaultPeriods: periods,
      daySpecificPeriods,
      enableFlexibleTimings: Object.keys(daySpecificPeriods).length > 0,
      batchIds: null // Handle this if batch tagging is needed
    });

    if (result) {
      setHasTriedToSubmit(false);
      onSave();
    }
  };

  const handleTotalPeriodsChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      setTotalPeriods(numValue);
    }
  };

  const updatePeriodTime = (periodId: string, field: 'startTime' | 'endTime', value: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === periodId ? { ...period, [field]: value } : period
    ));
  };

  const addBreakAfterPeriod = (periodId: string) => {
    const periodIndex = periods.findIndex(p => p.id === periodId);
    if (periodIndex === -1) return;

    const currentPeriod = periods[periodIndex];
    const nextPeriod = periods[periodIndex + 1];
    
    // Create break with unique ID but don't affect period numbering
    const breakPeriod: Period = {
      id: `break-${Date.now()}`,
      number: currentPeriod.number + 0.5, // Use decimal to indicate it's between periods
      startTime: currentPeriod.endTime,
      endTime: nextPeriod?.startTime || '09:00',
      type: 'break',
      label: 'Break'
    };

    // Insert the break without changing any period numbers
    const newPeriods = [...periods];
    newPeriods.splice(periodIndex + 1, 0, breakPeriod);
    setPeriods(newPeriods);
  };

  const removeBreak = (breakId: string) => {
    // Simply remove the break without affecting period numbers
    setPeriods(prev => prev.filter(period => period.id !== breakId));
  };

  const updateBreakLabel = (breakId: string, label: string) => {
    setPeriods(prev => prev.map(period => 
      period.id === breakId ? { ...period, label } : period
    ));
  };

  const handleUpdateDayPeriods = (dayId: string, updatedPeriods: Period[]) => {
    setDaySpecificPeriods(prev => ({
      ...prev,
      [dayId]: updatedPeriods
    }));
  };

  const handleSelectedDaysChange = (days: string[]) => {
    setSelectedDays(days);
    // Reset hasTriedToSubmit when user makes changes to school days
    if (hasTriedToSubmit && days.length > 0) {
      setHasTriedToSubmit(false);
    }
  };

  const handleModeChange = (newMode: boolean) => {
    setIsWeeklyMode(newMode);
    // Reset validation state when mode changes
    if (hasTriedToSubmit) {
      setHasTriedToSubmit(false);
    }
  };

  if (mode === 'view') {
    return (
      <TimePeriodConfigurationReadOnly
        configName={configName}
        onClose={onClose}
        periods={periods}
        selectedDays={selectedDays}
        isWeeklyMode={isWeeklyMode}
        daySpecificPeriods={daySpecificPeriods}
      />
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Loading Configuration...
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isExistingConfig ? `Edit: ${configName}` : 'Configure Period Configuration'}
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          {isExistingConfig ? 
            `Modify the settings and timings for ${configName}.` :
            "Set up periods, timings, and scheduling options for this configuration."
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Week Days Selector with validation */}
        <WeekDaysSelector
          selectedDays={selectedDays}
          onSelectedDaysChange={handleSelectedDaysChange}
          isWeeklyMode={isWeeklyMode}
          hasError={hasTriedToSubmit && selectedDays.length === 0}
        />

        {/* Period Configuration Form */}
        <PeriodConfigurationForm
          totalPeriods={totalPeriods}
          periods={periods}
          isPeriodsExpanded={isPeriodsExpanded}
          onTotalPeriodsChange={handleTotalPeriodsChange}
          onPeriodsExpandedChange={setIsPeriodsExpanded}
          onUpdatePeriodTime={updatePeriodTime}
          onAddBreakAfterPeriod={addBreakAfterPeriod}
          onRemoveBreak={removeBreak}
          onUpdateBreakLabel={updateBreakLabel}
        />

        {/* Day-Specific Configuration */}
        <DaySpecificConfig
          selectedDays={selectedDays}
          isWeeklyMode={isWeeklyMode}
          defaultPeriods={periods}
          onUpdateDayPeriods={handleUpdateDayPeriods}
          daySpecificPeriods={daySpecificPeriods}
        />

        {/* Timetable Actions */}
        <TimetableActions
          isWeeklyMode={isWeeklyMode}
          onModeChange={handleModeChange}
          onSaveConfiguration={handleSaveConfiguration}
          fortnightStartDate={fortnightStartDate}
          onFortnightStartDateChange={setFortnightStartDate}
        />
      </CardContent>
    </Card>
  );
};
