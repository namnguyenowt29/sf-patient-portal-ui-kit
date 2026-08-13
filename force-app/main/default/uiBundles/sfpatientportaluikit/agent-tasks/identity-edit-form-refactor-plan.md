# Identity edit form refactor plan

## Goal

Make the identity inputs reusable inside a future larger TanStack form without changing the existing Identity card experience in `ProfileDetail`.

## Current state

`IdentityEditForm` currently combines two responsibilities:

1. It owns a complete form: initial values, Zod validation, submit handling, native `<form>`, and Save/Cancel buttons.
2. It renders the eight identity inputs and their option lists.

That structure works for the profile card, but it cannot be safely embedded in another form because it would introduce a second form instance and nested native `<form>` elements.

## Planned changes

1. Export the identity Zod schema and retain `IdentityFormValues` as the shared source of the identity value shape.
2. Extract the input markup and identity option lists into a reusable `IdentityFormFields` component.
   - The component will render only the `FieldGroup` and field controls.
   - It will not create form state, render a native `<form>`, validate, submit, or render action buttons.
   - Its API will accept the parent form and configurable field names/prefixes so a future large form can bind the same controls to its own nested values.
3. Keep `IdentityEditForm` as a small standalone wrapper.
   - It will continue to create the current `useAppForm` instance.
   - It will render `IdentityFormFields`, retain the current Save/Cancel UI, and keep the same save/cancel behavior.
   - Rename `initialValues` to `defaultValues` only if the caller in `ProfileDetail` is updated in the same change; this aligns it with the other profile edit forms.
4. Update `ProfileDetail` only as needed for the prop-name consistency change. Its display state, edit-mode transition, and saved identity values must remain unchanged.
5. Verify that the extracted section has no nested `<form>` or independent submit lifecycle, leaving the future large form as the sole owner of validation and submission.

## Out of scope

- Building the future large form or deciding its data model.
- Refactoring the contact, employer, insurance, or urgent-contact forms.
- Changing profile data persistence or adding Salesforce data access.
- Changing labels, field order, options, validation rules, or visual styling.

## Validation

After implementation, run the UI Bundle's `npm run build` and `npm run lint`.
