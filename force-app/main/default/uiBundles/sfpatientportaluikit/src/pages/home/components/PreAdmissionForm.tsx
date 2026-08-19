import { useEffect } from "react";
import { createFieldMap } from "@tanstack/react-form";
import { z } from "zod";

import {
  contactDetailDefaultValues,
  contactDetailFormSchema,
  ContactDetailFormFields,
  employerDefaultValues,
  employerFormSchema,
  EmployerFormFields,
  identityDefaultValues,
  identityFormSchema,
  IdentityFormFields,
  insuranceDefaultValues,
  insuranceFormSchema,
  InsuranceFormFields,
} from "@/components/forms";
import { StatusAlert } from "@/components/alerts/status-alert";
import { Button, Stepper, StepperItem } from "@/components/ui";
import { useAppForm } from "@/hooks/form";

const preAdmissionDefaultValues = {
  ...identityDefaultValues,
  ...contactDetailDefaultValues,
  ...employerDefaultValues,
  ...insuranceDefaultValues,
};

const preAdmissionFormSchema = z.object({
  ...identityFormSchema.shape,
  ...contactDetailFormSchema.shape,
  ...employerFormSchema.shape,
  ...insuranceFormSchema.shape,
});

const preAdmissionFields = createFieldMap(preAdmissionDefaultValues);

const steps = [
  {
    number: 1,
    label: "Identity",
    title: "Your identity",
    schema: identityFormSchema,
    fieldNames: [
      "salutation",
      "firstName",
      "lastName",
      "dateOfBirth",
      "placeOfBirth",
      "nationality",
      "gender",
      "maritalStatus",
    ],
  },
  {
    number: 2,
    label: "Contact details",
    title: "Your contact details",
    schema: contactDetailFormSchema,
    fieldNames: ["telephone", "mailingStreet", "mailingCity", "mailingState"],
  },
  {
    number: 3,
    label: "Employer",
    title: "Your employment",
    schema: employerFormSchema,
    fieldNames: ["profession", "employer", "postalCode", "city"],
  },
  {
    number: 4,
    label: "Insurance",
    title: "Your insurance",
    schema: insuranceFormSchema,
    fieldNames: ["avsNumber", "insurer", "cardNumber", "supplementaryInsurance"],
  },
] as const;

export type CurrentStep = (typeof steps)[number]["number"];

const isCurrentStep = (step: number): step is CurrentStep => {
  return steps.some((candidate) => candidate.number === step);
};

const getStep = (step: CurrentStep) => {
  const stepDetails = steps.find((candidate) => candidate.number === step);

  if (!stepDetails) {
    throw new Error(`Unknown pre-admission step: ${step}`);
  }

  return stepDetails;
};

type PreAdmissionFormProps = Readonly<{
  currentStep: CurrentStep;
  showDiscardWarning: boolean;
  onStepChange: (step: CurrentStep) => void;
  onDirtyChange: (isDirty: boolean) => void;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
  onClose: () => void;
}>;

function DirtyStateReporter({
  isDirty,
  onDirtyChange,
}: Readonly<{ isDirty: boolean; onDirtyChange: (isDirty: boolean) => void }>) {
  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  return null;
}

export function PreAdmissionForm({
  showDiscardWarning,
  currentStep,
  onStepChange,
  onDirtyChange,
  onKeepEditing,
  onDiscardChanges,
  onClose,
}: PreAdmissionFormProps) {
  const form = useAppForm({
    defaultValues: preAdmissionDefaultValues,
    validators: { onChange: preAdmissionFormSchema, onSubmit: preAdmissionFormSchema },
    onSubmit: ({ value }) => {
      console.log("Pre-admission form submitted", value);
    },
  });
  const currentStepDetails = getStep(currentStep);
  const isFinalStep = currentStep === steps.length;

  const validateCurrentStep = () => {
    const validation = currentStepDetails.schema.safeParse(form.state.values);

    currentStepDetails.fieldNames.forEach((fieldName) => {
      form.setFieldMeta(fieldName, (meta) => ({ ...meta, isBlurred: true, isTouched: true }));
    });
    form.validate("submit", {
      filterFieldNames: (fieldName) =>
        currentStepDetails.fieldNames.some((activeFieldName) => activeFieldName === fieldName),
    });

    return validation.success;
  };

  const goToPreviousStep = () => {
    const previousStep = currentStep - 1;

    if (isCurrentStep(previousStep)) {
      onStepChange(previousStep);
    }
  };

  const goToNextStep = () => {
    const nextStep = currentStep + 1;

    if (isCurrentStep(nextStep) && validateCurrentStep()) {
      onStepChange(nextStep);
    }
  };

  const handleStepChange = (nextStep: number) => {
    if (!isCurrentStep(nextStep)) {
      return;
    }

    if (nextStep <= currentStep) {
      onStepChange(nextStep);
      return;
    }

    if (nextStep === currentStep + 1 && validateCurrentStep()) {
      onStepChange(nextStep);
    }
  };

  return (
    <form.AppForm>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault();

          if (isFinalStep) {
            if (validateCurrentStep()) {
              form.handleSubmit();
              onClose();
            }
            return;
          }

          goToNextStep();
        }}
      >
        <form.Subscribe selector={(state) => state.isDirty}>
          {(isDirty) => <DirtyStateReporter isDirty={isDirty} onDirtyChange={onDirtyChange} />}
        </form.Subscribe>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-8">
          <div className="mx-auto w-full max-w-2xl space-y-6">
            <Stepper currentStep={currentStep} onStepChange={handleStepChange}>
              {steps.map((step) => (
                <StepperItem key={step.number} step={step.number}>
                  {step.label}
                </StepperItem>
              ))}
            </Stepper>
            <div>
              <p className="text-muted-foreground text-sm">
                Step {currentStep} of {steps.length}
              </p>
              <h2 className="text-xl font-semibold">{currentStepDetails.title}</h2>
            </div>

            {showDiscardWarning && (
              <StatusAlert variant="info">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span>Are you sure you want to close this form? Your changes will be lost.</span>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={onKeepEditing}>
                      Keep editing
                    </Button>
                    <Button type="button" size="sm" variant="destructive" onClick={onDiscardChanges}>
                      Discard changes
                    </Button>
                  </div>
                </div>
              </StatusAlert>
            )}

            {currentStep === 1 && <IdentityFormFields form={form} fields={preAdmissionFields} />}
            {currentStep === 2 && <ContactDetailFormFields form={form} fields={preAdmissionFields} />}
            {currentStep === 3 && <EmployerFormFields form={form} fields={preAdmissionFields} />}
            {currentStep === 4 && <InsuranceFormFields form={form} fields={preAdmissionFields} />}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-300 bg-white px-6 py-4">
          <Button type="button" variant="secondary" onClick={goToPreviousStep} disabled={currentStep === 1}>
            Back
          </Button>
          <Button type="submit">{isFinalStep ? "Submit pre-admission" : "Continue"}</Button>
        </div>
      </form>
    </form.AppForm>
  );
}
