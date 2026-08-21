import { createDataSDK } from "@salesforce/platform-sdk";

import type {
  CreatePreAdmissionMutation,
  CreatePreAdmissionMutationVariables,
  PreAdmission__CCreateRepresentation,
} from "@/api/graphql-operations-types";
import type {
  ContactDetailFormValues,
  EmployerFormValues,
  IdentityFormValues,
  InsuranceFormValues,
  UrgentContactFormValues,
} from "@/components/forms";
import { profileApi } from "@/features/profile/apis/profileApi";
import CREATE_PRE_ADMISSION_MUTATION from "./mutations/createPreAdmission.graphql?raw";

export type CreatePreAdmissionInput = Readonly<
  IdentityFormValues & ContactDetailFormValues & UrgentContactFormValues & EmployerFormValues & InsuranceFormValues
>;

export type CreatedPreAdmission = Readonly<{
  id: string;
  number: string | null;
}>;

const FORM_VERSION = "1.0";
const promiseSDK = createDataSDK();

const trimOrNull = (value: string | null): string | null => {
  const trimmedValue = value?.trim();
  return trimmedValue ?? null;
};

const toSalesforceProfession = (profession: string | null): string | null => {
  const trimmedProfession = trimOrNull(profession);
  return trimmedProfession === "Self-employed" ? "Self_employed" : trimmedProfession;
};

const toCreateRepresentation = (
  contactId: string,
  input: CreatePreAdmissionInput
): PreAdmission__CCreateRepresentation => ({
  AVS_Number__c: trimOrNull(input.avsNumber),
  Card_Number__c: trimOrNull(input.cardNumber),
  Contact__c: contactId,
  Date_Of_Birth__c: input.dateOfBirth,
  Employer_City__c: trimOrNull(input.city),
  Employer_Postal_Code__c: trimOrNull(input.postalCode),
  Employer__c: trimOrNull(input.employer),
  First_Name__c: trimOrNull(input.firstName),
  Form_Version__c: FORM_VERSION,
  Gender__c: input.gender,
  Insurance_Provider__c: trimOrNull(input.insurer),
  Last_Name__c: trimOrNull(input.lastName),
  Mailing_City__c: trimOrNull(input.mailingCity),
  Mailing_State__c: trimOrNull(input.mailingState),
  Mailing_Street__c: trimOrNull(input.mailingStreet),
  Marital_Status__c: trimOrNull(input.maritalStatus),
  Nationality__c: trimOrNull(input.nationality),
  Place_Of_Birth__c: trimOrNull(input.placeOfBirth),
  Profession__c: toSalesforceProfession(input.profession),
  Salutation__c: input.salutation,
  Status__c: "Submitted",
  Submitted_At__c: new Date().toISOString(),
  Supplementary_Insurance__c: trimOrNull(input.supplementaryInsurance),
  Telephone__c: trimOrNull(input.telephone),
  Urgent_Contact_Relationship__c: trimOrNull(input.relationship),
  Urgent_Contact_Telephone__c: trimOrNull(input.urgentContactTelephone),
});

function createPreAdmissionApi() {
  const createPreAdmissionForUser = async (
    userId: string,
    input: CreatePreAdmissionInput
  ): Promise<CreatedPreAdmission> => {
    if (!userId) {
      throw new Error("You must be signed in to submit a pre-admission.");
    }

    const contactId = await profileApi.getCurrentContactId(userId);
    if (!contactId) {
      throw new Error("No Contact record is associated with the current user.");
    }

    const sdk = await promiseSDK;
    const result = await sdk.graphql?.mutate<CreatePreAdmissionMutation, CreatePreAdmissionMutationVariables>({
      mutation: CREATE_PRE_ADMISSION_MUTATION,
      variables: {
        preAdmission: toCreateRepresentation(contactId, input),
      },
    });

    if (!result) {
      throw new Error("Salesforce GraphQL client is unavailable.");
    }

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join("; "));
    }

    const record = result.data?.uiapi.PreAdmission__cCreate?.Record;
    if (!record?.Id) {
      throw new Error("Salesforce did not return the new pre-admission.");
    }

    return {
      id: record.Id,
      number: record.Name?.value ?? null,
    };
  };

  return { createPreAdmissionForUser };
}

export const preAdmissionApi = createPreAdmissionApi();
