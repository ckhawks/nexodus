"use client";

import { register } from "@/auth/lib";
import { useActionState } from "react";

import styles from "../page.module.scss";
import Link from "next/link";

const initialState = {
  message: "",
};

export default function RegisterComponent() {
  const [state, registerAction] = useActionState(register, initialState);

  return (
    <form action={registerAction}>
      {state?.message && (
        <div
          aria-live="polite"
          style={{
            padding: "12px",
            marginBottom: "16px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c33",
            fontSize: "0.9rem",
          }}
        >
          {state?.message}
        </div>
      )}
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="username" style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="email" style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: "24px" }}>
        <label htmlFor="password" style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          style={{
            width: "100%",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div className={styles["login-buttons"]}>
        <Link
          href="/login"
          className={`${styles["button"]} ${styles["button-secondary"]}`}
        >
          Login
        </Link>
        <button type="submit" className={styles["button"]}>
          Register
        </button>
      </div>
    </form>
  );
}
