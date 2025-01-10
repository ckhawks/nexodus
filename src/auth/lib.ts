"use server";

import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { db } from "@/util/db/db";
const bcrypt = require("bcrypt");

// const query = 'SELECT * FROM "Tracker" WHERE userid = $1';
//   const params = [userId];
//   const { rows: trackers } = await db(query, params);

// THANKS TO https://github.com/balazsorban44/auth-poc-next/blob/main/lib.ts

const secretKey = process.env.JWT_SECRET; // change to use env variable
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
  // VALIDATE THE DATA CAME IN CORRECTLY IN FORMATS
  if (formData.get("username") == "") {
    return { message: "Please provide a username." };
  }

  if (formData.get("email") == "") {
    return { message: "Please provide an email." };
  }

  if (
    formData.get("password") == "" ||
    (formData.get("password") as string).length < 8
  ) {
    return {
      message: "Please provide a password that is at least 8 characters long.",
    };
  }

  // verify email aren't taken
  const query = 'SELECT * FROM "User" WHERE email = $1';
  const params = [formData.get("email")];
  const usersWithEmail = await db(query, params);

  if (usersWithEmail.length > 0) {
    return { message: "An account already exists with this email address." };
  }

  // verify usenrame aren't taken
  const query2 = 'SELECT * FROM "User" WHERE LOWER(username) = LOWER($1)';
  const params2 = [formData.get("username")];
  const usersWithUsername = await db(query2, params2);

  if (usersWithUsername.length > 0) {
    return { message: "An account already exists with this username." };
  }

  // store user in DB
  const query3 =
    'INSERT INTO "User" ("username", "email", "password") VALUES ($1, $2, $3)';
  const params3 = [
    formData.get("username"),
    formData.get("email"),
    await hash_password(formData.get("password")?.toString() || ""),
  ];
  const userCreated = await db(query3, params3); // this returns nothing []

  // get user info from database by email/password
  const query4 = `SELECT * FROM "User" WHERE username = $1`;
  const params4 = [formData.get("username")];
  const usersFromCreated = await db(query4, params4);

  if (usersFromCreated.length != 1) {
    return {
      message: "Error finding the user that was just created. Report Bad",
    };
  }

  const user = usersFromCreated[0];
  delete user["password"];

  // Create the session
  const expires = new Date(Date.now() + 2400 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
  redirect("/");
}

export async function login(prevState: any, formData: FormData) {
  // Verify credentials && get the user
  if (formData.get("email") == "") {
    return { message: "Please provide an email to login." };
  }

  if (
    formData.get("password") == "" ||
    (formData.get("password") as string).length < 8
  ) {
    return {
      message:
        "Please provide a password of at least 8 characters in length to login.",
    };
  }

  // validate credentials
  const query =
    'SELECT id, email, username, password FROM "User" WHERE email = $1';
  const params = [formData.get("email")];
  const users = await db(query, params);

  if (users.length == 0) {
    return {
      message:
        "We were unable to log you in with the provided information. Please check your username and password, and try again.",
    };
  }

  if (users.length > 1) {
    return {
      message:
        "Somehow, we found multiple users with that email. That was not supposed to happen man. Report this to the developers pronto!",
    };
  }

  const user = users[0]; // get user info from database by email/password

  let password_valid = await check_password(
    formData.get("password")?.toString() || "",
    user.password
  );
  if (!password_valid) {
    return {
      message:
        "We were unable to log you in with the provided information. Please check your username and password, and try again.",
    };
  }

  delete user["password"]; // strip the password off the object

  // Create the session
  const expires = new Date(Date.now() + 2400 * 1000);
  const session = await encrypt({ user, expires });

  // Save the session in a cookie
  cookies().set("session", session, { expires, httpOnly: true });
  redirect("/");
}

export async function logout() {
  // Destroy the session
  cookies().set("session", "", { expires: new Date(0) });
  redirect("/login");
}

export async function getSession() {
  const session = cookies().get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 2400 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}
