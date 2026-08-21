import { useState } from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAppForm } from "@/hooks/form";
import { identityDefaultValues, IdentityFormFields, identityFormSchema, IdentityFormValues } from "@/components/forms";
import { createFieldMap } from "@tanstack/react-form";

const identityFields = createFieldMap(identityDefaultValues);

type IdentityEditFormProps = Readonly<{
  className?: string;
  defaultValues: IdentityFormValues | null;
  onCancel: () => void;
  onSave: (values: IdentityFormValues) => Promise<void>;
}>;

export function IdentityEditForm({ defaultValues, onCancel, onSave, className }: IdentityEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const form = useAppForm({
    defaultValues,
    validators: { onChange: identityFormSchema, onSubmit: identityFormSchema },
    onSubmit: async ({ value }) => {
      if (!value) {
        setSaveError("Your profile could not be saved because it is unavailable.");
        return;
      }

      setIsSaving(true);
      setSaveError(null);

      try {
        await onSave(value);
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Unable to save your profile. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form.AppForm>
      <form
        className={cn("space-y-5", className)}
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <IdentityFormFields form={form} fields={identityFields} />

        {saveError && <p className="text-destructive text-sm" role="alert">{saveError}</p>}

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
