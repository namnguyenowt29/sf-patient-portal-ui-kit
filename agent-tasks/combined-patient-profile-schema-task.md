# Use one nested `patientProfile` state for all profile form sections

## Goal

Replace the separate identity, contact-detail, urgent-contact, employer, and insurance state values in `ProfileDetail.tsx` with one validated `PatientProfile` state. Each card and edit form consumes its own nested state slice.

## Shared schemas and reusable urgent-contact fields

Create `src/components/forms/UrgentContactFormFields.tsx`, following the existing `withFieldGroup` field-component pattern used by the other form files and the composition pattern in `PreAdmissionForm.tsx`.

It must export:

- `urgentContactFormSchema`;
- `UrgentContactFormValues`;
- `urgentContactDefaultValues`; and
- `UrgentContactFormFields`.

Use this value shape:

```ts
{
  relationship: string;
  urgentContactTelephone: string;
}
```

Render `relationship` and `urgentContactTelephone` using app field primitives; label the latter **Telephone**. Re-export all four items from `src/components/forms/index.ts`.

Refactor `UrgentContactEditForm.tsx` to import the shared schema, type, defaults, and field component. It should create a `createFieldMap(urgentContactDefaultValues)` and render `<UrgentContactFormFields form={form} fields={urgentContactFields} />`; remove its local Zod schema and duplicate controls.

Create a pure combined schema module, for example `src/features/profile/schemas/patientProfileSchema.ts`:

```ts
export const patientProfileSchema = z.object({
  identity: identityFormSchema,
  contactDetail: contactDetailFormSchema,
  urgentContact: urgentContactFormSchema,
  employerDetail: employerFormSchema,
  insuranceDetail: insuranceFormSchema,
});

export type PatientProfile = z.infer<typeof patientProfileSchema>;
```

Keep every section schema as the validation boundary for its own edit-form submission. The combined schema validates a complete profile returned from Salesforce.

### Salesforce-null handling

Salesforce returns `null` for a readable field that has no value. Mirror the existing identity-schema convention in every non-identity shared form schema: append `.nullable()` after each field's string validation. This permits a `null` value returned by Salesforce while preserving the existing validation whenever the user enters a string.

Keep the default values as empty strings for new client-side forms. In `profileApi.ts`, map a missing GraphQL `value` to `null`, not `""`, before applying `patientProfileSchema.safeParse`. The shared `TextField` already renders `null` as an empty input; select/radio controls must explicitly use `value ?? ""`.

## Confirmed Salesforce mapping

| Nested profile field | Contact field | Read mapping | Update mapping |
| --- | --- | --- | --- |
| `identity.salutation` | `Salutation` | direct | direct |
| `identity.firstName` | `FirstName` | direct | direct |
| `identity.lastName` | `LastName` | direct | direct |
| `identity.dateOfBirth` | `Birthdate` | direct | direct (`YYYY-MM-DD`) |
| `identity.placeOfBirth` | `Place_Of_Birth__c` | direct | direct |
| `identity.nationality` | `Nationality__c` | direct | direct |
| `identity.gender` | `GenderIdentity` | direct | direct |
| `identity.maritalStatus` | `Marital_Status__c` | direct | direct |
| `contactDetail.telephone` | `Phone` | direct | direct |
| `contactDetail.address` | `MailingStreet`, `MailingCity`, `MailingState` | join non-empty values with `, ` | see address rule |
| `urgentContact.relationship` | `Urgent_Contact_Relationship__c` | direct | direct |
| `urgentContact.urgentContactTelephone` | `OtherPhone` | direct | direct |
| `employerDetail.profession` | `Title` | direct | direct |
| `employerDetail.employer` | `Employer__c` | direct | direct |
| `employerDetail.postalCode` | `MailingPostalCode` | direct | direct |
| `employerDetail.city` | `MailingCity` | direct | direct |
| `insuranceDetail.avsNumber` | `AVS_Number__c` | direct | direct |
| `insuranceDetail.insurer` | `Insurance_Provider__c` | direct | direct |
| `insuranceDetail.cardNumber` | `Card_Number__c` | direct | direct |
| `insuranceDetail.supplementaryInsurance` | `Supplementary_Insurance__c` | direct | direct |

`MailingCountry` is selected by the current query but does not have a form requirement. Do not include it in `PatientProfile` or any mutation until a UI field is defined.

## Address round-trip rule

A free-text `address` can be read by combining Street, City, and State, but it cannot be reliably split back into those fields on save. For the Contact Details edit form, retain `mailingStreet`, `mailingCity`, and `mailingState` as separate editable values (or as an equivalent structured nested address object). Format those values into the single Address row only for display.

The Contact update mapper must write those exact three fields. Do not implement a delimiter-based address parser.

## `profileApi.ts` implementation

1. Import and re-export the combined `PatientProfile` type; remove the identity-only type alias.
2. Add one `fromContact` mapper. It converts GraphQL field wrappers (`field?.value`) into the nested profile candidate, preserving missing field values as `null`, then applies `patientProfileSchema.safeParse`.
3. Use that mapper for both the read-query Contact and mutation-result Contact. Do not construct API data directly in `ProfileDetail.tsx`.
4. Expose one update method per editable section:

```ts
updateIdentity(userId, values)
updateContactDetail(userId, values)
updateUrgentContact(userId, values)
updateEmployerDetail(userId, values)
updateInsuranceDetail(userId, values)
```

Each method must first `safeParse` its own section schema and map only fields owned by that section into `ContactUpdateRepresentation`. `updateContactDetail` sends `Phone`, `MailingStreet`, `MailingCity`, and `MailingState` together. Always check `result.errors` before reading `result.data`.

5. Each mutation must return every field required by `fromContact`, then return the fully validated `PatientProfile` result. If Salesforce cannot return that complete record, return only the validated updated section and merge it immutably into current state; never put raw Salesforce values into React state.

## `ProfileDetail.tsx` state integration

1. Replace separate `patientProfile`, `contactDetail`, `urgentContact`, `employerDetail`, and `insuranceDetail` state with `useState<PatientProfile | null>`.
2. Keep the existing effect that copies the asynchronous API result into state.
3. Render all five cards and edit forms from their nested slices, for example `patientProfile?.urgentContact` and `patientProfile?.insuranceDetail`.
4. Do not render an edit form while the whole profile is null. A loaded section field may be `null`; render it as an empty control using the shared nullable schema behavior.
5. Each save handler awaits its matching API method, calls `setPatientProfile(updatedProfile)`, and only then switches its `ProfileDetailItem` back to display mode. Preserve display/edit state on API or validation failure.

## GraphQL operations and types

`getProfileContact.graphql` already selects the confirmed fields and marks them `@optional`; preserve `first: 1` and `pageInfo`.

Update `updateProfileContact.graphql` to return every field needed by `fromContact`, using the same field names and `@optional` directives. Each section update includes only its relevant input fields, except the Contact Details update, which includes all structured address fields together.

After GraphQL changes, run from the UI Bundle directory:

```bash
pnpm run graphql:codegen
```

## Acceptance criteria

- One nested `PatientProfile` state supplies every profile card and edit form.
- `UrgentContactFormFields` is shared and used by `UrgentContactEditForm`.
- Every edit form is independently validated before its Salesforce mutation.
- Contact address display combines `MailingStreet`, `MailingCity`, and `MailingState`, while updates preserve those fields structurally.
- A successful save immediately replaces the matching displayed data with a validated response.
- Salesforce `null` values in optional/unpopulated Contact fields load without invalidating the full profile.
- Generated operation types match the final GraphQL documents.

## Validation

Run `pnpm run graphql:codegen` after GraphQL document changes. Run build and lint only when requested by the user.
