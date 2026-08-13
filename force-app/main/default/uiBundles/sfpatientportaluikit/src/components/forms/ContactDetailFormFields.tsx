import { z } from "zod";
import { FieldGroup } from "@/components/ui";
import { withFieldGroup } from "@/hooks/form";

export const contactDetailFormSchema = z.object({
  telephone: z.string(),
  address: z.string().nonempty({ error: "Address is required" }),
});

export type ContactDetailFormValues = z.infer<typeof contactDetailFormSchema>;

export const contactDetailDefaultValues: ContactDetailFormValues = {
  telephone: "",
  address: "",
};

export const ContactDetailFormFields = withFieldGroup({
  defaultValues: contactDetailDefaultValues,
  render: ({ group }) => (
    <FieldGroup className="gap-5">
      <group.AppField name="telephone">{(field) => <field.TextField label="Telephone" />}</group.AppField>
      <group.AppField name="address">{(field) => <field.TextField label="Address" />}</group.AppField>
    </FieldGroup>
  ),
});
