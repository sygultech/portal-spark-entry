import React, { useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const subjects = ["Math", "English", "Science", "Break", "Lunch"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const periods = [
  "08:00", "08:45", "09:30", "10:15", "11:00", "11:45", "12:30", "13:15"
];

function DraggableSubject({ subject }: { subject: string }) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: subject });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="draggable bg-blue-100 rounded px-2 py-1 cursor-move border border-blue-300 mb-1"
      style={{ display: "inline-block" }}
    >
      {subject}
    </div>
  );
}

function DroppableCell({ id, children, onDrop }: { id: string; children: React.ReactNode; onDrop?: (subject: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`droppable-cell min-h-[40px] border border-gray-300 rounded flex items-center justify-center ${isOver ? "bg-blue-50" : ""}`}
      style={{ minWidth: 80 }}
    >
      {children}
    </div>
  );
}

export default function DragDropTimetableTemplate({ onSave, onCancel }: { onSave?: (template: any) => void, onCancel?: () => void }) {
  const [grid, setGrid] = useState(() =>
    days.reduce((acc, day) => {
      acc[day] = periods.map(() => null);
      return acc;
    }, {} as Record<string, (string | null)[]>)
  );
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (over && active) {
      const [day, periodIdx] = over.id.split("-");
      setGrid((prev) => {
        const newGrid = { ...prev };
        newGrid[day] = [...newGrid[day]];
        newGrid[day][parseInt(periodIdx)] = active.id;
        return newGrid;
      });
    }
  };

  const handleClearCell = (day: string, periodIdx: number) => {
    setGrid((prev) => {
      const newGrid = { ...prev };
      newGrid[day] = [...newGrid[day]];
      newGrid[day][periodIdx] = null;
      return newGrid;
    });
  };

  const handleSave = () => {
    const template = {
      name: templateName,
      description: templateDescription,
      days,
      periods,
      grid,
    };
    if (onSave) onSave(template);
    else alert("Template saved!\n" + JSON.stringify(template, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow space-y-6">
      <div className="flex gap-4">
        <input
          className="w-1/2 p-2 border rounded-md"
          placeholder="Template Name"
          value={templateName}
          onChange={e => setTemplateName(e.target.value)}
        />
        <input
          className="w-1/2 p-2 border rounded-md"
          placeholder="Description"
          value={templateDescription}
          onChange={e => setTemplateDescription(e.target.value)}
        />
      </div>
      <div>
        <div className="mb-2 font-medium">Palette:</div>
        <div className="flex gap-2 mb-4 flex-wrap">
          {subjects.map((subject) => (
            <DraggableSubject key={subject} subject={subject} />
          ))}
        </div>
        <DndContext onDragEnd={handleDragEnd}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50">Time</th>
                {days.map((day) => (
                  <th key={day} className="border p-2 bg-gray-50">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((time, periodIdx) => (
                <tr key={time}>
                  <td className="border p-2 font-medium text-sm bg-gray-50">{time}</td>
                  {days.map((day) => (
                    <td key={day} className="border p-1">
                      <DroppableCell id={`${day}-${periodIdx}`}>
                        {grid[day][periodIdx] && (
                          <div className="flex items-center gap-1">
                            <span className="bg-blue-200 rounded px-2 py-1 text-xs">{grid[day][periodIdx]}</span>
                            <button
                              className="text-xs text-red-500 ml-1"
                              onClick={() => handleClearCell(day, periodIdx)}
                              title="Clear"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </DroppableCell>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </DndContext>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="btn btn-primary" onClick={handleSave} disabled={!templateName}>Save Template</button>
        {onCancel && <button className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
} 