"use client";

import { login } from "@/auth/lib";
import { useActionState } from "react";

import styles from "./LoginComponent.module.scss";
import pageStyles from "../page.module.scss";

const initialState = {
  message: "",
};

export default function LoginComponent() {
  const [state, loginAction] = useActionState(login, initialState);

  return (
    <form action={loginAction}>
      {state?.message && (
        <div aria-live="polite" className={styles.error}>
          {state?.message}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          className={styles.input}
          required
        />
      </div>

      <button type="submit" className={pageStyles.button} style={{ width: "100%" }}>
        Login
      </button>
    </form>
  );
}
