export function getSubscriptionError(data) {
  const detail = data?.detail;

  if (!detail || typeof detail !== "object") {
    return null;
  }

  if (detail.code === "PRO_REQUIRED") {
    return {
      isSubscriptionError: true,
      code: detail.code,
      message: detail.message || "This feature requires Mak-AI Pro.",
    };
  }

  if (detail.code === "PLAN_LIMIT_REACHED") {
    return {
      isSubscriptionError: true,
      code: detail.code,
      message: detail.message || "You've reached your current plan limit.",
      limit: detail.limit,
    };
  }

  return null;
}
