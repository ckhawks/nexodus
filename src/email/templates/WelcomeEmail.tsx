/**
 * Welcome email template
 * Sent when a new user joins Nexodus
 */

interface WelcomeEmailProps {
  username: string;
  appUrl: string;
}

export function WelcomeEmail({ username, appUrl }: WelcomeEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px" }}>
      <h2>Welcome to Nexodus, {username}!</h2>
      <p>You&apos;re now part of the collective. Start creating trackers and expanding your impact.</p>
      <a
        href={appUrl}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Open Nexodus
      </a>
      <p style={{ color: "#666", fontSize: "14px", marginTop: "30px" }}>
        <strong>Get Started:</strong>
      </p>
      <ul style={{ color: "#666", fontSize: "14px" }}>
        <li>Create your first tracker</li>
        <li>Set up productivity goals</li>
        <li>Connect with other users</li>
        <li>Build your legacy in the collective</li>
      </ul>
      <p style={{ color: "#666", fontSize: "12px", marginTop: "20px" }}>
        Happy creating!
      </p>
    </div>
  );
}
