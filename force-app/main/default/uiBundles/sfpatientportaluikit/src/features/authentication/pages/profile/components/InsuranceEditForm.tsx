import { z } from "zod";
import { Button, FieldGroup } from "@/components/ui";
import { useAppForm } from "../../../hooks/form";

const insuranceFormSchema = z.object({
  avsNumber: z.string().trim().min(1, "AVS number is required"),
  insurer: z.string().trim().min(1, "Insurance provider is required"),
  cardNumber: z.string().trim().min(1, "Card number is required"),
  supplementaryInsurance: z.string().trim(),
});

export type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

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
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <form.AppField name="avsNumber">
            {(field) => <field.TextField label="AVS number" inputMode="numeric" />}
          </form.AppField>
          <form.AppField name="insurer">
            {(field) => <field.TextField label="Insurance provider" autoComplete="organization" />}
          </form.AppField>
          <form.AppField name="cardNumber">
            {(field) => <field.TextField label="Card number" inputMode="numeric" />}
          </form.AppField>
          <form.AppField name="supplementaryInsurance">
            {(field) => <field.TextField label="Supplementary insurance" />}
          </form.AppField>
        </FieldGroup>

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
