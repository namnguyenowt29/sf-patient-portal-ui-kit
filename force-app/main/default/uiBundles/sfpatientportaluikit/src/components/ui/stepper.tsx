import { type ComponentProps, createContext, ReactNode, useContext, useMemo } from "react";
import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type StepperContextValue = Readonly<{
  currentStep: number;
  onStepChange?: (step: number) => void;
}>;

const StepperContext = createContext<StepperContextValue | null>(null);

type StepperProps = Readonly<{
  className?: string;
  children?: ReactNode;
}> &
  StepperContextValue;

function Stepper({ currentStep, className, children, onStepChange }: StepperProps) {
  const currentStepValue = useMemo(
    () => ({
      currentStep,
      onStepChange,
    }),
    [currentStep, onStepChange]
  );
  return (
    <StepperContext.Provider value={currentStepValue}>
      <ol
        data-slot="stepper"
        className={cn(
          "flex w-full min-w-max items-center [&>li:last-child_[data-slot=stepper-connector]]:hidden",
          className
        )}
      >
        {children}
      </ol>
    </StepperContext.Provider>
  );
}

function StepperItem({ step, className, children, ...props }: ComponentProps<"li"> & { step: number }) {
  const context = useContext(StepperContext);

  if (!context) {
    throw new Error("StepperItem must be used inside a Stepper.");
  }

  const { currentStep, onStepChange } = context;
  const isComplete = step < currentStep;
  const isCurrent = step === currentStep;
  let dataState = "upcoming";

  if (isComplete) {
    dataState = "complete";
  } else if (isCurrent) {
    dataState = "current";
  }

  return (
    <li
      data-slot="stepper-item"
      data-state={dataState}
      aria-current={isCurrent ? "step" : undefined}
      className={cn("flex min-w-0 flex-1 items-center last:flex-none", className)}
      {...props}
    >
      <button
        type="button"
        data-slot="stepper-trigger"
        onClick={() => onStepChange?.(step)}
        disabled={!onStepChange}
        className="focus-visible:ring-ring/50 flex min-w-0 items-center outline-none focus-visible:rounded-sm focus-visible:ring-3 disabled:cursor-default"
      >
        <span
          data-slot="stepper-indicator"
          className={cn(
            "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
            isComplete && "border-primary bg-primary text-primary-foreground",
            isCurrent && "border-primary bg-background",
            !isComplete && !isCurrent && "border-border bg-background"
          )}
        >
          {isComplete && <CheckIcon className="size-2.5" aria-hidden="true" />}
        </span>
        <span
          data-slot="stepper-label"
          className={cn("ml-2 text-sm whitespace-nowrap", isCurrent ? "text-primary" : "text-muted-foreground")}
        >
          {children}
        </span>
      </button>
      <span
        data-slot="stepper-connector"
        aria-hidden="true"
        className={cn("mx-3 h-px min-w-3 flex-1", isComplete ? "bg-primary" : "bg-border")}
      />
    </li>
  );
}

export { Stepper, StepperItem };
