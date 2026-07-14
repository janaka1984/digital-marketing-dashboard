import type { HostedCheckoutResponse } from "@services/billingApi";

export function submitHostedCheckout(response: HostedCheckoutResponse) {
  if (response.mode === "activated") return;

  if (response.mode === "redirect") {
    window.location.assign(response.checkout_url);
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = response.action_url;
  form.style.display = "none";

  Object.entries(response.fields).forEach(([name, value]) => {
    if (value === null || value === undefined) return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
