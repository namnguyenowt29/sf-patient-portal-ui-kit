import { z } from "zod";
import { Button, FieldGroup, SelectField } from "@/components/ui";
import { TOption } from "@/types/common";
import { useAppForm } from "../../../hooks/form";

const employerFormSchema = z.object({
  profession: z.string().trim().min(1, "Profession is required"),
  employer: z.string().trim().min(1, "Employer is required"),
  postalCode: z.string().trim().min(1, "Postal code is required"),
  city: z.string().trim().min(1, "City is required"),
});

export type EmployerFormValues = z.infer<typeof employerFormSchema>;

type EmployerEditFormProps = Readonly<{
  defaultValues: EmployerFormValues;
  onCancel: () => void;
  onSave: (values: EmployerFormValues) => void;
}>;

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
          void form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <form.Field name="profession">
            {(field) => (
              <SelectField
                label="Profession"
                options={professionOptions}
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.AppField name="employer">
            {(field) => <field.TextField label="Employer" autoComplete="organization" />}
          </form.AppField>

          <form.AppField name="postalCode">
            {(field) => <field.TextField label="Postal code" autoComplete="postal-code" inputMode="numeric" />}
          </form.AppField>

          <form.Field name="city">
            {(field) => (
              <SelectField label="City" options={cityOptions} value={field.state.value} onChange={field.handleChange} />
            )}
          </form.Field>
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
