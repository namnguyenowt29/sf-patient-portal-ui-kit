import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TOption } from "@/types/common";
import { IdentityEditForm, type IdentityFormValues } from "./IdentityEditForm";
import { ProfileDetailCardView } from "./ProfileDetailCardView";
import { ProfileDetailItem } from "./ProfileDetailItem";
import { formatDateOfBirth } from "@/features/authentication/utils/helpers";
import { ContactDetailEditForm, ContactDetailFormValues } from "./ContactDetailEditForm";
import { UrgentContactEditForm } from "./UrgentContactEditForm";
import { EmployerEditForm, type EmployerFormValues } from "./EmployerEditForm";
import { InsuranceEditForm, type InsuranceFormValues } from "./InsuranceEditForm";
import { ProfileDocumentCard } from "./ProfileDocumentCard";

const initialIdentity: IdentityFormValues = {
  salutation: "ms",
  firstName: "Jeanne",
  lastName: "Dupont",
  dateOfBirth: "1975-05-24",
  placeOfBirth: "Geneva",
  nationality: "Swiss",
  gender: "female",
  maritalStatus: "Married",
};

const salutationLabels: Record<IdentityFormValues["salutation"], string> = {
  mr: "Mr.",
  ms: "Ms.",
  unspecified: "Not specified",
};

const genderLabels: Record<IdentityFormValues["gender"], string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

export function ProfileDetail() {
  const [identity, setIdentity] = useState<IdentityFormValues>(initialIdentity);
  const [contactDetail, setContactDetail] = useState<ContactDetailFormValues>({
    telephone: "+84 934 952 763",
    address: "10 Avenue des Alpes, 1202 Genève, Suisse",
  });
  const [urgentContact, setUrgentContact] = useState({
    relationship: "Father",
    telephone: "+84 934 952 763",
  });
  const [employerDetail, setEmployerDetail] = useState<EmployerFormValues>({
    profession: "Employee",
    employer: "Open Web Technology",
    postalCode: "1205",
    city: "Geneva",
  });
  const [insuranceDetail, setInsuranceDetail] = useState<InsuranceFormValues>({
    avsNumber: "756.0000.0000.00",
    insurer: "CSS",
    cardNumber: "12345678912345678912",
    supplementaryInsurance: "",
  });
  const [identityDocumentFileName, setIdentityDocumentFileName] = useState("jeanne_dupont_identity.pdf");
  const identityDetailOptions: TOption[] = [
    { label: "Salutation", value: salutationLabels[identity.salutation] },
    { label: "First name", value: identity.firstName },
    { label: "Last name", value: identity.lastName },
    { label: "Date of birth", value: formatDateOfBirth(identity.dateOfBirth) },
    { label: "Place of birth", value: identity.placeOfBirth },
    { label: "Nationality", value: identity.nationality },
    { label: "Gender", value: genderLabels[identity.gender] },
    { label: "Marital status", value: identity.maritalStatus },
  ];
  const urgentContactOptions: TOption[] = [
    {
      label: "Relationship",
      value: urgentContact.relationship,
    },
    {
      label: "Telephone",
      value: urgentContact.telephone,
    },
  ];
  const contactDetailOptions: TOption[] = [
    {
      label: "Telephone",
      value: contactDetail.telephone,
    },
    {
      label: "Address",
      value: contactDetail.address,
    },
  ];
  const employerDetailOptions: TOption[] = [
    {
      label: "Profession",
      value: employerDetail.profession,
    },
    {
      label: "Employer",
      value: employerDetail.employer,
    },
    {
      label: "Postal code",
      value: employerDetail.postalCode,
    },
    {
      label: "City",
      value: employerDetail.city,
    },
  ];
  const insuranceDetailOptions: TOption[] = [
    { label: "AVS number", value: insuranceDetail.avsNumber },
    { label: "Insurance provider", value: insuranceDetail.insurer },
    { label: "Card number", value: insuranceDetail.cardNumber },
    { label: "Supplementary insurance", value: insuranceDetail.supplementaryInsurance || "—" },
  ];

  return (
    <Tabs defaultValue="overview" className={cn("mt-8")}>
      <TabsList className="w-full justify-start overflow-x-auto" aria-label="Profile sections">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="contact-details">Contact Details</TabsTrigger>
        <TabsTrigger value="employer">Employer</TabsTrigger>
        <TabsTrigger value="insurance">Insurance</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <ProfileDetailItem title="Identity">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={identityDetailOptions} />
            ) : (
              <IdentityEditForm
                initialValues={identity}
                onCancel={() => setMode("display")}
                onSave={(values) => {
                  setIdentity(values);
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
        <ProfileDetailItem title="Identity Card">
          {({ mode, setMode }) => (
            <ProfileDocumentCard
              label="Identity document"
              fileName={identityDocumentFileName}
              mode={mode}
              onCancel={() => setMode("display")}
              onDownload={() => console.log("// Replace this mock callback with the file-download integration.")}
              onSave={({ file, removeExistingDocument }) => {
                setIdentityDocumentFileName((currentFileName) =>
                  file ? file.name : removeExistingDocument ? "" : currentFileName
                );
                setMode("display");
              }}
            />
          )}
        </ProfileDetailItem>
      </TabsContent>

      <TabsContent value="contact-details">
        <ProfileDetailItem title="Contact Details">
          {({ mode, setMode }) =>
            mode === "display" ? (
              <ProfileDetailCardView options={contactDetailOptions} />
            ) : (
              <ContactDetailEditForm
                defaultValues={contactDetail}
                onCancel={() => setMode("display")}
                onSave={(values) => {
                  setContactDetail(values);
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
                defaultValues={urgentContact}
                onCancel={() => setMode("display")}
                onSave={(values) => {
                  setUrgentContact(values);
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
                defaultValues={employerDetail}
                onCancel={() => setMode("display")}
                onSave={(values) => {
                  setEmployerDetail(values);
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
                defaultValues={insuranceDetail}
                onCancel={() => setMode("display")}
                onSave={(values) => {
                  setInsuranceDetail(values);
                  setMode("display");
                }}
              />
            )
          }
        </ProfileDetailItem>
      </TabsContent>

      <TabsContent value="security" className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Security</h3>
        <p className="text-muted-foreground mt-2">Update your password and account security settings.</p>
      </TabsContent>
    </Tabs>
  );
}
