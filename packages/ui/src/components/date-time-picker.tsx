"use client";

import * as React from "react";
import { Calendar } from "./calendar";
import { TimePickerInput } from "./time-picker";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DateTimePicker({
  date,
  setDate,
  className,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date,
  );

  // Update internal state when prop changes
  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      if (selectedDate) {
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
      }
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  const handleTimeChange = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      setDate(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP HH:mm") : <span>Pick a date and time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="border-t p-3 space-x-2 flex items-center justify-center">
          <TimePickerInput
            date={selectedDate}
            setDate={handleTimeChange}
            picker="hours"
            aria-label="Hours"
          />
          <span className="text-sm">:</span>
          <TimePickerInput
            date={selectedDate}
            setDate={handleTimeChange}
            picker="minutes"
            aria-label="Minutes"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
