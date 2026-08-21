import { createDataSDK } from "@salesforce/platform-sdk";
import type {
  ContactUpdateRepresentation,
  GetProfileContactQuery,
  GetProfileContactQueryVariables,
  GetUserContactQuery,
  GetUserContactQueryVariables,
  UpdateProfileContactMutation,
  UpdateProfileContactMutationVariables,
} from "@/api/graphql-operations-types";
import {
  contactDetailFormSchema,
  employerFormSchema,
  identityFormSchema,
  insuranceFormSchema,
  urgentContactFormSchema,
  type ContactDetailFormValues,
  type EmployerFormValues,
  type IdentityFormValues,
  type InsuranceFormValues,
  type UrgentContactFormValues,
} from "@/components/forms";
import { patientProfileSchema, type PatientProfile } from "../schemas/patientProfileSchema";
import UPDATE_PROFILE_CONTACT_MUTATION from "./muatation/updateProfileContact.graphql?raw";
import GET_CURRENT_USER_QUERY from "./queries/getCurrentUser.graphql?raw";
import GET_PROFILE_CONTACT_QUERY from "./queries/getProfileContact.graphql?raw";

export type { PatientProfile } from "../schemas/patientProfileSchema";

type ContactFieldValue = Readonly<{ value?: string | null }> | null;

type ContactProfileFields = Readonly<{
  Salutation?: ContactFieldValue;
  FirstName?: ContactFieldValue;
  LastName?: ContactFieldValue;
  Birthdate?: ContactFieldValue;
  Place_Of_Birth__c?: ContactFieldValue;
  Nationality__c?: ContactFieldValue;
  GenderIdentity?: ContactFieldValue;
  Marital_Status__c?: ContactFieldValue;
  Phone?: ContactFieldValue;
  MailingStreet?: ContactFieldValue;
  MailingCity?: ContactFieldValue;
  MailingState?: ContactFieldValue;
  Urgent_Contact_Relationship__c?: ContactFieldValue;
  OtherPhone?: ContactFieldValue;
  Title?: ContactFieldValue;
  Employer__c?: ContactFieldValue;
  MailingPostalCode?: ContactFieldValue;
  AVS_Number__c?: ContactFieldValue;
  Insurance_Provider__c?: ContactFieldValue;
  Card_Number__c?: ContactFieldValue;
  Supplementary_Insurance__c?: ContactFieldValue;
}>;

const promiseSDK = createDataSDK();

const getValidationErrorMessage = (message: string, issues: ReadonlyArray<{ message: string }>) =>
  `${message}: ${issues.map((issue) => issue.message).join("; ")}`;

const parsePatientProfile = (rawContact: ContactProfileFields): PatientProfile => {
  const profile = patientProfileSchema.safeParse({
    identity: {
      salutation: rawContact.Salutation?.value,
      firstName: rawContact.FirstName?.value ?? null,
      lastName: rawContact.LastName?.value ?? null,
      dateOfBirth: rawContact.Birthdate?.value ?? null,
      placeOfBirth: rawContact.Place_Of_Birth__c?.value ?? null,
      nationality: rawContact.Nationality__c?.value ?? null,
      gender: rawContact.GenderIdentity?.value ?? null,
      maritalStatus: rawContact.Marital_Status__c?.value ?? null,
    },
    contactDetail: {
      telephone: rawContact.Phone?.value ?? null,
      mailingStreet: rawContact.MailingStreet?.value ?? null,
      mailingCity: rawContact.MailingCity?.value ?? null,
      mailingState: rawContact.MailingState?.value ?? null,
    },
    urgentContact: {
      relationship: rawContact.Urgent_Contact_Relationship__c?.value ?? null,
      urgentContactTelephone: rawContact.OtherPhone?.value ?? null,
    },
    employerDetail: {
      profession: rawContact.Title?.value ?? null,
      employer: rawContact.Employer__c?.value ?? null,
      postalCode: rawContact.MailingPostalCode?.value ?? null,
      city: rawContact.MailingCity?.value ?? null,
    },
    insuranceDetail: {
      avsNumber: rawContact.AVS_Number__c?.value ?? null,
      insurer: rawContact.Insurance_Provider__c?.value ?? null,
      cardNumber: rawContact.Card_Number__c?.value ?? null,
      supplementaryInsurance: rawContact.Supplementary_Insurance__c?.value ?? null,
    },
  });

  if (!profile.success) {
    throw new Error(getValidationErrorMessage("Salesforce returned an invalid patient profile", profile.error.issues));
  }

  return profile.data;
};

function createProfileApi() {
  const getCurrentContactId = async (userId: string) => {
    const sdk = await promiseSDK;
    if (!sdk.graphql) {
      throw new Error("Fail to load sdk, please try again");
    }

    const result = await sdk.graphql.query<GetUserContactQuery, GetUserContactQueryVariables>({
      query: GET_CURRENT_USER_QUERY,
      variables: { userId },
    });

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    return result.data?.uiapi.query.User?.edges?.[0]?.node?.ContactId?.value;
  };

  const getPatientProfile = async (contactId: string): Promise<PatientProfile | null> => {
    const sdk = await promiseSDK;
    if (!sdk.graphql) {
      throw new Error("Fail to load sdk, please try again");
    }

    const result = await sdk.graphql.query<GetProfileContactQuery, GetProfileContactQueryVariables>({
      query: GET_PROFILE_CONTACT_QUERY,
      variables: { contactId },
    });

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const rawContact = result.data?.uiapi.query.Contact?.edges?.[0]?.node;
    return rawContact ? parsePatientProfile(rawContact) : null;
  };

  const getPatientProfileFromUser = async (userId: string): Promise<PatientProfile | null> => {
    const contactId = await getCurrentContactId(userId);
    return contactId ? getPatientProfile(contactId) : null;
  };

  const updateContact = async (userId: string, contact: ContactUpdateRepresentation): Promise<PatientProfile> => {
    const contactId = await getCurrentContactId(userId);
    if (!contactId) {
      throw new Error("No Contact record is associated with the current user");
    }

    const sdk = await promiseSDK;
    const result = await sdk.graphql?.mutate<UpdateProfileContactMutation, UpdateProfileContactMutationVariables>({
      mutation: UPDATE_PROFILE_CONTACT_MUTATION,
      variables: { id: contactId, contact },
    });

    if (!result) {
      throw new Error("Salesforce GraphQL client is unavailable");
    }

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const rawContact = result.data?.uiapi.ContactUpdate?.Record;
    if (!rawContact) {
      throw new Error("Salesforce did not return the updated patient profile");
    }

    return parsePatientProfile(rawContact);
  };

  const updateIdentity = async (userId: string, values: IdentityFormValues): Promise<PatientProfile> => {
    const profile = identityFormSchema.safeParse(values);
    if (!profile.success) {
      throw new Error(getValidationErrorMessage("Invalid identity details", profile.error.issues));
    }

    return updateContact(userId, {
      Salutation: profile.data.salutation,
      FirstName: profile.data.firstName,
      LastName: profile.data.lastName,
      Birthdate: profile.data.dateOfBirth,
      Place_Of_Birth__c: profile.data.placeOfBirth,
      Nationality__c: profile.data.nationality,
      GenderIdentity: profile.data.gender,
      Marital_Status__c: profile.data.maritalStatus,
    });
  };

  const updateContactDetail = async (userId: string, values: ContactDetailFormValues): Promise<PatientProfile> => {
    const profile = contactDetailFormSchema.safeParse(values);
    if (!profile.success) {
      throw new Error(getValidationErrorMessage("Invalid contact details", profile.error.issues));
    }

    return updateContact(userId, {
      Phone: profile.data.telephone,
      MailingStreet: profile.data.mailingStreet,
      MailingCity: profile.data.mailingCity,
      MailingState: profile.data.mailingState,
    });
  };

  const updateUrgentContact = async (userId: string, values: UrgentContactFormValues): Promise<PatientProfile> => {
    const profile = urgentContactFormSchema.safeParse(values);
    if (!profile.success) {
      throw new Error(getValidationErrorMessage("Invalid urgent contact", profile.error.issues));
    }

    return updateContact(userId, {
      Urgent_Contact_Relationship__c: profile.data.relationship,
      OtherPhone: profile.data.urgentContactTelephone,
    });
  };

  const updateEmployerDetail = async (userId: string, values: EmployerFormValues): Promise<PatientProfile> => {
    const profile = employerFormSchema.safeParse(values);
    if (!profile.success) {
      throw new Error(getValidationErrorMessage("Invalid employer details", profile.error.issues));
    }

    return updateContact(userId, {
      Title: profile.data.profession,
      Employer__c: profile.data.employer,
      MailingPostalCode: profile.data.postalCode,
      MailingCity: profile.data.city,
    });
  };

  const updateInsuranceDetail = async (userId: string, values: InsuranceFormValues): Promise<PatientProfile> => {
    const profile = insuranceFormSchema.safeParse(values);
    if (!profile.success) {
      throw new Error(getValidationErrorMessage("Invalid insurance details", profile.error.issues));
    }

    return updateContact(userId, {
      AVS_Number__c: profile.data.avsNumber,
      Insurance_Provider__c: profile.data.insurer,
      Card_Number__c: profile.data.cardNumber,
      Supplementary_Insurance__c: profile.data.supplementaryInsurance,
    });
  };

  return {
    getPatientProfileFromUser,
    updateIdentity,
    updateContactDetail,
    updateUrgentContact,
    updateEmployerDetail,
    updateInsuranceDetail,
  };
}

export const profileApi = createProfileApi();
