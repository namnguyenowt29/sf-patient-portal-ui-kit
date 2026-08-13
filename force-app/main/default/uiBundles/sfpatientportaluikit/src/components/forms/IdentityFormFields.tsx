import { withFieldGroup } from "@/hooks/form";
import { FieldGroup, RadioField, SelectField } from "../ui";
import { z } from "zod";
import { TOption } from "@/types/common";

export const identityFormSchema = z.object({
  salutation: z.enum(["mr", "ms", "unspecified"]),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  gender: z.enum(["male", "female", "other"]),
  maritalStatus: z.string().min(1, "Marital status is required"),
});

export const identityDefaultValues: IdentityFormValues = {
  salutation: "unspecified",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  nationality: "",
  gender: "other",
  maritalStatus: "",
};

const salutationOptions: TOption[] = [
  { label: "Mr.", value: "mr" },
  { label: "Ms.", value: "ms" },
  { label: "Not specified", value: "unspecified" },
];

const genderOptions: TOption[] = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

const placeOfBirthOptions: TOption[] = [
  { label: "Geneva", value: "Geneva" },
  { label: "Lausanne", value: "Lausanne" },
  { label: "Zurich", value: "Zurich" },
];

export type IdentityFormValues = z.infer<typeof identityFormSchema>;
/**
 * Renders identity controls inside a parent form or scoped TanStack field group.
 * It deliberately owns no native form, validation, or submit actions.
 */
export const IdentityFormFields = withFieldGroup({
  defaultValues: identityDefaultValues,
  render: ({ group }) => {
    return (
      <FieldGroup className="gap-5">
        <group.Field name="salutation">
          {(field) => (
            <RadioField<IdentityFormValues["salutation"]>
              label="Salutation"
              name={field.name}
              options={salutationOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value)}
            />
          )}
        </group.Field>

        <group.AppField name="firstName">
          {(field) => <field.TextField label="First name" autoComplete="given-name" />}
        </group.AppField>
        <group.AppField name="lastName">
          {(field) => <field.TextField label="Last name" autoComplete="family-name" />}
        </group.AppField>
        <group.AppField name="dateOfBirth">
          {(field) => <field.TextField label="Date of birth" type="date" autoComplete="bday" />}
        </group.AppField>

        <group.Field name="placeOfBirth">
          {(field) => (
            <SelectField
              label="Place of birth"
              options={placeOfBirthOptions}
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </group.Field>

        <group.Field name="nationality">
          {(field) => (
            <SelectField
              label="Nationality"
              options={[
                { label: "Swiss", value: "Swiss" },
                { label: "French", value: "French" },
                { label: "Italian", value: "Italian" },
              ]}
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </group.Field>

        <group.Field name="gender">
          {(field) => (
            <RadioField
              label="Gender"
              name={field.name}
              options={genderOptions}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as IdentityFormValues["gender"])}
            />
          )}
        </group.Field>

        <group.Field name="maritalStatus">
          {(field) => (
            <SelectField
              label="Marital status"
              options={[
                { label: "Single", value: "Single" },
                { label: "Married", value: "Married" },
                { label: "Divorced", value: "Divorced" },
                { label: "Widowed", value: "Widowed" },
              ]}
              value={field.state.value}
              onChange={field.handleChange}
            />
          )}
        </group.Field>
      </FieldGroup>
    );
  },
});
