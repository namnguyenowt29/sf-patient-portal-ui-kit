import { createFieldMap } from "@tanstack/react-form";
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
  onSave: (values: EmployerFormValues) => void;
}>;

export function EmployerEditForm({ defaultValues, onCancel, onSave }: EmployerEditFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: employerFormSchema, onSubmit: employerFormSchema },
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
        <EmployerFormFields form={form} fields={employerFields} />
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
