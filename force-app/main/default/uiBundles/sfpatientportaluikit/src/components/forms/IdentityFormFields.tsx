import { withFieldGroup } from "@/hooks/form";
import { format, isValid, parseISO } from "date-fns";
import { Field, FieldError, FieldGroup, FieldLabel, RadioField, SelectField } from "../ui";
import { DatePicker, DatePickerCalendar, DatePickerContent, DatePickerTrigger } from "../ui/date-picker";
import { z } from "zod";
import { TOption } from "@/types/common";

export const identityFormSchema = z.object({
  salutation: z.enum(["Mr.", "Ms.", "Mx."]),
  firstName: z.string().trim().min(1, "First name is required").nullable(),
  lastName: z.string().trim().min(1, "Last name is required").nullable(),
  dateOfBirth: z.string().min(1, "Date of birth is required").nullable(),
  placeOfBirth: z.string().min(1, "Place of birth is required").nullable(),
  nationality: z.string().min(1, "Nationality is required").nullable(),
  gender: z.enum(["Male", "Female", "Not Listed", "Nonbinary"]).nullable(),
  maritalStatus: z.string().min(1, "Marital status is required").nullable(),
});

export const identityDefaultValues: IdentityFormValues = {
  salutation: "Mx.",
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  placeOfBirth: "",
  nationality: "",
  gender: "Not Listed",
  maritalStatus: "",
};

const salutationOptions: TOption[] = [
  { label: "Mr.", value: "Mr." },
  { label: "Ms.", value: "Ms." },
  { label: "Mx.", value: "Mx." },
];

const genderOptions: TOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Not Listed", value: "Not Listed" },
  { label: "Not Nonbinary", value: "Not Nonbinary" },
];

const placeOfBirthOptions: TOption[] = [
  { label: "Geneva", value: "Geneva" },
  { label: "Lausanne", value: "Lausanne" },
  { label: "Zurich", value: "Zurich" },
  { label: "Vietnam", value: "Vietnam" },
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
        <group.Field name="dateOfBirth">
          {(field) => {
            const parsedDate = field.state.value ? parseISO(field.state.value) : undefined;
            const selectedDate = parsedDate && isValid(parsedDate) ? parsedDate : undefined;
            const isInvalid = field.state.meta.isBlurred && field.state.meta.errors.length > 0;
            const fieldId = `${field.name}-date-picker`;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Date of birth</FieldLabel>
                <DatePicker>
                  <DatePickerTrigger
                    id={fieldId}
                    date={selectedDate}
                    placeholder="Select your date of birth"
                    dateFormat="PPP"
                    className="w-full"
                    onBlur={field.handleBlur}
                  />
                  <DatePickerContent align="start">
                    <DatePickerCalendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={selectedDate}
                      onSelect={(date) => field.handleChange(date ? format(date, "yyyy-MM-dd") : "")}
                    />
                  </DatePickerContent>
                </DatePicker>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </group.Field>

        <group.Field name="placeOfBirth">
          {(field) => (
            <SelectField
              label="Place of birth"
              options={placeOfBirthOptions}
              value={field.state.value ?? ""}
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
                { label: "Vietnam", value: "Vietnam" },
              ]}
              value={field.state.value ?? ""}
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
              value={field.state.value ?? ""}
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
              value={field.state.value ?? ""}
              onChange={field.handleChange}
            />
          )}
        </group.Field>
      </FieldGroup>
    );
  },
});
