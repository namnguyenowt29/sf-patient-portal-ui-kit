import { z } from "zod";
import { FieldGroup } from "@/components/ui";
import { withFieldGroup } from "@/hooks/form";

export const insuranceFormSchema = z.object({
  avsNumber: z.string().trim().min(1, "AVS number is required").nullable(),
  insurer: z.string().trim().min(1, "Insurance provider is required").nullable(),
  cardNumber: z.string().trim().min(1, "Card number is required").nullable(),
  supplementaryInsurance: z.string().trim().nullable(),
});

export type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

export const insuranceDefaultValues: InsuranceFormValues = {
  avsNumber: "",
  insurer: "",
  cardNumber: "",
  supplementaryInsurance: "",
};

export const InsuranceFormFields = withFieldGroup({
  defaultValues: insuranceDefaultValues,
  render: ({ group }) => (
    <FieldGroup className="gap-5">
      <group.AppField name="avsNumber">
        {(field) => <field.TextField label="AVS number" inputMode="numeric" />}
      </group.AppField>
      <group.AppField name="insurer">
        {(field) => <field.TextField label="Insurance provider" autoComplete="organization" />}
      </group.AppField>
      <group.AppField name="cardNumber">
        {(field) => <field.TextField label="Card number" inputMode="numeric" />}
      </group.AppField>
      <group.AppField name="supplementaryInsurance">
        {(field) => <field.TextField label="Supplementary insurance" />}
      </group.AppField>
    </FieldGroup>
  ),
});
