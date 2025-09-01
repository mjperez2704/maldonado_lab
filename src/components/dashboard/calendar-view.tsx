"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';

type Appointment = {
  date: Date;
  title: string;
  time: string;
};

export function CalendarView() {
  const [date, setDate] = useState<Date | undefined>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const today = new Date();
    setDate(today);

    const getRelativeDate = (days: number) => {
        const relativeDate = new Date();
        relativeDate.setDate(today.getDate() + days);
        relativeDate.setHours(0, 0, 0, 0);
        return relativeDate;
    }

    setAppointments([
      { date: getRelativeDate(1), title: 'Team Sync', time: '10:00 AM' },
      { date: getRelativeDate(1), title: 'Client Demo', time: '02:00 PM' },
      { date: getRelativeDate(3), title: 'Design Review', time: '11:00 AM' },
      { date: getRelativeDate(5), title: 'Financial Planning', time: '03:00 PM' },
      { date: getRelativeDate(5), title: 'Marketing Catch-up', time: '04:00 PM' },
    ]);
  }, []);

  const selectedDayAppointments = appointments.filter(
    (appt) => {
      if (!date) return false;
      const apptDate = new Date(appt.date);
      apptDate.setHours(0,0,0,0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0,0,0,0);
      return apptDate.getTime() === selectedDate.getTime();
    }
  );

  return (
    <Card className="shadow-sm flex flex-col h-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="font-headline text-2xl">Calendar & Appointments</CardTitle>
        </div>
        <CalendarIcon className="h-7 w-7 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col xl:flex-row gap-6 p-6 flex-1">
        <div className="flex justify-center xl:justify-start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border bg-card"
            disabled={(d) => d < new Date(new Date().setDate(new Date().getDate() - 1))}
          />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            {date ? format(date, 'PPP') : 'Loading...'}
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {selectedDayAppointments.length > 0 ? (
              selectedDayAppointments.map((appt, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 border-l-4 border-accent rounded-r-lg hover:bg-secondary transition-colors">
                  <div>
                    <p className="font-semibold text-sm">{appt.title}</p>
                    <p className="text-xs text-muted-foreground">{appt.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-40 text-sm text-muted-foreground text-center">
                <p>No appointments scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
