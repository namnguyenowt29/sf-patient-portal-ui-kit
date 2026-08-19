import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import {
  contactDetailDefaultValues,
  employerDefaultValues,
  identityDefaultValues,
  insuranceDefaultValues,
  urgentContactDefaultValues,
} from "@/components/forms";
import { cn } from "@/lib/utils";
import type { TOption } from "@/types/common";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuth } from "@/hooks/useAuth";
import { profileApi, type PatientProfile } from "../apis/profileApi";
import { ContactDetailEditForm } from "./ContactDetailEditForm";
import { EmployerEditForm } from "./EmployerEditForm";
import { IdentityEditForm } from "./IdentityEditForm";
import { InsuranceEditForm } from "./InsuranceEditForm";
import { ProfileDetailCardView } from "./ProfileDetailCardView";
import { ProfileDetailItem } from "./ProfileDetailItem";
import { UrgentContactEditForm } from "./UrgentContactEditForm";

const formatAddress = (contactDetail: PatientProfile["contactDetail"] | undefined) => {
  if (!contactDetail) {
    return undefined;
  }

  return [contactDetail.mailingStreet, contactDetail.mailingCity, contactDetail.mailingState]
    .filter((value): value is string => Boolean(value))
    .join(", ");
};

export function ProfileDetail() {
  const { user } = useAuth();
  const {
    getPatientProfileFromUser,
    updateContactDetail,
    updateEmployerDetail,
    updateIdentity,
    updateInsuranceDetail,
    updateUrgentContact,
  } = profileApi;
  const { data } = useAsyncData(() => getPatientProfileFromUser(user?.id ?? ""), [user?.id]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(data);
  const identity = patientProfile?.identity;
  const contactDetail = patientProfile?.contactDetail;
  const urgentContact = patientProfile?.urgentContact;
  const employerDetail = patientProfile?.employerDetail;
  const insuranceDetail = patientProfile?.insuranceDetail;

  const identityDetailOptions: TOption[] = [
    { label: "Salutation", value: identity?.salutation },
    { label: "First name", value: identity?.firstName },
    { label: "Last name", value: identity?.lastName },
    { label: "Date of birth", value: identity?.dateOfBirth ?? "" },
    { label: "Place of birth", value: identity?.placeOfBirth },
    { label: "Nationality", value: identity?.nationality },
    { label: "Gender", value: identity?.gender },
    { label: "Marital status", value: identity?.maritalStatus },
  ];
  const contactDetailOptions: TOption[] = [
    { label: "Telephone", value: contactDetail?.telephone },
    { label: "Address", value: formatAddress(contactDetail) },
  ];
  const urgentContactOptions: TOption[] = [
    { label: "Relationship", value: urgentContact?.relationship },
    { label: "Telephone", value: urgentContact?.urgentContactTelephone },
  ];
  const employerDetailOptions: TOption[] = [
    { label: "Profession", value: employerDetail?.profession },
    { label: "Employer", value: employerDetail?.employer },
    { label: "Postal code", value: employerDetail?.postalCode },
    { label: "City", value: employerDetail?.city },
  ];
  const insuranceDetailOptions: TOption[] = [
    { label: "AVS number", value: insuranceDetail?.avsNumber },
    { label: "Insurance provider", value: insuranceDetail?.insurer },
    { label: "Card number", value: insuranceDetail?.cardNumber },
    { label: "Supplementary insurance", value: insuranceDetail?.supplementaryInsurance || "—" },
  ];

  useEffect(() => {
    setPatientProfile(data);
  }, [data]);

  const getUserId = () => {
    if (!user?.id) {
      throw new Error("You must be signed in to update your patient profile.");
    }

    return user.id;
  };

  return (
    <Tabs defaultValue="overview" className={cn("mt-8")}>
      <TabsList className="w-full justify-start overflow-x-auto" aria-label="Profile sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="contact-details">Contact Details</TabsTrigger>
        <TabsTrigger value="employer">Employer</TabsTrigger>
        <TabsTrigger value="insurance">Insurance</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ProfileDetailItem title="Identity">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={identityDetailOptions} />
            ) : (
              <IdentityEditForm
                defaultValues={identity ?? identityDefaultValues}
                onCancel={() => setMode("display")}
                onSave={async (values) => {
                  setPatientProfile(await updateIdentity(getUserId(), values));
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
      </TabsContent>

      <TabsContent value="contact-details">
        <ProfileDetailItem title="Contact Details">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={contactDetailOptions} />
            ) : (
              <ContactDetailEditForm
                defaultValues={contactDetail ?? contactDetailDefaultValues}
                onCancel={() => setMode("display")}
                onSave={async (values) => {
                  setPatientProfile(await updateContactDetail(getUserId(), values));
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
        <ProfileDetailItem title="Urgent Contacts">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={urgentContactOptions} />
            ) : (
              <UrgentContactEditForm
                defaultValues={urgentContact ?? urgentContactDefaultValues}
                onCancel={() => setMode("display")}
                onSave={async (values) => {
                  setPatientProfile(await updateUrgentContact(getUserId(), values));
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
      </TabsContent>

      <TabsContent value="employer">
        <ProfileDetailItem title="Employer">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={employerDetailOptions} />
            ) : (
              <EmployerEditForm
                defaultValues={employerDetail ?? employerDefaultValues}
                onCancel={() => setMode("display")}
                onSave={async (values) => {
                  setPatientProfile(await updateEmployerDetail(getUserId(), values));
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
      </TabsContent>

      <TabsContent value="insurance">
        <ProfileDetailItem title="Insurance">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={insuranceDetailOptions} />
            ) : (
              <InsuranceEditForm
                defaultValues={insuranceDetail ?? insuranceDefaultValues}
                onCancel={() => setMode("display")}
                onSave={async (values) => {
                  setPatientProfile(await updateInsuranceDetail(getUserId(), values));
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
      </TabsContent>
    </Tabs>
  );
}
