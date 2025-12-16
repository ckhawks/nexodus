"use server";

import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import * as bcrypt from "bcrypt";

import {
  getUserByEmail,
  userExistsByEmail,
  userExistsByUsername,
  createUser,
} from "@/db/queries";

// Validation constraints
const PASSWORD_MIN_LENGTH = 8;
const SESSION_DURATION_MS = 86400000; // 24 hours

const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  throw new Error("JWT_SECRET environment variable is not set");
}
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24 hours from now")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

// https://stackoverflow.com/a/17201754
async function hash_password(input: string): Promise<any> {
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(input, salt);

  // Store hash in your password DB.
  return hash;
}

async function check_password(input: string, hash: string): Promise<any> {
  // Load hash from your password DB.
  return bcrypt.compareSync(input, hash); // true
}

export async function register(prevState: any, formData: FormData) {
  try {
    // VALIDATE THE DATA CAME IN CORRECTLY IN FORMATS
    const username = formData.get("username")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    if (username === "") {
      return { message: "Please provide a username." };
    }

    if (email === "") {
      return { message: "Please provide an email." };
    }

    if (password === "" || password.length < PASSWORD_MIN_LENGTH) {
      return {
        message: `Please provide a password that is at least ${PASSWORD_MIN_LENGTH} characters long.`,
      };
    }

    // verify email isn't taken
    if (await userExistsByEmail(email)) {
      return { message: "An account already exists with this email address." };
    }

    // verify username isn't taken
    if (await userExistsByUsername(username)) {
      return { message: "An account already exists with this username." };
    }

    // Hash password and create user
    const hashedPassword = await hash_password(password);
    const user = await createUser(username, email, hashedPassword);

    if (!user) {
      return {
        message: "Error creating user. Please try again.",
      };
    }

    // Remove password from user object before session
    const { password: _, ...userWithoutPassword } = user;

    // Create the session
    const expires = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await encrypt({ user: userWithoutPassword, expires });

    // Save the session in a cookie
    (await cookies()).set("session", session, { expires, httpOnly: true });
    redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    return { message: "An error occurred during registration. Please try again." };
  }
}

export async function login(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

    // Validate input
    if (email === "") {
      return { message: "Please provide an email to login." };
    }

    if (password === "" || password.length < PASSWORD_MIN_LENGTH) {
      return {
        message: `Please provide a password of at least ${PASSWORD_MIN_LENGTH} characters in length to login.`,
      };
    }

    // Get user by email
    const user = await getUserByEmail(email);

    if (!user) {
      return {
        message:
          "We were unable to log you in with the provided information. Please check your username and password, and try again.",
      };
    }

    // Verify password
    const passwordValid = await check_password(password, user.password);
    if (!passwordValid) {
      return {
        message:
          "We were unable to log you in with the provided information. Please check your username and password, and try again.",
      };
    }

    // Remove password from user object before session
    const { password: _, ...userWithoutPassword } = user;

    // Create the session
    const expires = new Date(Date.now() + SESSION_DURATION_MS);
    const session = await encrypt({ user: userWithoutPassword, expires });

    // Save the session in a cookie
    (await cookies()).set("session", session, { expires, httpOnly: true });
    redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    return { message: "An error occurred during login. Please try again." };
  }
}

export async function logout() {
  // Destroy the session
  (await cookies()).set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function getSession() {
  try {
    const session = (await cookies()).get("session")?.value;
    if (!session) return null;

    const decrypted = await decrypt(session);

    // Verify user still exists in database
    if (decrypted?.user?.id) {
      const userExists = await getUserByEmail(decrypted.user.email);
      if (!userExists) {
        // User was deleted, clear the session
        (await cookies()).set("session", "", { expires: new Date(0) });
        return null;
      }
    }

    return decrypted;
  } catch (error) {
    console.error("Session decryption error:", error);
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + SESSION_DURATION_MS);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
