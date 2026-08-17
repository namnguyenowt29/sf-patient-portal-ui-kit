import { useState } from "react";
// import { useNavigate } from "react-router";

// import { SearchBar } from "../../features/object-search/components/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  Button,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui";
import { PreAdmissionForm, type CurrentStep } from "./components/PreAdmissionForm";
import { HomeAppointmentView, type Appointment } from "./components/HomeAppointmentView";
import { X } from "lucide-react";

const upcomingAppointments: readonly Appointment[] = [
  {
    id: "upcoming-physiotherapy",
    dateTime: "Today, 12:30",
    serviceName: "Physiotherapy — rehabilitation session",
    status: "complete-pre-admission",
  },
  {
    id: "upcoming-cardiology",
    dateTime: "24 May 2025, 08:30",
    serviceName: "Cardiology — follow-up consultation",
    status: "need-confirm",
  },
  {
    id: "upcoming-radiology",
    dateTime: "28 May 2025, 14:15",
    serviceName: "Radiology — CT scan",
    status: "complete-pre-admission",
  },
];

const previousAppointments: readonly Appointment[] = [
  {
    id: "previous-radiology",
    dateTime: "3 March 2025, 10:15",
    serviceName: "Radiology — CT scan",
    status: "completed",
  },
  {
    id: "previous-general-practice",
    dateTime: "18 February 2025, 09:00",
    serviceName: "General practice — consultation",
    status: "completed",
  },
  {
    id: "previous-laboratory",
    dateTime: "27 January 2025, 11:45",
    serviceName: "Laboratory — blood test",
    status: "completed",
  },
];

export default function HomePage() {
  // const navigate = useNavigate();
  // const [text, setText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep>(1);
  const [isPreAdmissionDirty, setIsPreAdmissionDirty] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  // const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  //   const params = text ? `?q=${encodeURIComponent(text)}` : "";
  //   navigate(`/accounts${params}`);
  // };

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
        {/* <h1 className="text-2xl font-bold">Account Search</h1>
        <Button variant="outline" size="sm" onClick={() => navigate("/accounts")}>
          Browse All Accounts
        </Button> */}
        <div className="header-left">
          <h4 className="text-2xl font-bold">Welcome back,</h4>
          <p>Nam Nguyen</p>
        </div>
        <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>
          Book appointment
        </Button>
      </div>
      {/* <form onSubmit={handleSubmit} className="flex gap-2">
        <SearchBar placeholder="Search by name, phone, or industry..." value={text} handleChange={setText} />
        <Button type="submit">Search</Button>
      </form> */}

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="h-dvh w-dvw max-w-none rounded-none p-0 sm:max-w-none [&>button]:hidden">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="flex-row justify-between border-b border-gray-300 bg-white p-6 pr-14">
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

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <HomeAppointmentView title="Upcoming appointments" appointments={upcomingAppointments} />
        <HomeAppointmentView title="Previous appointments" appointments={previousAppointments} />
      </div>
    </div>
  );
}
