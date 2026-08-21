import { getClient, isConfigured } from "../supabase.js";
const form = document.querySelector("#reset-form"),
  status = form.querySelector("[role=status]");
let client;
async function init() {
  if (!isConfigured) {
    status.textContent = "Supabase configuration is required.";
    form.querySelector("button").disabled = true;
    return;
  }
  client = await getClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session)
    status.textContent =
      "Open this page using the secure recovery link sent to your email.";
}
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = Object.fromEntries(new FormData(form));
  if (values.password !== values.confirmation) {
    status.textContent = "Passwords do not match.";
    return;
  }
  if (values.password.length < 12) {
    status.textContent = "Your password must contain at least 12 characters.";
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  status.textContent = "Updating password…";
  const { error } = await client.auth.updateUser({ password: values.password });
  button.disabled = false;
  if (error) {
    status.textContent = error.message;
    return;
  }
  status.textContent = "Password updated. Redirecting to the dashboard…";
  setTimeout(() => location.replace("/admin/"), 800);
});
init();
