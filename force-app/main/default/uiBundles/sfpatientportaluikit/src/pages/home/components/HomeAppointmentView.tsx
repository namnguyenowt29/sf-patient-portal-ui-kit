import { Link } from "react-router";

import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type AppointmentStatus = "need-confirm" | "complete-pre-admission" | "completed";

export type Appointment = Readonly<{
  id: string;
  dateTime: string;
  serviceName: string;
  status: AppointmentStatus;
}>;

type HomeAppointmentViewProps = Readonly<{
  title: string;
  appointments: readonly Appointment[];
  className?: string;
}>;

const statusPresentation: Record<AppointmentStatus, Readonly<{ label: string; className: string }>> = {
  "need-confirm": {
    label: "Need confirmation",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "complete-pre-admission": {
    label: "Complete pre-admission",
    className: "border-sky-200 bg-sky-50 text-sky-800",
  },
  completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
};

export function HomeAppointmentView({ title, appointments, className }: HomeAppointmentViewProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="divide-border divide-y">
          {appointments.map((appointment) => {
            const status = statusPresentation[appointment.status];

            return (
              <li
                key={appointment.id}
                className="grid gap-2 py-4 sm:grid-cols-[minmax(9rem,0.85fr)_minmax(12rem,1fr)_auto] sm:items-center"
              >
                <p className="text-foreground font-medium">{appointment.dateTime}</p>
                <p className="text-primary">{appointment.serviceName}</p>
                <Badge variant="outline" className={`${status.className}`}>
                  {status.label}
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="justify-center">
        <Button variant="link" asChild>
          <Link to="/appointments">View all appointments</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
