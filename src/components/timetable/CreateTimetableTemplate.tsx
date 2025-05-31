import React, { useState } from "react";

const defaultWorkingDays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const allDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const defaultPeriods = Array.from({ length: 8 }, (_, i) => ({
  name: `Period ${i + 1}`,
  subject: "",
  teacher: "",
  room: "",
  isBreak: false
}));

export default function CreateTimetableTemplate({ onSave, onCancel }: { onSave?: (template: any) => void, onCancel?: () => void }) {
  const [step, setStep] = useState(1);
  const [template, setTemplate] = useState<any>({
    name: "",
    description: "",
    workingDays: [...defaultWorkingDays],
    periodDuration: 45,
    periodsPerDay: 8,
    breaks: [
      { name: "Morning Break", afterPeriod: 2, duration: 15 },
      { name: "Lunch", afterPeriod: 5, duration: 45 }
    ],
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    periods: [...defaultPeriods]
  });

  // Step 1: Basic Info
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Info</h2>
      <input
        className="w-full p-2 border rounded-md"
        placeholder="Template Name"
        value={template.name}
        onChange={e => setTemplate({ ...template, name: e.target.value })}
      />
      <textarea
        className="w-full p-2 border rounded-md"
        placeholder="Description"
        value={template.description}
        onChange={e => setTemplate({ ...template, description: e.target.value })}
      />
      <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!template.name}>Next</button>
    </div>
  );

  // Step 2: General Structure
  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">General Structure</h2>
      <div>
        <label className="font-medium">Working Days:</label>
        <div className="flex gap-2 flex-wrap mt-2">
          {allDays.map(day => (
            <label key={day} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={template.workingDays.includes(day)}
                onChange={e => {
                  setTemplate({
                    ...template,
                    workingDays: e.target.checked
                      ? [...template.workingDays, day]
                      : template.workingDays.filter((d: string) => d !== day)
                  });
                }}
              />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="font-medium">Periods per Day:</label>
          <input
            type="number"
            min={1}
            max={12}
            className="w-20 p-2 border rounded-md ml-2"
            value={template.periodsPerDay}
            onChange={e => {
              const val = parseInt(e.target.value);
              setTemplate({
                ...template,
                periodsPerDay: val,
                periods: Array.from({ length: val }, (_, i) => template.periods[i] || { name: `Period ${i + 1}`, subject: "", teacher: "", room: "", isBreak: false })
              });
            }}
          />
        </div>
        <div>
          <label className="font-medium">Period Duration (min):</label>
          <input
            type="number"
            min={30}
            max={90}
            className="w-20 p-2 border rounded-md ml-2"
            value={template.periodDuration}
            onChange={e => setTemplate({ ...template, periodDuration: parseInt(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <label className="font-medium">School Start Time:</label>
          <input
            type="time"
            className="ml-2 p-2 border rounded-md"
            value={template.schoolStartTime}
            onChange={e => setTemplate({ ...template, schoolStartTime: e.target.value })}
          />
        </div>
        <div>
          <label className="font-medium">School End Time:</label>
          <input
            type="time"
            className="ml-2 p-2 border rounded-md"
            value={template.schoolEndTime}
            onChange={e => setTemplate({ ...template, schoolEndTime: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="font-medium">Breaks/Lunch:</label>
        <div className="space-y-2 mt-2">
          {template.breaks.map((br: any, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                className="w-32 p-2 border rounded-md"
                value={br.name}
                onChange={e => {
                  const newBreaks = [...template.breaks];
                  newBreaks[idx].name = e.target.value;
                  setTemplate({ ...template, breaks: newBreaks });
                }}
                placeholder="Break Name"
              />
              <input
                type="number"
                className="w-20 p-2 border rounded-md"
                value={br.afterPeriod}
                min={1}
                max={template.periodsPerDay}
                onChange={e => {
                  const newBreaks = [...template.breaks];
                  newBreaks[idx].afterPeriod = parseInt(e.target.value);
                  setTemplate({ ...template, breaks: newBreaks });
                }}
                placeholder="After Period"
              />
              <input
                type="number"
                className="w-20 p-2 border rounded-md"
                value={br.duration}
                min={5}
                max={90}
                onChange={e => {
                  const newBreaks = [...template.breaks];
                  newBreaks[idx].duration = parseInt(e.target.value);
                  setTemplate({ ...template, breaks: newBreaks });
                }}
                placeholder="Duration"
              />
              <button className="text-red-500" onClick={() => setTemplate({ ...template, breaks: template.breaks.filter((_: any, i: number) => i !== idx) })}>Remove</button>
            </div>
          ))}
          <button className="btn btn-outline" onClick={() => setTemplate({ ...template, breaks: [...template.breaks, { name: "Break", afterPeriod: 1, duration: 10 }] })}>Add Break</button>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
        <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
      </div>
    </div>
  );

  // Step 3: Period Details
  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Period Details</h2>
      <div className="space-y-2">
        {template.periods.map((period: any, idx: number) => (
          <div key={idx} className="flex gap-2 items-center">
            <input
              className="w-32 p-2 border rounded-md"
              value={period.name}
              onChange={e => {
                const newPeriods = [...template.periods];
                newPeriods[idx].name = e.target.value;
                setTemplate({ ...template, periods: newPeriods });
              }}
              placeholder={`Period ${idx + 1}`}
            />
            <input
              className="w-32 p-2 border rounded-md"
              value={period.subject}
              onChange={e => {
                const newPeriods = [...template.periods];
                newPeriods[idx].subject = e.target.value;
                setTemplate({ ...template, periods: newPeriods });
              }}
              placeholder="Subject"
            />
            <input
              className="w-32 p-2 border rounded-md"
              value={period.teacher}
              onChange={e => {
                const newPeriods = [...template.periods];
                newPeriods[idx].teacher = e.target.value;
                setTemplate({ ...template, periods: newPeriods });
              }}
              placeholder="Teacher"
            />
            <input
              className="w-24 p-2 border rounded-md"
              value={period.room}
              onChange={e => {
                const newPeriods = [...template.periods];
                newPeriods[idx].room = e.target.value;
                setTemplate({ ...template, periods: newPeriods });
              }}
              placeholder="Room"
            />
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={period.isBreak}
                onChange={e => {
                  const newPeriods = [...template.periods];
                  newPeriods[idx].isBreak = e.target.checked;
                  setTemplate({ ...template, periods: newPeriods });
                }}
              />
              Break
            </label>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button className="btn btn-outline" onClick={() => setStep(2)}>Back</button>
        <button className="btn btn-primary" onClick={() => setStep(4)}>Next</button>
      </div>
    </div>
  );

  // Step 4: Review & Save
  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Review & Save</h2>
      <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">{JSON.stringify(template, null, 2)}</pre>
      <div className="flex gap-2 mt-4">
        <button className="btn btn-outline" onClick={() => setStep(3)}>Back</button>
        <button className="btn btn-primary" onClick={() => onSave ? onSave(template) : alert("Template saved!\n" + JSON.stringify(template, null, 2))}>Save Template</button>
        {onCancel && <button className="btn btn-outline" onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
} 