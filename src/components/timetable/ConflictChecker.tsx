
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, RefreshCw, Users, MapPin, Clock, FileText } from "lucide-react";

interface ConflictCheckerProps {
  selectedClass: string;
  selectedTerm: string;
}

// Mock conflict data
const mockConflicts = [
  {
    id: "conflict-1",
    type: "teacher_double_booking",
    severity: "high",
    description: "Ms. Johnson is assigned to Grade 6A and Grade 6B at the same time",
    details: {
      teacher: "Ms. Johnson",
      time: "Monday, 08:00 - 08:45",
      classes: ["Grade 6A", "Grade 6B"],
      subject: "Mathematics"
    },
    suggestions: [
      "Move Grade 6B Math to 09:30 - 10:15",
      "Assign substitute teacher for Grade 6B",
      "Swap with another teacher's free period"
    ]
  },
  {
    id: "conflict-2",
    type: "room_double_booking",
    severity: "medium",
    description: "Room 101 is booked for two different classes simultaneously",
    details: {
      room: "Room 101",
      time: "Tuesday, 10:30 - 11:15",
      classes: ["Grade 6A", "Grade 7A"],
      subjects: ["Math", "English"]
    },
    suggestions: [
      "Move Grade 7A English to Room 102",
      "Reschedule one of the classes",
      "Use Science Lab for English if available"
    ]
  },
  {
    id: "conflict-3",
    type: "teacher_overload",
    severity: "low",
    description: "Dr. Brown exceeds maximum workload limit",
    details: {
      teacher: "Dr. Brown",
      currentWorkload: 32,
      maxWorkload: 30,
      overloadPeriods: 2
    },
    suggestions: [
      "Redistribute 2 periods to other Science teachers",
      "Adjust maximum workload settings",
      "Consider hiring additional Science faculty"
    ]
  }
];

const mockValidationResults = {
  totalChecks: 156,
  passed: 153,
  failed: 3,
  warnings: 2,
  lastCheck: "2024-05-27 14:30:00"
};

export const ConflictChecker = ({ selectedClass, selectedTerm }: ConflictCheckerProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const runConflictCheck = async () => {
    setIsChecking(true);
    // Simulate checking process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsChecking(false);
    console.log("Conflict check completed");
  };

  const resolveConflict = (conflictId: string, suggestion: string) => {
    console.log(`Resolving conflict ${conflictId} with suggestion: ${suggestion}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-orange-100 text-orange-800 border-orange-200";
      case "low": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "low": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case "teacher_double_booking": return <Users className="h-4 w-4" />;
      case "room_double_booking": return <MapPin className="h-4 w-4" />;
      case "teacher_overload": return <Clock className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredConflicts = activeFilter === "all" 
    ? mockConflicts 
    : mockConflicts.filter(conflict => conflict.severity === activeFilter);

  return (
    <div className="space-y-6">
      {/* Conflict Checker Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className={`h-5 w-5 ${isChecking ? "animate-spin" : ""}`} />
              Conflict Checker
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={runConflictCheck} 
                disabled={isChecking}
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "Checking..." : "Run Check"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Detect and resolve scheduling conflicts for {selectedClass} in {selectedTerm}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Validation Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Total Checks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockValidationResults.totalChecks}</div>
            <p className="text-xs text-muted-foreground">validation rules</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockValidationResults.passed}</div>
            <p className="text-xs text-muted-foreground">checks passed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockValidationResults.failed}</div>
            <p className="text-xs text-muted-foreground">need resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{mockValidationResults.warnings}</div>
            <p className="text-xs text-muted-foreground">minor issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Last Check Information */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">Last Conflict Check</p>
                <p className="text-sm text-muted-foreground">{mockValidationResults.lastCheck}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">
                {Math.round((mockValidationResults.passed / mockValidationResults.totalChecks) * 100)}% Compliance
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Detected Conflicts
            <div className="flex gap-2">
              <Button 
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                size="sm"
              >
                All ({mockConflicts.length})
              </Button>
              <Button 
                variant={activeFilter === "high" ? "default" : "outline"}
                onClick={() => setActiveFilter("high")}
                size="sm"
              >
                High (1)
              </Button>
              <Button 
                variant={activeFilter === "medium" ? "default" : "outline"}
                onClick={() => setActiveFilter("medium")}
                size="sm"
              >
                Medium (1)
              </Button>
              <Button 
                variant={activeFilter === "low" ? "default" : "outline"}
                onClick={() => setActiveFilter("low")}
                size="sm"
              >
                Low (1)
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredConflicts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No conflicts found in the current timetable</p>
              <p className="text-sm">Your schedule is ready for publishing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConflicts.map((conflict) => (
                <Card key={conflict.id} className={`border-l-4 ${getSeverityColor(conflict.severity)}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getConflictTypeIcon(conflict.type)}
                        <div>
                          <span className="font-medium">{conflict.description}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSeverityColor(conflict.severity)}>
                              {getSeverityIcon(conflict.severity)}
                              <span className="ml-1 capitalize">{conflict.severity}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Conflict Details */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h5 className="font-medium text-sm mb-2">Conflict Details:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {conflict.details.teacher && (
                            <div><strong>Teacher:</strong> {conflict.details.teacher}</div>
                          )}
                          {conflict.details.room && (
                            <div><strong>Room:</strong> {conflict.details.room}</div>
                          )}
                          {conflict.details.time && (
                            <div><strong>Time:</strong> {conflict.details.time}</div>
                          )}
                          {conflict.details.classes && (
                            <div><strong>Classes:</strong> {conflict.details.classes.join(", ")}</div>
                          )}
                          {conflict.details.currentWorkload && (
                            <div><strong>Current Load:</strong> {conflict.details.currentWorkload}/{conflict.details.maxWorkload} periods</div>
                          )}
                        </div>
                      </div>

                      {/* Suggested Solutions */}
                      <div>
                        <h5 className="font-medium text-sm mb-2">Suggested Solutions:</h5>
                        <div className="space-y-2">
                          {conflict.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded border">
                              <span className="text-sm">{suggestion}</span>
                              <Button 
                                onClick={() => resolveConflict(conflict.id, suggestion)}
                                size="sm"
                                variant="outline"
                              >
                                Apply
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Readiness */}
      {mockConflicts.length === 0 ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ready for Publishing:</strong> No conflicts detected. Your timetable is ready to be published and distributed to students and teachers.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Publishing Blocked:</strong> Please resolve all conflicts before publishing the timetable. 
            {mockConflicts.filter(c => c.severity === "high").length > 0 && " High-priority conflicts must be resolved immediately."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
