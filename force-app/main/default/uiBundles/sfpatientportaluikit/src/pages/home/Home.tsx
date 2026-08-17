import { SyntheticEvent, useState } from "react";
import { useNavigate } from "react-router";

import { SearchBar } from "../../features/object-search/components/SearchBar";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { PreAdmissionForm, type CurrentStep } from "./components/PreAdmissionForm";

export default function HomePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<CurrentStep>(1);
  const [isPreAdmissionDirty, setIsPreAdmissionDirty] = useState(false);
  const [showDiscardWarning, setShowDiscardWarning] = useState(false);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = text ? `?q=${encodeURIComponent(text)}` : "";
    navigate(`/accounts${params}`);
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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-6">
        <h1 className="text-2xl font-bold">Account Search</h1>
        <Button variant="outline" size="sm" onClick={() => navigate("/accounts")}>
          Browse All Accounts
        </Button>
        <Button variant="secondary" onClick={() => setIsDialogOpen(true)}>
          Book appointment
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <SearchBar placeholder="Search by name, phone, or industry..." value={text} handleChange={setText} />
        <Button type="submit">Search</Button>
      </form>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="h-dvh w-dvw max-w-none rounded-none p-0 sm:max-w-none">
          <div className="flex h-full min-h-0 flex-col">
            <DialogHeader className="bg-background p-6 pr-14">
              <DialogTitle>Pre-admission</DialogTitle>
              <DialogDescription>Complete your details before your appointment.</DialogDescription>
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
    </div>
  );
}
