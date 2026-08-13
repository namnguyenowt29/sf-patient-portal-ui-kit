import { createFieldMap } from "@tanstack/react-form";
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
  onSave: (values: ContactDetailFormValues) => void;
}>;

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
        <ContactDetailFormFields form={form} fields={contactDetailFields} />
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
