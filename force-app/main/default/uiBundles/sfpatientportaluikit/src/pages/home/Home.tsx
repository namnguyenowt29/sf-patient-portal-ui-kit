import { useEffect, useState } from "react";
import { X } from "lucide-react";

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { appointmentsApi } from "@/features/appointments/apis/appointmentsApi";
import type { AppointmentsByPeriod, CreateAppointmentInput } from "@/features/appointments/apis/appointmentsApi";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { toast, Toaster } from "@/components/ui/sonner";
import { CreateAppointmentDialog } from "./components/CreateAppointmentDialog";
import { PreAdmissionForm, type CurrentStep } from "./components/PreAdmissionForm";
import { HomeAppointmentView } from "./components/HomeAppointmentView";

export default function HomePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep>(1);
  const [isPreAdmissionDirty, setIsPreAdmissionDirty] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false);
  const [appointmentsRefreshKey, setAppointmentsRefreshKey] = useState(0);
  const [appointments, setAppointments] = useState<AppointmentsByPeriod | null>(null);
  const { user } = useAuth();
  const { data: loadedAppointments } = useAsyncData(
    () => appointmentsApi.getAppointmentsForUser(user?.id ?? ""),
    [user?.id, appointmentsRefreshKey]
  );

  useEffect(() => {
    setAppointments(loadedAppointments);
  }, [loadedAppointments]);

  const handleCreateAppointment = async (appointment: CreateAppointmentInput) => {
    const userId = user?.id ?? "";
    await appointmentsApi.createAppointmentForUser(userId, appointment);
    setAppointmentsRefreshKey((current) => current + 1);
    toast.success("Appointment created", {
      description: "Your appointment has been added to the list.",
    });
  };

  const handlePreAdmissionDirtyChange = (isDirty: boolean) => {
    setIsPreAdmissionDirty(isDirty);
  };

  const closePreAdmission = () => {
    setIsDialogOpen(false);
    setCurrentStep(1);
    setIsPreAdmissionDirty(false);
    setShowDiscardWarning(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (open) {
      setIsDialogOpen(true);
      setShowDiscardWarning(false);
      return;
    }

    if (isPreAdmissionDirty) {
      setShowDiscardWarning(true);
      return;
    }

    closePreAdmission();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-6">
        <div className="header-left">
          <h4 className="text-2xl font-bold">Welcome back,</h4>
          <p>Nam Nguyen</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsCreateAppointmentOpen(true)}>
            Create appointment
          </Button>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            Create Pre-admission
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="h-dvh w-dvw max-w-none rounded-none p-0 sm:max-w-none [&>button]:hidden">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="flex-row justify-between border-b border-gray-300 bg-white p-6">
              <div className="header-left">
                <DialogTitle>Pre-admission</DialogTitle>
                <DialogDescription>Complete your details before your appointment.</DialogDescription>
              </div>
              <DialogClose asChild>
                <Button size="icon-lg" variant="ghost">
                  <X />
                </Button>
              </DialogClose>
            </DialogHeader>

            <PreAdmissionForm
              currentStep={currentStep}
              onStepChange={setCurrentStep}
              onDirtyChange={handlePreAdmissionDirtyChange}
              showDiscardWarning={showDiscardWarning}
              onKeepEditing={() => setShowDiscardWarning(false)}
              onDiscardChanges={closePreAdmission}
              onClose={closePreAdmission}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CreateAppointmentDialog
        open={isCreateAppointmentOpen}
        onOpenChange={setIsCreateAppointmentOpen}
        onCreate={handleCreateAppointment}
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <HomeAppointmentView title="Upcoming appointments" appointments={appointments?.upcoming ?? []} />
        <HomeAppointmentView title="Previous appointments" appointments={appointments?.previous ?? []} />
      </div>
      <Toaster />
    </div>
  );
}
