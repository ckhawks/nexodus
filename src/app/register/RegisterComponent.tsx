"use client";

import { register } from "@/auth/lib";
import { useActionState } from "react";

import styles from "./RegisterComponent.module.scss";
import pageStyles from "../page.module.scss";

const initialState = {
  message: "",
};

export default function RegisterComponent() {
  const [state, registerAction] = useActionState(register, initialState);

  return (
    <form action={registerAction}>
      {state?.message && (
        <div aria-live="polite" className={styles.error}>
          {state?.message}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          className={styles.input}
          required
        />
      </div>

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
        Register
      </button>
    </form>
  );
}
