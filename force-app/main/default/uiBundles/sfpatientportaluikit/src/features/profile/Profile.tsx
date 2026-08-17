// import { useState, useEffect } from "react";
// import { z } from "zod";

// import { CenteredPageLayout } from "../layout/centered-page-layout";
// import { AuthForm } from "../forms/auth-form";
// import { ROUTES } from "../authenticationConfig";
// import { useAppForm } from "../../hooks/form";
// import { emailSchema } from "../../authHelpers";
// import { useUser } from "../../context/AuthContext";
// import { fetchUserProfile, updateUserProfile } from "../../api/userProfileApi";
// import { Skeleton } from "../../../../components/ui/skeleton";
// import { Field, FieldLabel } from "../../../../components/ui/field";
import { Badge } from "@/components/ui/badge";
import { ProfileDetail } from "./components/ProfileDetail";

// const optionalString = z
//   .string()
//   .trim()
//   .transform((val) => (val === "" ? null : val))
//   .nullable()
//   .optional();

// const profileSchema = z.object({
//   FirstName: z.string().trim().min(1, "First name is required"),
//   LastName: z.string().trim().min(1, "Last name is required"),
//   Email: emailSchema,
//   Phone: optionalString,
//   Street: optionalString,
//   City: optionalString,
//   State: optionalString,
//   PostalCode: optionalString,
//   Country: optionalString,
// });

// type ProfileFormValues = z.infer<typeof profileSchema>;

// function FieldSkeleton({ label }: { label: string }) {
//   return (
//     <Field>
//       <FieldLabel>{label}</FieldLabel>
//       <Skeleton className="h-9 w-full rounded-md" />
//     </Field>
//   );
// }

// function ProfileFieldsSkeleton() {
//   return (
//     <div role="status" aria-live="polite">
//       <span className="sr-only">Loading profile…</span>
//       <FieldSkeleton label="Email" />
//       <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
//         <FieldSkeleton label="First name" />
//         <FieldSkeleton label="Last name" />
//       </div>
//       <FieldSkeleton label="Phone" />
//       <FieldSkeleton label="Street" />
//       <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
//         <FieldSkeleton label="City" />
//         <FieldSkeleton label="State" />
//       </div>
//       <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
//         <FieldSkeleton label="Postal Code" />
//         <FieldSkeleton label="Country" />
//       </div>
//     </div>
//   );
// }

export default function Profile() {
  // const user = useUser();
  // const [profile, setProfile] = useState<ProfileFormValues | null>(null);
  // const [loadError, setLoadError] = useState<string | null>(null);
  // const [success, setSuccess] = useState(false);
  // const [submitError, setSubmitError] = useState<string | null>(null);

  // const form = useAppForm({
  //   defaultValues: {} as ProfileFormValues,
  //   validators: { onChange: profileSchema, onSubmit: profileSchema },
  //   onSubmit: async ({ value }) => {
  //     setSubmitError(null);
  //     setSuccess(false);
  //     try {
  //       const updated = await updateUserProfile<Partial<ProfileFormValues>>(user.id, value);
  //       // Merge with submitted values so missing fields (e.g. due to FLS) don't break the form
  //       setProfile({
  //         FirstName: updated.FirstName ?? value.FirstName ?? "",
  //         LastName: updated.LastName ?? value.LastName ?? "",
  //         Email: updated.Email ?? value.Email ?? "",
  //         Phone: updated.Phone ?? value.Phone ?? null,
  //         Street: updated.Street ?? value.Street ?? null,
  //         City: updated.City ?? value.City ?? null,
  //         State: updated.State ?? value.State ?? null,
  //         PostalCode: updated.PostalCode ?? value.PostalCode ?? null,
  //         Country: updated.Country ?? value.Country ?? null,
  //       });
  //       setSuccess(true);
  //       window.scrollTo({ top: 0, behavior: "smooth" });
  //     } catch (err) {
  //       console.error("Failed to update profile", err);
  //       setSubmitError("Failed to update profile");
  //     }
  //   },
  //   onSubmitInvalid: () => {},
  // });

  // useEffect(() => {
  //   let mounted = true;
  //   fetchUserProfile<Partial<ProfileFormValues>>(user.id)
  //     .then((data) => {
  //       if (mounted) {
  //         // Merge with defaults so missing fields (e.g. due to FLS) don't break the form
  //         setProfile({
  //           FirstName: data.FirstName ?? "",
  //           LastName: data.LastName ?? "",
  //           Email: data.Email ?? "",
  //           Phone: data.Phone ?? null,
  //           Street: data.Street ?? null,
  //           City: data.City ?? null,
  //           State: data.State ?? null,
  //           PostalCode: data.PostalCode ?? null,
  //           Country: data.Country ?? null,
  //         });
  //       }
  //     })
  //     .catch((err: any) => {
  //       console.error("Failed to load profile", err);
  //       if (mounted) {
  //         setLoadError("Failed to load profile");
  //       }
  //     });
  //   return () => {
  //     mounted = false;
  //   };
  // }, [user.id]);

  // useEffect(() => {
  //   if (profile) {
  //     const formData = profileSchema.parse(profile);
  //     form.reset(formData);
  //   }
  // }, [profile, form]);

  // const loading = !profile && !loadError;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-4 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile</h2>
        <Badge className="bg-gray-400">Patient ID: 213xzs13221</Badge>
      </div>
      <ProfileDetail />
    </section>
  );
}
