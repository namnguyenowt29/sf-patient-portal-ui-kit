import { z } from "zod";
import { FieldGroup } from "@/components/ui";
import { withFieldGroup } from "@/hooks/form";

export const contactDetailFormSchema = z.object({
  telephone: z.string().nullable(),
  mailingStreet: z.string().trim().min(1, "Street is required").nullable(),
  mailingCity: z.string().trim().min(1, "City is required").nullable(),
  mailingState: z.string().trim().min(1, "State is required").nullable(),
});

export type ContactDetailFormValues = z.infer<typeof contactDetailFormSchema>;

export const contactDetailDefaultValues: ContactDetailFormValues = {
  telephone: "",
  mailingStreet: "",
  mailingCity: "",
  mailingState: "",
};

export const ContactDetailFormFields = withFieldGroup({
  defaultValues: contactDetailDefaultValues,
  render: ({ group }) => (
    <FieldGroup className="gap-5">
      <group.AppField name="telephone">{(field) => <field.TextField label="Telephone" />}</group.AppField>
      <group.AppField name="mailingStreet">{(field) => <field.TextField label="Street" />}</group.AppField>
      <group.AppField name="mailingCity">{(field) => <field.TextField label="City" />}</group.AppField>
      <group.AppField name="mailingState">{(field) => <field.TextField label="State" />}</group.AppField>
    </FieldGroup>
  ),
});
