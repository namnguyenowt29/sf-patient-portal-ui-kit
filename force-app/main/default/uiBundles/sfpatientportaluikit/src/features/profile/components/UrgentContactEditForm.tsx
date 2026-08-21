import { createFieldMap } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui";
import { useAppForm } from "@/hooks/form";
import {
  urgentContactDefaultValues,
  UrgentContactFormFields,
  urgentContactFormSchema,
  type UrgentContactFormValues,
} from "@/components/forms";

const urgentContactFields = createFieldMap(urgentContactDefaultValues);

type UrgentContactEditFormProps = Readonly<{
  defaultValues: UrgentContactFormValues;
  onCancel: () => void;
  onSave: (value: UrgentContactFormValues) => Promise<void>;
}>;

export function UrgentContactEditForm({ defaultValues, onCancel, onSave }: UrgentContactEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues,
    validators: { onChange: urgentContactFormSchema, onSubmit: urgentContactFormSchema },
    onSubmit: async ({ value }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(value);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save urgent contact. Please try again.");
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
        <UrgentContactFormFields form={form} fields={urgentContactFields} />
        {saveError && (
          <p className="text-destructive text-sm" role="alert">
            {saveError}
          </p>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </form.AppForm>
  );
}
