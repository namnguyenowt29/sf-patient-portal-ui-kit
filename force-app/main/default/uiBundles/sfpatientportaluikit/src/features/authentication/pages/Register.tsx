import { useState } from "react";
import { useSearchParams } from "react-router";
import { z } from "zod";
import { CenteredPageLayout } from "../layout/centered-page-layout";
import { AuthForm } from "../forms/auth-form";
import { useAppForm } from "../../../hooks/form";
import { AUTH_PLACEHOLDERS, ROUTES } from "../authenticationConfig";
import { emailSchema, getStartUrl, passwordSchema } from "../authHelpers";
import { registerPatient } from "../api/authApi";
import { ApiError } from "../utils/helpers";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    startUrl: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function Register() {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<React.ReactNode>(null);

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      startUrl: getStartUrl(searchParams),
    },
    validators: { onChange: registerSchema, onSubmit: registerSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      try {
        const result = await registerPatient({
          firstName: value.firstName.trim(),
          lastName: value.lastName.trim(),
          email: value.email.trim().toLowerCase(),
          password: value.password,
          startUrl: value.startUrl,
        });
        window.location.replace(result.redirectUrl);
      } catch (error) {
        if (error instanceof ApiError) {
          setSubmitError(<ErrorList errors={error.errors} />);
        } else {
          setSubmitError("Registration failed. Please try again.");
        }
      }
    },
    onSubmitInvalid: () => {},
  });

  return (
    <CenteredPageLayout title={ROUTES.REGISTER.TITLE}>
      <form.AppForm>
        <AuthForm
          title="Sign Up"
          description="Enter your information to create an account"
          error={submitError}
          submit={{ text: "Create an account", loadingText: "Creating account…" }}
          footer={{ text: "Already have an account?", link: ROUTES.LOGIN.PATH, linkText: "Sign in" }}
        >
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
            <form.AppField name="firstName">
              {(field) => (
                <field.TextField
                  label="First name"
                  placeholder={AUTH_PLACEHOLDERS.FIRST_NAME}
                  autoComplete="given-name"
                />
              )}
            </form.AppField>
            <form.AppField name="lastName">
              {(field) => (
                <field.TextField
                  label="Last name"
                  placeholder={AUTH_PLACEHOLDERS.LAST_NAME}
                  autoComplete="family-name"
                />
              )}
            </form.AppField>
          </div>
          <form.AppField name="email">{(field) => <field.EmailField label="Email" />}</form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label="Password"
                placeholder={AUTH_PLACEHOLDERS.PASSWORD_CREATE}
                autoComplete="new-password"
              />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field) => (
              <field.PasswordField
                label="Confirm Password"
                placeholder={AUTH_PLACEHOLDERS.PASSWORD_CONFIRM}
                autoComplete="new-password"
              />
            )}
          </form.AppField>
        </AuthForm>
      </form.AppForm>
    </CenteredPageLayout>
  );
}

function ErrorList({ errors }: Readonly<{ errors: string[] }>) {
  return errors.length === 1 ? (
    errors[0]
  ) : (
    <ul>
      {errors.map((error) => (
        <li key={error}>{error}</li>
      ))}
    </ul>
  );
}
