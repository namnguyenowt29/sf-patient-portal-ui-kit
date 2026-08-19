# Create Custom Appointment Object in Salesforce

## Description

Create a custom Salesforce object to manage patient appointments without using Salesforce Field Service.

The appointment record should be linked to a Contact and support basic booking, status tracking, cancellation, and portal usage.

## Object

**Label:** Appointment
**API Name:** `Appointment__c`

Use Auto Number for the record name.

Example format:

`APT-{00000}`

## Fields

| Field Label         | API Name                 | Type            |
| ------------------- | ------------------------ | --------------- |
| Contact             | `Contact__c`             | Lookup(Contact) |
| Start Date Time     | `Start_Date_Time__c`     | Date/Time       |
| End Date Time       | `End_Date_Time__c`       | Date/Time       |
| Status              | `Status__c`              | Picklist        |
| Appointment Type    | `Appointment_Type__c`    | Picklist        |
| Location            | `Location__c`            | Text(255)       |
| Patient Notes       | `Patient_Notes__c`       | Long Text Area  |
| Internal Notes      | `Internal_Notes__c`      | Long Text Area  |
| Cancellation Reason | `Cancellation_Reason__c` | Long Text Area  |
| Cancelled At        | `Cancelled_At__c`        | Date/Time       |

## Picklist Values

### Status

- Scheduled
- Confirmed
- Completed
- Cancelled
- No Show

### Appointment Type

- Consultation
- Follow-up
- Check-up
- Other

## Requirements

- Each Appointment must be associated with a Contact.
- `Start_Date_Time__c` must be earlier than `End_Date_Time__c`.
- Appointment records should support querying upcoming appointments by Contact and Start Date Time.
- Patient-facing notes and internal notes must be stored separately.
- Cancellation information should be stored when an appointment is cancelled.
- The object must be available through Salesforce APIs / GraphQL UI API where supported.
- Configure object and field permissions so the Experience Cloud portal can access the required fields.

## Acceptance Criteria

- [ ] `Appointment__c` is created successfully.
- [ ] All required fields are created with the specified API names and data types.
- [ ] Appointment records can be linked to Contact records.
- [ ] Status and Appointment Type picklists contain the defined values.
- [ ] A validation rule prevents End Date Time from being earlier than or equal to Start Date Time.
- [ ] Appointment records can be queried by Contact.
- [ ] Upcoming appointments can be sorted and filtered using `Start_Date_Time__c`.
- [ ] Required object and field-level permissions are configured for the portal user.
- [ ] Internal Notes are not exposed to external portal users.
