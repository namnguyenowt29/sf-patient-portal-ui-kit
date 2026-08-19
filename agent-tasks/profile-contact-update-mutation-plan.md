# Profile Contact update mutation plan

## Decision

Yes. Salesforce Data SDK supports record updates through `sdk.graphql?.mutate()` and the GraphQL UI API mutation surface. This application is on API version 67.0, where GraphQL mutations are generally available. The update will use the `ContactUpdate` mutation, not REST, `fetch`, SOQL, or Apex.

## Scope

Persist the fields currently read by `getProfileContact.graphql` when the user saves `IdentityEditForm`:

- `Salutation`
- `FirstName`
- `LastName`
- `Birthdate`
- `Place_Of_Birth__c`
- `Nationality__c`
- `GenderIdentity`
- `Marital_Status__c`

The Contact Id returned by the existing read query will identify the record to update.

## Implementation steps

1. Verify the mutation contract before writing it.
   - Run `bash scripts/graphql-search.sh Contact` from the repository root.
   - Confirm that `ContactUpdateInput`, `ContactUpdateRepresentation`, `ContactUpdate`, and each listed field exist and are updateable in the current org schema.
   - If the schema is stale after metadata or permission changes, run `npm run graphql:schema` and `npm run graphql:codegen` from the UI Bundle directory first.

2. Add `src/features/profile/apis/queries/updateProfileContact.graphql`.
   - Define an `UpdateProfileContact` mutation with a typed `ContactUpdateRepresentation` variable.
   - Use the required UI API shape: `uiapi(input: { allOrNone: true }) { ContactUpdate(...) { ... } }`.
   - Set the Contact `Id` plus the identity fields above in the representation. Send the date as `YYYY-MM-DD`.
   - Request the updated `Record` Id and the same fields returned by the read query. Mark every returned record field with `@optional` for field-level-security resilience.

3. Regenerate GraphQL types.
   - Run `npm run graphql:codegen` from `force-app/main/default/uiBundles/sfpatientportaluikit`.
   - Use the generated mutation result and variables types; do not introduce `any` or hand-written duplicate GraphQL types.

4. Add a typed `updatePatientProfile(userId, values)` method to `src/features/profile/apis/profileApi.ts` without refactoring the existing read methods.
   - Import the mutation document and generated types.
   - Validate the submitted identity values with `identityFormSchema.safeParse()` before sending the mutation; reject invalid values with a useful error.
   - Reuse the existing `getCurrentContactId(userId)` helper to resolve the target Contact Id.
   - Obtain the Data SDK through the existing `createDataSDK()` promise and call `sdk.graphql?.mutate({ mutation, variables })`.
   - Treat an unavailable GraphQL client and a non-empty `result.errors` array as errors, even if the request returns HTTP 200.
   - Map and validate the returned Contact record through `identityFormSchema.safeParse()` before returning the saved profile to the caller. This is the only data passed back to the form state.

5. Connect the save action in `ProfileDetail.tsx`.
   - Make `IdentityEditForm.onSave` asynchronous, disable/relabel the Save button while the mutation is pending, and surface a mutation error without leaving edit mode.
   - On success, set `patientProfile` from the validated mutation response, return to display mode, and render the identity summary from `patientProfile` rather than the stale `data` query result. Pass the authenticated user ID to the API method; do not add record identity to the editable form data or state.
   - Do not depend on mutation cache updates: Data SDK mutations are not cached. Use the mutation response for the immediate UI update and optionally re-run the profile query to reconcile server data.

6. Validate.
   - Run `npm run build` and `npm run lint` from the UI Bundle directory.
   - Start `npm run dev` from that directory for manual verification.
   - Verify a successful save, a field-level validation failure, insufficient field permission, and a network/API error; confirm no UI state is incorrectly updated after a failed mutation.

## Sources

- Salesforce: [GraphQL Mutations in Data SDK](https://developer.salesforce.com/docs/platform/multiframework/guide/reactdev-data-sdk-graphql-mutation.html)
- Salesforce: [Update a Record with GraphQL](https://developer.salesforce.com/docs/platform/graphql/guide/mutations-update.html)
- Salesforce: [GraphQL Mutate Parameters](https://developer.salesforce.com/docs/platform/multiframework/guide/reactdev-data-sdk-mutate.html)
