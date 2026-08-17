import { type ReactNode, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { z } from "zod";
import { CenteredPageLayout } from "../layout/centered-page-layout";
import { AuthForm } from "../forms/auth-form";
import { useAppForm } from "../../../hooks/form";
import { ROUTES } from "../authenticationConfig";
import { emailSchema, getStartUrl } from "../authHelpers";
import { loginPatient } from "../api/authApi";
import { ApiError } from "../utils/helpers";

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Password is required") });

export default function Login() {
  const [searchParams] = useSearchParams();
  const [submitError, setSubmitError] = useState<ReactNode>(null);
  const startUrl = getStartUrl(searchParams);
  const form = useAppForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema, onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      try {
        const result = await loginPatient({
          email: value.email.trim().toLowerCase(),
          password: value.password,
          startUrl,
        });
        window.location.replace(result.redirectUrl);
      } catch (error) {
        setSubmitError(
          error instanceof ApiError ? <ErrorList errors={error.errors} /> : "Login failed. Please try again."
        );
      }
    },
  });

  return (
    <CenteredPageLayout title={ROUTES.LOGIN.TITLE}>
      <form.AppForm>
        <AuthForm
          title="Login"
          description="Enter your email below to login to your account"
          error={submitError}
          submit={{ text: "Login", loadingText: "Logging in…" }}
          footer={{ text: "Don't have an account?", link: ROUTES.REGISTER.PATH, linkText: "Sign up" }}
        >
          <form.AppField name="email">{(field) => <field.EmailField label="Email" />}</form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.PasswordField
                label="Password"
                labelAction={
                  <Link to={ROUTES.FORGOT_PASSWORD.PATH} className="text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </Link>
                }
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
