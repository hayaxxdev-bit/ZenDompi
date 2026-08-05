/**
 * Halaman root — Status & Health Check
 * 
 * Bisa diakses di: https://zendompi-bot.vercel.app/
 */
export default function HomePage() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      padding: "2rem",
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
        🏦 ZenDompi Bot
      </h1>
      <p style={{ color: "#a3a3a3", marginBottom: "2rem" }}>
        Webhook Bot untuk Telegram & WhatsApp
      </p>

      <div style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        maxWidth: "600px",
        width: "100%",
      }}>
        {/* Status Card */}
        <StatusCard
          title="📡 Telegram"
          endpoint="/api/webhook/telegram"
          method="POST"
        />
        <StatusCard
          title="📡 WhatsApp"
          endpoint="/api/webhook/whatsapp"
          method="POST"
        />
        <StatusCard
          title="⚙️ Processor"
          endpoint="/api/process"
          method="POST (QStash)"
        />
        <StatusCard
          title="🟢 Health"
          endpoint="/api/health"
          method="GET"
        />
      </div>

      <p style={{ marginTop: "3rem", color: "#525252", fontSize: "0.875rem" }}>
        ZenDompi v1.0.0 • {new Date().getFullYear()}
      </p>
    </div>
  );
}

function StatusCard({
  title,
  endpoint,
  method,
}: {
  title: string;
  endpoint: string;
  method: string;
}) {
  return (
    <div style={{
      border: "1px solid #262626",
      borderRadius: "0.75rem",
      padding: "1.25rem",
      backgroundColor: "#171717",
      textAlign: "left",
    }}>
      <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>{title}</h3>
      <code style={{
        display: "block",
        fontSize: "0.8rem",
        color: "#a3a3a3",
        marginBottom: "0.25rem",
      }}>
        {endpoint}
      </code>
      <span style={{
        display: "inline-block",
        fontSize: "0.7rem",
        fontWeight: 600,
        padding: "0.15rem 0.5rem",
        borderRadius: "0.25rem",
        backgroundColor: method === "GET" ? "#14532d" : "#1e3a5f",
        color: method === "GET" ? "#86efac" : "#93c5fd",
      }}>
        {method}
      </span>
    </div>
  );
}