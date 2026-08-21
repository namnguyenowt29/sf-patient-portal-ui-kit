import { createFieldMap } from "@tanstack/react-form";
import { useState } from "react";
import { Button } from "@/components/ui";
import {
  contactDetailDefaultValues,
  ContactDetailFormFields,
  contactDetailFormSchema,
  type ContactDetailFormValues,
} from "@/components/forms";
import { useAppForm } from "@/hooks/form";

const contactDetailFields = createFieldMap(contactDetailDefaultValues);

type ContactDetailEditFormProps = Readonly<{
  defaultValues: ContactDetailFormValues;
  onCancel: () => void;
  onSave: (values: ContactDetailFormValues) => Promise<void>;
}>;

export function ContactDetailEditForm({ defaultValues, onCancel, onSave }: ContactDetailEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues,
    validators: { onChange: contactDetailFormSchema, onSubmit: contactDetailFormSchema },
    onSubmit: async ({ value }) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(value);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save contact details. Please try again.");
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
        <ContactDetailFormFields form={form} fields={contactDetailFields} />
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
