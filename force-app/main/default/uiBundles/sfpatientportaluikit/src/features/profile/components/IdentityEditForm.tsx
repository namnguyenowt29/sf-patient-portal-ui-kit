import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAppForm } from "@/hooks/form";
import { identityDefaultValues, IdentityFormFields, identityFormSchema, IdentityFormValues } from "@/components/forms";
import { createFieldMap } from "@tanstack/react-form";

const identityFields = createFieldMap(identityDefaultValues);

type IdentityEditFormProps = Readonly<{
  defaultValues: IdentityFormValues;
  onCancel: () => void;
  onSave: (values: IdentityFormValues) => void;
  className?: string;
}>;

export function IdentityEditForm({ defaultValues, onCancel, onSave, className }: IdentityEditFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: identityFormSchema, onSubmit: identityFormSchema },
    onSubmit: ({ value }) => onSave(value),
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

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </form.AppForm>
  );
}
