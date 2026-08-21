import {
  authConfigured,
  getAdminContext,
  sendRecoveryEmail,
  signInAdmin,
} from "./auth.js";
const form = document.querySelector("#login-form"),
  status = form.querySelector("[role=status]"),
  forgot = document.querySelector("#forgot-password"),
  params = new URLSearchParams(location.search);
const messages = {
  unauthorized: "This account is not authorized for ENIVÈ administration.",
  configuration:
    "Supabase configuration is required before administrators can sign in.",
};
if (params.get("error"))
  status.textContent = messages[params.get("error")] || "Please sign in again.";
if (authConfigured)
  getAdminContext({ redirect: false }).then((context) => {
    if (context) location.replace("/admin/");
  });
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Signing in…";
  const values = Object.fromEntries(new FormData(form)),
    { error } = await signInAdmin(values.email, values.password);
  button.disabled = false;
  if (error) {
    status.textContent = error.message;
    return;
  }
  const next = params.get("next");
  location.replace(next?.startsWith("/admin") ? next : "/admin/");
});
forgot?.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = form.elements.email.value.trim();
  if (!email) {
    status.textContent =
      "Enter your email address first, then select “Forgot password”.";
    form.elements.email.focus();
    return;
  }
  const { error } = await sendRecoveryEmail(email);
  status.textContent = error
    ? error.message
    : "If the account exists, a secure password-reset link has been sent.";
});
