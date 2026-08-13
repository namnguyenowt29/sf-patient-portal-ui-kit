# Remaining profile edit forms refactor plan

## Goal

Make the contact-detail, employer, and insurance inputs reusable in a future larger TanStack form, while preserving each existing standalone profile-card editor in `ProfileDetail`.

## Reference implementation

Follow the established `IdentityEditForm` pattern:

- Export the Zod schema and form-value type.
- Use `withFieldGroup` to create a reusable `*FormFields` component.
- Keep the existing `*EditForm` as a thin standalone wrapper that owns its own `useAppForm`, native `<form>`, validation, and Save/Cancel actions.

The field component must remain presentation-and-binding only. It must not create a form instance, submit data, render a native `<form>`, or render Save/Cancel buttons.

## Current state

Each target component currently combines complete-form behavior with its field markup:

| Component | Reusable field section | Validation shape |
| --- | --- | --- |
| `ContactDetailEditForm` | Telephone and address | `telephone`, `address` |
| `EmployerEditForm` | Profession, employer, postal code, city | `profession`, `employer`, `postalCode`, `city` |
| `InsuranceEditForm` | AVS number, insurer, card number, supplementary insurance | `avsNumber`, `insurer`, `cardNumber`, `supplementaryInsurance` |

Embedding any current edit form in a larger form would create duplicate form state and invalid nested native forms.

## Planned changes

1. Refactor `ContactDetailEditForm.tsx`.
   - Export `contactDetailFormSchema`.
   - Add `ContactDetailFormFields` with `withFieldGroup<ContactDetailFormValues, unknown>`.
   - Bind `telephone` and `address` through the scoped `group.AppField` API.
   - Replace the wrapper's inline field markup with `<ContactDetailFormFields form={form} fields={...} />`.
   - Make the wrapper call `void form.handleSubmit()`.

2. Refactor `EmployerEditForm.tsx`.
   - Export `employerFormSchema`.
   - Keep profession and city option lists with the field section, because they belong to the input rendering.
   - Add `EmployerFormFields` using `group.Field` for the select controls and `group.AppField` for text fields.
   - Replace the standalone wrapper's inline fields with the scoped field component.

3. Refactor `InsuranceEditForm.tsx`.
   - Export `insuranceFormSchema`.
   - Add `InsuranceFormFields` using scoped `group.AppField` controls.
   - Replace the standalone wrapper's inline fields with the scoped field component.
   - Make the wrapper call `void form.handleSubmit()`.

4. Preserve current `ProfileDetail` integrations.
   - All three callers already use `defaultValues`; no prop API change is expected.
   - Keep existing state updates, display-mode transitions, labels, option values, field order, validation rules, and styling unchanged.

5. Confirm future composition is possible without nested form markup. A larger form will be able to bind each section to a nested object, for example:

   ```tsx
   <ContactDetailFormFields form={form} fields="contactDetail" />
   <EmployerFormFields form={form} fields="employer" />
   <InsuranceFormFields form={form} fields="insurance" />
   ```

## Out of scope

- Building the future large form or choosing its overall schema.
- Refactoring `UrgentContactEditForm`.
- Changing profile data persistence or adding Salesforce data access.
- Changing labels, option values, validation rules, field order, or visual styling.
- Resolving unrelated project build, lint, dependency, or filename-casing issues.

## Validation

After implementation, run from the UI Bundle directory:

1. `npm run build`
2. `npm run lint`
3. `npm run dev`

If the existing `AppLayout.tsx`/`appLayout.tsx` casing conflict or the missing ESLint plugin continues to block standard checks, run the targeted TypeScript check with `--forceConsistentCasingInFileNames false` and report the unrelated blockers separately.
