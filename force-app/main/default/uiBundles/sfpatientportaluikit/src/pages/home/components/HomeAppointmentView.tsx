import { Link } from "react-router";
import { CalendarX2 } from "lucide-react";

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import type { Appointment, AppointmentStatus } from "@/features/appointments/apis/appointmentsApi";
import { cn } from "@/lib/utils";

export type { Appointment, AppointmentStatus } from "@/features/appointments/apis/appointmentsApi";

type HomeAppointmentViewProps = Readonly<{
  title: string;
  appointments: readonly Appointment[];
  className?: string;
}>;

const statusPresentation: Record<AppointmentStatus, Readonly<{ label: string; className: string }>> = {
  scheduled: {
    label: "Scheduled",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  "in-progress": {
    label: "In Progress",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  complete: {
    label: "Complete",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function HomeAppointmentView({ title, appointments, className }: HomeAppointmentViewProps) {
  const isUpcomingAppointments = title.toLowerCase().includes("upcoming");

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1">
        {appointments.length === 0 ? (
          <div className="flex min-h-36 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
            <CalendarX2 aria-hidden="true" className="mb-3 size-8 text-muted-foreground" />
            <p className="text-foreground font-medium">
              {isUpcomingAppointments ? "No upcoming appointments" : "No appointment history yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {isUpcomingAppointments
                ? "Your scheduled visits will appear here."
                : "Completed appointments will appear here."}
            </p>
          </div>
        ) : (
          <ul className="divide-border w-full divide-y">
            {appointments.map((appointment) => {
              const status = statusPresentation[appointment.status];

              return (
                <li
                  key={appointment.id}
                  className="grid gap-2 py-4 sm:grid-cols-[minmax(9rem,0.85fr)_minmax(12rem,1fr)_auto] sm:items-center"
                >
                  <p className="text-foreground font-medium">{appointment.dateTime}</p>
                  <p className="text-primary">{appointment.serviceName}</p>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="link" asChild>
          <Link to="/appointments">View all appointments</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
