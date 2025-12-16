/**
 * Email verification template
 * Used when a user needs to verify their email address
 */

interface VerificationEmailProps {
  username: string;
  verificationUrl: string;
}

export function VerificationEmail({
  username,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px" }}>
      <h2>Welcome to Nexodus, {username}!</h2>
      <p>Please verify your email address to get started.</p>
      <a
        href={verificationUrl}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Verify Email
      </a>
      <p style={{ color: "#666", fontSize: "12px", marginTop: "20px" }}>
        If you didn&apos;t create this account, you can ignore this email.
      </p>
    </div>
  );
}
