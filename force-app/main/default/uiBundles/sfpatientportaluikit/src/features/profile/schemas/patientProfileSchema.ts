import { z } from "zod";
import {
  contactDetailFormSchema,
  employerFormSchema,
  identityFormSchema,
  insuranceFormSchema,
  urgentContactFormSchema,
} from "@/components/forms";

export const patientProfileSchema = z.object({
  identity: identityFormSchema,
  contactDetail: contactDetailFormSchema,
  urgentContact: urgentContactFormSchema,
  employerDetail: employerFormSchema,
  insuranceDetail: insuranceFormSchema,
});

export type PatientProfile = z.infer<typeof patientProfileSchema>;
