import { type SubmitEvent, useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerTrigger } from "@/components/ui/date-picker";
import type { AppointmentStatus, CreateAppointmentInput } from "@/features/appointments/apis/appointmentsApi";

type CreateAppointmentDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (appointment: CreateAppointmentInput) => Promise<void>;
}>;

const statusOptions: ReadonlyArray<Readonly<{ label: string; value: AppointmentStatus }>> = [
  { label: "Scheduled", value: "scheduled" },
  { label: "In Progress", value: "in-progress" },
  { label: "Complete", value: "complete" },
];

type AppointmentFormValues = Readonly<{
  scheduledStart?: Date;
  scheduledEnd?: Date;
  status: AppointmentStatus;
  subject: string;
}>;

const initialFormValues: AppointmentFormValues = {
  scheduledStart: undefined,
  scheduledEnd: undefined,
  status: "in-progress",
  subject: "",
};

const isAppointmentStatus = (value: string): value is AppointmentStatus =>
  statusOptions.some((status) => status.value === value);

export function CreateAppointmentDialog({ open, onOpenChange, onCreate }: CreateAppointmentDialogProps) {
  const [formValues, setFormValues] = useState<AppointmentFormValues>(initialFormValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && !isSubmitting) {
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setError(null);

    if (!formValues.scheduledStart || !formValues.scheduledEnd) {
      setError("Select a scheduled start and end date.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreate({
        ...formValues,
        scheduledStart: formValues.scheduledStart.toISOString(),
        scheduledEnd: formValues.scheduledEnd.toISOString(),
      });
      setFormValues(initialFormValues);
      onOpenChange(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create appointment</DialogTitle>
          <DialogDescription>Enter the service and the time you would like to book.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="appointment-subject">Service</Label>
            <Input
              id="appointment-subject"
              value={formValues.subject}
              onChange={(event) => setFormValues((current) => ({ ...current, subject: event.target.value }))}
              placeholder="e.g. Cardiology consultation"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment-start">Scheduled start</Label>
            <DatePicker>
              <DatePickerTrigger
                id="appointment-start"
                date={formValues.scheduledStart}
                placeholder="Select a start date"
                className="w-full"
              />
              <DatePickerContent align="start">
                <DatePickerCalendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={formValues.scheduledStart}
                  onSelect={(scheduledStart) => setFormValues((current) => ({ ...current, scheduledStart }))}
                />
              </DatePickerContent>
            </DatePicker>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment-end">Scheduled end</Label>
            <DatePicker>
              <DatePickerTrigger
                id="appointment-end"
                date={formValues.scheduledEnd}
                placeholder="Select an end date"
                className="w-full"
              />
              <DatePickerContent align="start">
                <DatePickerCalendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={formValues.scheduledEnd}
                  onSelect={(scheduledEnd) => setFormValues((current) => ({ ...current, scheduledEnd }))}
                />
              </DatePickerContent>
            </DatePicker>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appointment-status">Status</Label>
            <Select
              value={formValues.status}
              onValueChange={(status) => {
                if (isAppointmentStatus(status)) {
                  setFormValues((current) => ({ ...current, status }));
                }
              }}
            >
              <SelectTrigger id="appointment-status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
