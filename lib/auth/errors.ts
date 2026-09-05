export function mapSupabaseAuthError(error: {
  code?: string;
  message?: string;
}) {
  switch (error.code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "email_not_confirmed":
      return "emailNotConfirmed";
    case "user_already_exists":
      return "signupFailed";
    case "weak_password":
      return "passwordTooShort";
    case "over_email_send_rate_limit":
      return "rateLimited";
    case "same_password":
      return "samePassword";
  }

  const message = (error.message ?? "").toLowerCase();
  if (message.includes("email not confirmed")) return "emailNotConfirmed";
  if (message.includes("invalid login")) return "invalidCredentials";
  if (message.includes("already registered")) return "signupFailed";
  if (message.includes("rate limit")) return "rateLimited";

  return "generic";
}
