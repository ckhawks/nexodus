/**
 * Password reset email template
 * Sent when a user requests a password reset
 */

interface PasswordResetEmailProps {
  username: string;
  resetUrl: string;
}

export function PasswordResetEmail({
  username,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px" }}>
      <h2>Reset Your Nexodus Password</h2>
      <p>Hi {username},</p>
      <p>Click the link below to reset your password.</p>
      <a
        href={resetUrl}
        style={{
          display: "inline-block",
          padding: "10px 20px",
          backgroundColor: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
        }}
      >
        Reset Password
      </a>
      <p style={{ color: "#666", fontSize: "12px", marginTop: "20px" }}>
        This link will expire in 1 hour.
      </p>
      <p style={{ color: "#666", fontSize: "12px" }}>
        If you didn&apos;t request a password reset, you can ignore this email.
      </p>
    </div>
  );
}
