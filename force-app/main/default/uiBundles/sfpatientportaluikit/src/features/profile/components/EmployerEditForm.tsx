import { createFieldMap } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui";
import {
  employerDefaultValues,
  EmployerFormFields,
  employerFormSchema,
  type EmployerFormValues,
} from "@/components/forms";
import { useAppForm } from "@/hooks/form";

const employerFields = createFieldMap(employerDefaultValues);

type EmployerEditFormProps = Readonly<{
  defaultValues: EmployerFormValues;
  onCancel: () => void;
  onSave: (values: EmployerFormValues) => Promise<void>;
}>;

export function EmployerEditForm({ defaultValues, onCancel, onSave }: EmployerEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues,
    validators: { onChange: employerFormSchema, onSubmit: employerFormSchema },
    onSubmit: async ({ value }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(value);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save employer details. Please try again.");
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
        <EmployerFormFields form={form} fields={employerFields} />
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
