import { z } from "zod";
import { FieldGroup, SelectField } from "@/components/ui";
import { withFieldGroup } from "@/hooks/form";
import { TOption } from "@/types/common";

export const employerFormSchema = z.object({
  profession: z.string().trim().min(1, "Profession is required"),
  employer: z.string().trim().min(1, "Employer is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  city: z.string().trim().min(1, "City is required"),
});

export type EmployerFormValues = z.infer<typeof employerFormSchema>;

export const employerDefaultValues: EmployerFormValues = {
  profession: "",
  employer: "",
  postalCode: "",
  city: "",
};

const professionOptions: TOption[] = [
  { label: "Employee", value: "Employee" },
  { label: "Self-employed", value: "Self-employed" },
  { label: "Student", value: "Student" },
  { label: "Retired", value: "Retired" },
  { label: "Unemployed", value: "Unemployed" },
];

const cityOptions: TOption[] = [
  { label: "Geneva", value: "Geneva" },
  { label: "Lausanne", value: "Lausanne" },
  { label: "Zurich", value: "Zurich" },
];

export const EmployerFormFields = withFieldGroup({
  defaultValues: employerDefaultValues,
  render: ({ group }) => (
    <FieldGroup className="gap-5">
      <group.Field name="profession">
        {(field) => (
          <SelectField
            label="Profession"
            options={professionOptions}
            value={field.state.value}
            onChange={field.handleChange}
          />
        )}
      </group.Field>
      <group.AppField name="employer">
        {(field) => <field.TextField label="Employer" autoComplete="organization" />}
      </group.AppField>
      <group.AppField name="postalCode">
        {(field) => <field.TextField label="Postal code" autoComplete="postal-code" inputMode="numeric" />}
      </group.AppField>
      <group.Field name="city">
        {(field) => (
          <SelectField label="City" options={cityOptions} value={field.state.value} onChange={field.handleChange} />
        )}
      </group.Field>
    </FieldGroup>
  ),
});
