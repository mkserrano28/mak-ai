import { apiFetch } from "./api";

export async function getSubscription() {
  const response = await apiFetch("/api/subscription/me");

  if (!response.ok) {
    throw new Error("Failed to load subscription");
  }

  return await response.json();
}
export async function mockUpgradeToPro() {
  const response = await apiFetch("/api/subscription/mock-checkout", {
    method: "POST",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Failed to upgrade subscription");
  }

  return data;
}
