import { z } from "zod";
import { Button, FieldGroup, RadioField, SelectField } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useAppForm } from "../../../hooks/form";
import { TOption } from "@/types/common";

const identityFormSchema = z.object({
  salutation: z.enum(["mr", "ms", "unspecified"]),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  placeOfBirth: z.string().min(1, "Place of birth is required"),
  nationality: z.string().min(1, "Nationality is required"),
  gender: z.enum(["male", "female", "other"]),
  maritalStatus: z.string().min(1, "Marital status is required"),
});

export type IdentityFormValues = z.infer<typeof identityFormSchema>;

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

type IdentityEditFormProps = Readonly<{
  initialValues: IdentityFormValues;
  onCancel: () => void;
  onSave: (values: IdentityFormValues) => void;
  className?: string;
}>;

export function IdentityEditForm({ initialValues, onCancel, onSave, className }: IdentityEditFormProps) {
  const form = useAppForm({
    defaultValues: initialValues,
    validators: { onChange: identityFormSchema, onSubmit: identityFormSchema },
    onSubmit: ({ value }) => onSave(value),
  });

  return (
    <form.AppForm>
      <form
        className={cn("space-y-5", className)}
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="gap-5">
          <form.Field name="salutation">
            {(field) => (
              <RadioField
                label="Salutation"
                name={field.name}
                options={salutationOptions}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as IdentityFormValues["salutation"])}
              />
            )}
          </form.Field>

          <form.AppField name="firstName">
            {(field) => <field.TextField label="First name" autoComplete="given-name" />}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => <field.TextField label="Last name" autoComplete="family-name" />}
          </form.AppField>
          <form.AppField name="dateOfBirth">
            {(field) => <field.TextField label="Date of birth" type="date" autoComplete="bday" />}
          </form.AppField>

          <form.Field name="placeOfBirth">
            {(field) => (
              <SelectField
                label="Place of birth"
                options={[
                  { label: "Geneva", value: "Geneva" },
                  { label: "Lausanne", value: "Lausanne" },
                  { label: "Zurich", value: "Zurich" },
                ]}
                value={field.state.value}
                onChange={field.handleChange}
              />
            )}
          </form.Field>

          <form.Field name="nationality">
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
          </form.Field>

          <form.Field name="gender">
            {(field) => (
              <RadioField
                label="Gender"
                name={field.name}
                options={genderOptions}
                value={field.state.value}
                onValueChange={(value) => field.handleChange(value as IdentityFormValues["gender"])}
              />
            )}
          </form.Field>

          <form.Field name="maritalStatus">
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
