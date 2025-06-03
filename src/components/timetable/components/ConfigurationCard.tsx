
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Timer, Settings, Copy, Eye, Trash2, Tag } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ConfigurationCardProps {
  config: {
    id: string;
    name: string;
    isActive: boolean;
    isDefault: boolean;
  };
  onEdit: (configId: string) => void;
  onClone: (configId: string) => void;
  onView: (configId: string) => void;
  onToggleActive: (configId: string) => void;
  onToggleDefault: (configId: string) => void;
  onBatchTagging: (configId: string) => void;
  onRemove: (configId: string) => void;
}

export const ConfigurationCard: React.FC<ConfigurationCardProps> = ({
  config,
  onEdit,
  onClone,
  onView,
  onToggleActive,
  onToggleDefault,
  onBatchTagging,
  onRemove
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <span className="truncate">{config.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {config.isActive && (
              <Badge variant="success" className="bg-green-100 text-green-700 hover:bg-green-100">
                Active
              </Badge>
            )}
            {config.isDefault && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                Default
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toggle Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Switch
                checked={config.isActive}
                onCheckedChange={() => onToggleActive(config.id)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Default</span>
              <Switch
                checked={config.isDefault}
                onCheckedChange={() => onToggleDefault(config.id)}
              />
            </div>
          </div>

          {/* Batch Tagging Icon */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onBatchTagging(config.id)}
                  disabled={config.isDefault}
                  className={`${config.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {config.isDefault 
                  ? "Default configurations apply to all batches automatically. Cannot tag specific batches."
                  : "Tag batches to this configuration"
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(config.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClone(config.id)}
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-1" />
            Clone
          </Button>
          
          <Button
            variant="default"
            size="sm"
            onClick={() => onEdit(config.id)}
            className="flex-1"
          >
            <Settings className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(config.id)}
            className="text-destructive hover:text-destructive px-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
