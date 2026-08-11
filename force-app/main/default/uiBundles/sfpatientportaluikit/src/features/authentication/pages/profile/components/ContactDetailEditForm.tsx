import { Button, FieldGroup } from "@/components/ui";
import { useAppForm } from "@/features/authentication/hooks/form";
import { z } from "zod";

const contactDetailFormSchema = z.object({
  telephone: z.string(),
  address: z.string().nonempty({ error: "Address is required" }),
});

export type ContactDetailFormValues = z.infer<typeof contactDetailFormSchema>;

type ContactDetailEditFormProps = {
  readonly defaultValues: ContactDetailFormValues;
  readonly onCancel: () => void;
  readonly onSave: (value: ContactDetailFormValues) => void;
};

export function ContactDetailEditForm({ defaultValues, onCancel, onSave }: ContactDetailEditFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: contactDetailFormSchema, onSubmit: contactDetailFormSchema },
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
          <form.AppField name="telephone">{(field) => <field.TextField label="Telephone" />}</form.AppField>
          <form.AppField name="address">{(field) => <field.TextField label="Address" />}</form.AppField>
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
