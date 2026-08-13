import { createFieldMap } from "@tanstack/react-form";
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
  onSave: (values: InsuranceFormValues) => void;
}>;

export function InsuranceEditForm({ defaultValues, onCancel, onSave }: InsuranceEditFormProps) {
  const form = useAppForm({
    defaultValues,
    validators: { onChange: insuranceFormSchema, onSubmit: insuranceFormSchema },
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
        <InsuranceFormFields form={form} fields={insuranceFields} />
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
