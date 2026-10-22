/**
 * Maps Supabase Auth errors to safe, generic user-facing messages.
 * Deliberately avoids revealing whether an account exists or other
 * sensitive details.
 */
export function friendlyAuthError(raw: string | undefined): string {
  const msg = (raw ?? "").toLowerCase();

  if (msg.includes("invalid login credentials") || msg.includes("invalid_credentials")) {
    return "Incorrect email or password. Try again.";
  }
  if (msg.includes("email not confirmed") || msg.includes("email_not_confirmed")) {
    return "Your email address is not verified yet. Check your inbox for the verification link.";
  }
  if (msg.includes("rate limit") || msg.includes("too_many_requests")) {
    return "Too many attempts. Wait a few minutes and try again.";
  }
  if (msg.includes("user already registered") || msg.includes("already_registered")) {
    return "An account with this email may already exist. Try signing in or resetting your password.";
  }
  if (msg.includes("weak password")) {
    return "That password is too weak. Choose a longer password with letters and numbers.";
  }
  if (msg.includes("expired") || msg.includes("token")) {
    return "This link has expired or was already used. Request a new one.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Could not reach the authentication service. Check your connection and try again.";
  }
  return "Something went wrong. Try again.";
}
