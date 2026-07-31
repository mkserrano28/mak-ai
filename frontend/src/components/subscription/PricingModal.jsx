export default function PricingModal({
  subscription,
  onClose,
  onUpgrade,
  upgrading = false,
}) {
  const currentPlan = subscription?.plan || "free";

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.close}>
          ×
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>Upgrade Mak-AI</h1>

          <p style={styles.subtitle}>
            Unlock more capacity and workflow automation.
          </p>
        </div>

        <div style={styles.plans}>
          {/* FREE */}
          <div style={styles.card}>
            <div>
              <h2>Free</h2>

              <div style={styles.price}>
                ₱0
                <span style={styles.period}>/month</span>
              </div>

              <p style={styles.description}>For exploring Mak-AI.</p>

              <Feature text="2 workspaces" />
              <Feature text="3 saved workflows" />
              <Feature text="5 documents per workspace" />
              <Feature text="AI chat" />
              <Feature text="n8n deployment unavailable" disabled />
            </div>

            <button
              disabled={currentPlan === "free"}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
              }}
            >
              {currentPlan === "free" ? "Current plan" : "Free"}
            </button>
          </div>

          {/* PRO */}
          <div
            style={{
              ...styles.card,
              ...styles.proCard,
            }}
          >
            <div>
              <div style={styles.badge}>RECOMMENDED</div>

              <h2>Pro</h2>

              <div style={styles.price}>
                ₱499
                <span style={styles.period}>/month</span>
              </div>

              <p style={styles.description}>
                For advanced AI workflows and automation.
              </p>

              <Feature text="20 workspaces" />
              <Feature text="50 saved workflows" />
              <Feature text="50 documents per workspace" />
              <Feature text="AI chat" />
              <Feature text="Deploy workflows to n8n" />
            </div>

            <button
              onClick={onUpgrade}
              disabled={currentPlan === "pro" || upgrading}
              style={{
                ...styles.button,
                ...styles.proButton,
              }}
            >
              {currentPlan === "pro"
                ? "Current plan"
                : upgrading
                  ? "Upgrading..."
                  : "Upgrade to Pro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ text, disabled = false }) {
  return (
    <div
      style={{
        ...styles.feature,
        opacity: disabled ? 0.45 : 1,
      }}
    >
      <span>{disabled ? "—" : "✓"}</span>

      <span>{text}</span>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },

  modal: {
    position: "relative",
    width: "min(850px, 100%)",
    background: "#111827",
    border: "1px solid #374151",
    borderRadius: 20,
    padding: 32,
    color: "#f9fafb",
    boxShadow: "0 30px 80px rgba(0,0,0,.45)",
  },

  close: {
    position: "absolute",
    right: 20,
    top: 14,
    border: "none",
    background: "transparent",
    color: "#9ca3af",
    fontSize: 30,
    cursor: "pointer",
  },

  header: {
    textAlign: "center",
    marginBottom: 28,
  },

  title: {
    margin: 0,
    fontSize: 30,
  },

  subtitle: {
    color: "#9ca3af",
  },

  plans: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 18,
  },

  card: {
    padding: 26,
    borderRadius: 16,
    border: "1px solid #374151",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: 390,
  },

  proCard: {
    border: "1px solid #6366f1",
  },

  badge: {
    display: "inline-block",
    background: "#4f46e5",
    borderRadius: 20,
    padding: "5px 10px",
    fontSize: 11,
    fontWeight: 700,
  },

  price: {
    fontSize: 32,
    fontWeight: 700,
    margin: "15px 0",
  },

  period: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: 400,
  },

  description: {
    color: "#9ca3af",
    marginBottom: 24,
  },

  feature: {
    display: "flex",
    gap: 10,
    marginBottom: 12,
  },

  button: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    marginTop: 24,
  },

  secondaryButton: {
    background: "#1f2937",
    color: "#d1d5db",
    border: "1px solid #374151",
  },

  proButton: {
    background: "#4f46e5",
    color: "white",
    border: "none",
  },
};
