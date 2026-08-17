# Person Account Registration and Login Implementation Plan

## Objective

Replace the incomplete template authentication flow with a guest-safe Experience Cloud flow:

```text
Guest registration
  → Person Account + underlying Contact + Customer Community User
  → Salesforce session-establishing redirect
  → verified external-user session
  → protected portal routes

Guest login
  → Salesforce session-establishing redirect
  → verified external-user session
  → protected portal routes
```

Registration is implemented and verified first. Login is refactored only after the registration contract and external-user session work end to end.

## Decisions Already Made

- Patient identity uses **Person Accounts**; the earlier shared Default Account approach is removed.
- The external-user profile is `OWT Customer User` with the `Customer Community` license.
- Experience Cloud self-registration is enabled.
- Record access uses a Sharing Set that maps the user's Person Account to that same Account:

  ```text
  User:Contact.Account = Account:Account
  ```

- Patient-only pages must require a verified external-user session. A non-null Salesforce runtime user does not by itself prove that the visitor is an authenticated patient.

## Scope

### Apex

- `force-app/main/default/classes/UIBundleAuthUtils.cls`
- `force-app/main/default/classes/UIBundleRegistration.cls`
- `force-app/main/default/classes/UIBundleLogin.cls`
- New Apex tests for the testable validation, response, and security behaviour.

### React

- `src/features/authentication/pages/Register.tsx`
- `src/features/authentication/pages/Login.tsx`
- `src/features/authentication/context/AuthContext.tsx`
- `src/features/authentication/forms/auth-form.tsx`
- `src/features/authentication/layouts/privateRouteLayout.tsx`
- Shared auth helpers and API-response handling used by those pages.

### Explicitly Out of Scope

- Appointment querying, sharing, and UI.
- Forgot-password, reset-password, and change-password changes, except for a shared response/helper change that is essential to keep the authentication contract consistent.

## Pre-Implementation Gates

Do not start the code changes until these org settings are confirmed in the deployed Experience Cloud site.

1. **Person Account registration prerequisites**

   - The Person Account record type is available to the site guest profile as its default Account record type, or the provisioning path has a documented configured record type.
   - A designated **internal Salesforce user with a role** is configured as the Person Account owner used by registration.
   - Store the owner identity in deployable configuration; do not hardcode a Salesforce ID in Apex. The implementation must resolve it deterministically and fail safely if it is unavailable or inactive.
   - `OWT Customer User` is selected as the site's self-registration profile and is a site member.

2. **Least-privilege access**

   - The site guest user has access only to the public auth Apex classes and the minimum object/field permissions required by the Person Account provisioning method.
   - `OWT Customer User` can read only the Account and Contact fields required by the portal and has no `View All` or `Modify All` permission.
   - Account external access is private. Contact access follows the Person Account configuration; do not share a common business Account with patients.
   - The Sharing Set mapping above is saved and tested with two distinct Person Account users.

3. **Correct runtime**

   - Registration must be exercised from the published Experience Cloud URL as a guest. It cannot be proven from a normal local Vite session or from an internal Salesforce user session.
   - Before changing React Salesforce calls, load the project-required UI Bundle Salesforce data-access guidance and use the Data SDK only for the permitted Apex REST endpoints.

## API Contract

Both public endpoints return the same JSON shape.

```ts
type AuthSuccess = {
  success: true;
  redirectUrl: string;
};

type AuthFailure = {
  success: false;
  errors: string[];
};
```

- `redirectUrl` is required on success. A 2xx response without it is a server error, not a successful login.
- Errors shown to a guest are safe and generic. They must not include Apex exception messages, Salesforce configuration details, or confirmation that an email already has an account.
- `startUrl` is accepted only as a relative portal path and is sanitized on both the client and server. The server is authoritative.

## Phase 1 — Shared Apex Foundations

### 1. Refactor `UIBundleAuthUtils.cls`

- Retain `AuthException` as the expected-validation error type: one constructor accepts one message, the other accepts a list of messages.
- Add shared helpers/constants for safe generic authentication failures and for producing the agreed response semantics.
- Keep `getSanitizedStartUrl`, but normalize and validate the decoded path before constructing the final site-relative URL.
- Reject absolute URLs, protocol-relative URLs, encoded redirect bypasses, backslashes, control characters, user-info syntax, and protocol/port syntax.
- Log unexpected exceptions only in Salesforce logs; do not make raw exception messages part of REST output.
- Add unit tests for valid routes, fallback routes, and malicious redirect inputs.

## Phase 2 — Registration First

### 2. Refactor `UIBundleRegistration.cls`

Replace the old business-account flow:

```apex
Site.createExternalUser(user, null, password)
```

with the Person Account-specific Site API:

```apex
Site.createPersonAccountPortalUser(user, configuredOwnerId, password)
```

The configured value is the **internal Person Account owner User Id**, not an Account Id and not the old shared Default Account Id.

Implementation requirements:

- Reject a null request, missing fields, invalid email/username syntax, and invalid return URLs with safe HTTP 400 responses.
- Normalize the email and names before validation.
- Validate the password with `Site.validatePassword` before provisioning.
- Build only the user data required by the Site API, including a collision-resistant `CommunityNickname`; do not manually insert Account, Contact, and User records in one transaction.
- Use `Site.createPersonAccountPortalUser` from the active guest-site context so Salesforce creates the Person Account, underlying Contact, and high-volume external user as one supported flow.
- Do not pre-query `User` to disclose duplicate usernames. Translate duplicate/provisioning failures to a generic registration error and log diagnostic details server-side.
- If the Site API returns no User Id, treat registration as failed.
- After successful provisioning, call `Site.login` with the server-sanitized return URL.
- If `Site.login` returns no `PageReference` or no URL, roll back and return a generic failure; never return `{ success: true, redirectUrl: null }`.
- Catch expected validation/provisioning errors separately from unexpected errors. Roll back every failed transaction and never return `Exception.getMessage()` to the guest.

### 3. Registration Tests

Create tests for everything that can run deterministically in Apex tests:

- request validation and normalization;
- redirect sanitization;
- generic error responses;
- null request handling;
- duplicate username response behaviour;
- missing provisioning result and missing login redirect behaviour;
- transaction/error helper behaviour.

Wrap direct `Site` calls behind narrow testable methods or a dependency boundary if needed. Do not pretend a normal Apex unit test proves guest-site provisioning; validate that path manually in the published Experience site.

### 4. Refactor `Register.tsx` and Its Shared Form Path

- Keep client validation for first name, last name, email, password, confirmation, and the locally safe return URL.
- Send exactly `{ request: { firstName, lastName, email, password, startUrl } }` to `/services/apexrest/auth/register` through `createDataSDK().fetch`.
- Check that `sdk.fetch` exists rather than using `sdk.fetch!`.
- Parse the common success/failure contract without `any`; treat a 2xx response missing `redirectUrl` as a generic error.
- On success, call `window.location.replace(redirectUrl)`. Do not set auth state or save credentials/tokens in browser storage.
- Show only safe backend validation errors and keep field values when submission fails.

### 5. Verify Registration Before Login Changes

In an incognito browser on the published site:

1. Open `/register` as a guest and confirm the form is enabled.
2. Register a new email address.
3. Confirm exactly one Person Account, its underlying Contact, and one active `OWT Customer User` external user were created.
4. Confirm the external user is linked to the Person Account's Contact and owned by the configured internal owner.
5. Confirm the returned redirect establishes an external-user session.
6. Register a second patient and verify that the two users cannot read each other's Person Account.
7. Confirm invalid and duplicate registrations reveal no Salesforce diagnostics or account-existence information.

## Phase 3 — Login and React Session State

### 6. Refactor `UIBundleLogin.cls`

- Keep `Site.login` as the sole credential and session mechanism.
- Validate email/username, password, and return URL on the server; React validation is not sufficient.
- Use the same `AuthSuccess`/`AuthFailure` contract as registration.
- Return one generic invalid-credentials error for both null and exception login failures, unless an operational failure can be safely classified and logged as a 500 error.
- Require a non-null login `PageReference` and URL before returning success.
- Log operational errors server-side without leaking them to the browser.

### 7. Refactor Shared React Auth State

- Update `AuthContext` to identify a guest visitor explicitly. It must not use `user !== null` as the definition of patient authentication.
- Verify the available UI Bundle current-user API in the deployed Experience site. If it cannot distinguish guest from external user, add the smallest authenticated-session check necessary on the server instead of guessing from user data.
- Keep the initial session state as `loading`; `PrivateRoute` must not render protected content while it is unresolved.
- Update `AuthForm` so the already-logged-in message and disabled submit state apply only to a verified external session.
- Preserve the requested `startUrl` while redirecting a guest to login.

### 8. Refactor `Login.tsx` and Its Shared Form Path

- Send `{ email, password, startUrl }` to `/services/apexrest/auth/login` through `createDataSDK().fetch`.
- Check `sdk.fetch` availability and parse the common auth response without `any`.
- Only call `window.location.replace(redirectUrl)` after a valid success response.
- An absent `redirectUrl`, malformed response, or non-2xx response shows an error; do not navigate to `/` as though the user is authenticated.
- Do not retain credentials, token values, or fabricated auth state in client storage.

### 9. Protect Routes and Verify Login

- Place patient-only routes, including `/appointments`, beneath `PrivateRoute` only after the external-session check is reliable.
- Confirm public registration and login routes remain available to guest visitors.
- In an incognito browser, sign out, sign in with the registered patient, and verify the original protected `startUrl` is restored.
- Verify a second patient cannot access the first patient's Account, Contact, or future patient records.

## Completion Criteria

- A guest can register without seeing "You are already logged in".
- Registration uses `Site.createPersonAccountPortalUser` with a configured internal owner, not the shared-account `createExternalUser` flow.
- A successful registration or login always returns a valid Salesforce session-establishing redirect URL.
- Errors are generic and safe; no raw exception, configuration, or username-existence data is exposed.
- React uses verified external-session state, not merely a non-null platform user.
- Protected routes are unavailable to guests.
- Person Account sharing is validated with two separate patients.
- Unit tests cover deterministic code paths, and the live guest-site flows are manually verified.

## Delivery Notes

- Retrieve org configuration first if the local Experience Cloud source may be stale.
- Deploy configuration, profile access, Apex, tests, and UI changes in dependency order, then publish the Experience site.
- Per the current user instruction, do not run UI bundle lint or build commands unless explicitly requested.
