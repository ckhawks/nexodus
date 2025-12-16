import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

/**
 * Send verification email to user
 * @param email User's email address
 * @param verificationUrl URL for user to verify their email
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string
) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Verify your Nexodus email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Nexodus</h2>
          <p>Please verify your email address to get started.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
            Verify Email
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            If you didn't create this account, you can ignore this email.
          </p>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
}

/**
 * Send password reset email to user
 * @param email User's email address
 * @param resetUrl URL for user to reset their password
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Reset your Nexodus password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This link will expire in 1 hour.
          </p>
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, you can ignore this email.
          </p>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

/**
 * Send welcome email to new user
 * @param email User's email address
 * @param username User's username
 */
export async function sendWelcomeEmail(email: string, username: string) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to Nexodus!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${username}!</h2>
          <p>You're now part of the Nexodus collective. Start creating trackers and expanding your impact.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://nexodus.dev"}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px;">
            Open Nexodus
          </a>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Happy creating!
          </p>
        </div>
      `,
    });
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}
