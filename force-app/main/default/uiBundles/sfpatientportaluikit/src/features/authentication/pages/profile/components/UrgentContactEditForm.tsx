import { Button, FieldGroup } from "@/components/ui";
import { useAppForm } from "@/features/authentication/hooks/form";
import { z } from "zod";

const urgentContactFormSchema = z.object({
  relationship: z.string(),
  telephone: z.string(),
});

export type UrgentContactFormSchema = z.infer<typeof urgentContactFormSchema>;

type UrgentContactEditFormProps = Readonly<{
  defaultValues: UrgentContactFormSchema;
  onCancel: () => void;
  onSave: (value: UrgentContactFormSchema) => void;
}>;

export function UrgentContactEditForm({ defaultValues, onCancel, onSave }: UrgentContactEditFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: urgentContactFormSchema, onSubmit: urgentContactFormSchema },
    onSubmit: ({ value }) => onSave(value),
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
        <FieldGroup className="gap-5">
          <form.AppField name="relationship">{(field) => <field.TextField label="Relationship" />}</form.AppField>
          <form.AppField name="telephone">{(field) => <field.TextField label="Telephone" />}</form.AppField>
        </FieldGroup>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </form.AppForm>
  );
}
