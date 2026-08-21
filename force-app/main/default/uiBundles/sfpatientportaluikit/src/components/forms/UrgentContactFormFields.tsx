import { z } from "zod";
import { FieldGroup } from "@/components/ui";
import { withFieldGroup } from "@/hooks/form";

export const urgentContactFormSchema = z.object({
  relationship: z.string().trim().min(1, "Relationship is required").nullable(),
  urgentContactTelephone: z.string().trim().min(1, "Telephone is required").nullable(),
});

export type UrgentContactFormValues = z.infer<typeof urgentContactFormSchema>;

export const urgentContactDefaultValues: UrgentContactFormValues = {
  relationship: "",
  urgentContactTelephone: "",
};

export const UrgentContactFormFields = withFieldGroup({
  defaultValues: urgentContactDefaultValues,
  render: ({ group }) => (
    <FieldGroup className="gap-5">
      <group.AppField name="relationship">{(field) => <field.TextField label="Relationship" />}</group.AppField>
      <group.AppField name="urgentContactTelephone">
        {(field) => <field.TextField label="Telephone" />}
      </group.AppField>
    </FieldGroup>
  ),
});
