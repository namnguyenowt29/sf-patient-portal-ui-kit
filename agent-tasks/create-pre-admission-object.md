# Create Pre-Admission Custom Object

## Scope

Create only the Salesforce custom-object metadata for `PreAdmission__c`.

This task includes:

- The `PreAdmission__c` object metadata.
- The Contact lookup and all snapshot fields listed below.
- The field-to-Contact mapping as metadata documentation for the future submission flow.
- Adding the object and its fields to `package.xml` if required by the project metadata layout.

This task does not include:

- Changes to React/UI code, including `PreAdmissionForm.tsx`.
- GraphQL queries, mutations, Data SDK integration, Contact synchronization, or Apex.
- Profiles, permission sets, sharing rules, FLS, Guest User access, or Shield configuration.
- Validation rules or required-field behavior beyond the field metadata explicitly listed below.
- Any unrelated metadata or code changes.

## Object metadata

| Property | Value |
| --- | --- |
| Label | `Pre-Admission` |
| Plural Label | `Pre-Admissions` |
| API Name | `PreAdmission__c` |
| Name Field | Auto Number |
| Number Format | `PA-{000000}` |
| Deployment Status | `Deployed` |
| Visibility | `Public` |
| Sharing Model | `ReadWrite` |
| Features | Search, reports, activities, and history tracking enabled |

The object stores a point-in-time snapshot of the four-step pre-admission form. Snapshot values must remain independent from later changes to the Contact record.

## Fields

Create the following fields on `PreAdmission__c`. Unless marked otherwise, fields are not required, unique, or external IDs so that future draft records remain possible.

### Submission fields

| Field Label | API Name | Type | Configuration |
| --- | --- | --- | --- |
| Contact | `Contact__c` | Lookup(Contact) | Required; delete constraint `Restrict` |
| Status | `Status__c` | Restricted Picklist | `Draft`, `Submitted`, `In Review`, `Completed`, `Rejected` |
| Submitted At | `Submitted_At__c` | Date/Time | Populated by a future submission flow |
| Form Version | `Form_Version__c` | Text(20) | Stores the form/schema version |

### Identity fields

| Field Label | API Name | Type | Configuration |
| --- | --- | --- | --- |
| Salutation | `Salutation__c` | Restricted Picklist | `Mr.`, `Ms.`, `Mx.` |
| First Name | `First_Name__c` | Text(80) | — |
| Last Name | `Last_Name__c` | Text(80) | — |
| Date Of Birth | `Date_Of_Birth__c` | Date | — |
| Place Of Birth | `Place_Of_Birth__c` | Text(255) | — |
| Nationality | `Nationality__c` | Text(80) | — |
| Gender | `Gender__c` | Restricted Picklist | `Male`, `Female`, `Not Listed`, `Nonbinary` |
| Marital Status | `Marital_Status__c` | Restricted Picklist | `Single`, `Married`, `Divorced`, `Widowed` |

### Contact details fields

| Field Label | API Name | Type |
| --- | --- | --- |
| Telephone | `Telephone__c` | Phone |
| Mailing Street | `Mailing_Street__c` | Text(255) |
| Mailing City | `Mailing_City__c` | Text(80) |
| Mailing State | `Mailing_State__c` | Text(80) |

### Urgent contact fields

These are part of the Contact Details step, not a separate form step.

| Field Label | API Name | Type |
| --- | --- | --- |
| Urgent Contact Relationship | `Urgent_Contact_Relationship__c` | Text(80) |
| Urgent Contact Telephone | `Urgent_Contact_Telephone__c` | Phone |

### Employer fields

| Field Label | API Name | Type |
| --- | --- | --- |
| Profession | `Profession__c` | Restricted Picklist: `Employee`, `Self-employed`, `Student`, `Retired`, `Unemployed` |
| Employer | `Employer__c` | Text(255) |
| Employer Postal Code | `Employer_Postal_Code__c` | Text(20) |
| Employer City | `Employer_City__c` | Text(80) |

Postal codes must remain Text fields so leading zeroes and non-numeric values are preserved.

### Insurance fields

| Field Label | API Name | Type | Configuration |
| --- | --- | --- | --- |
| AVS Number | `AVS_Number__c` | Text(20) | Not Number, Unique, or External ID |
| Insurance Provider | `Insurance_Provider__c` | Text(255) | — |
| Card Number | `Card_Number__c` | Text(64) | Not Number, Unique, or External ID |
| Supplementary Insurance | `Supplementary_Insurance__c` | Text(255) | — |

AVS Number and Card Number are sensitive snapshot values. Do not add formula behavior, Unique, or External ID configuration to either field.

## Mapping reference

Keep this mapping as part of the task specification only. Do not implement synchronization in this task.

### Step 1 — Identity

| Pre-admission field | Contact field |
| --- | --- |
| Salutation | `Salutation` |
| First Name | `FirstName` |
| Last Name | `LastName` |
| Date Of Birth | `Birthdate` |
| Place Of Birth | `Place_Of_Birth__c` |
| Nationality | `Nationality__c` |
| Gender | `GenderIdentity` |
| Marital Status | `Marital_Status__c` |

### Step 2 — Contact Details and Urgent Contact

| Pre-admission field | Contact field |
| --- | --- |
| Telephone | `Phone` |
| Mailing Street | `MailingStreet` |
| Mailing City | `MailingCity` |
| Mailing State | `MailingState` |
| Urgent Contact Relationship | `Urgent_Contact_Relationship__c` |
| Urgent Contact Telephone | `OtherPhone` |

### Step 3 — Employer

| Pre-admission field | Contact field |
| --- | --- |
| Profession | `Title` |
| Employer | `Employer__c` |

`Employer_Postal_Code__c` and `Employer_City__c` are snapshot-only fields. They must not map to Contact mailing address fields.

### Step 4 — Insurance

| Pre-admission field | Contact field |
| --- | --- |
| AVS Number | `AVS_Number__c` |
| Insurance Provider | `Insurance_Provider__c` |
| Card Number | `Card_Number__c` |
| Supplementary Insurance | `Supplementary_Insurance__c` |

## Metadata constraints

- Resolve the Salesforce source directory from `sfdx-project.json`; do not assume `force-app`.
- Create the object as `<source>/objects/PreAdmission__c/PreAdmission__c.object-meta.xml` and fields in the project’s standard CustomField metadata location.
- Include an enriched human-readable object description using field labels, not API names.
- Do not add a Master-Detail relationship; therefore use `ReadWrite` sharing.
- Do not add validation rules, formulas, roll-ups, or additional fields.
- Do not modify files outside the metadata required for this object and its package registration.

## Acceptance criteria

- [ ] Only `PreAdmission__c` metadata, its listed fields, and necessary `package.xml` entries are changed.
- [ ] The object uses Auto Number format `PA-{000000}` and the required object metadata settings.
- [ ] The required restricted picklists contain exactly the specified values.
- [ ] `Contact__c` is a required Lookup to Contact with delete constraint `Restrict`.
- [ ] All four form steps are represented by snapshot fields, with Urgent Contact under Contact Details.
- [ ] Postal codes use Text fields.
- [ ] AVS Number and Card Number use Text fields and are neither Unique nor External IDs.
- [ ] Employer City and Employer Postal Code remain snapshot-only and do not replace Contact mailing fields.
- [ ] No React, Data SDK, GraphQL, Apex, profile, permission, sharing, or unrelated code is changed.
