import { createFieldMap } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui";
import {
  insuranceDefaultValues,
  InsuranceFormFields,
  insuranceFormSchema,
  type InsuranceFormValues,
} from "@/components/forms";
import { useAppForm } from "@/hooks/form";

const insuranceFields = createFieldMap(insuranceDefaultValues);

type InsuranceEditFormProps = Readonly<{
  defaultValues: InsuranceFormValues;
  onCancel: () => void;
  onSave: (values: InsuranceFormValues) => Promise<void>;
}>;

export function InsuranceEditForm({ defaultValues, onCancel, onSave }: InsuranceEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues,
    validators: { onChange: insuranceFormSchema, onSubmit: insuranceFormSchema },
    onSubmit: async ({ value }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(value);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save insurance details. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form.AppForm>
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <InsuranceFormFields form={form} fields={insuranceFields} />
        {saveError && <p className="text-destructive text-sm" role="alert">{saveError}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </form.AppForm>
  );
}
