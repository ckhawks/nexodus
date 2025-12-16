"use server";

import styles from "../page.module.scss";
import { getSession } from "@/auth/lib";
import RegisterComponent from "./RegisterComponent";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function RegisterPage() {
  const session = await getSession();
  // console.log("session", session);

  if (session) {
    redirect("/");
  }

  return (
    <div className={styles.wrapper}>
      <main className={`${styles.main} ${styles.narrow}`}>
        <div className={styles.description}>
          <Link href="/">
            <h1>Nexodus</h1>
          </Link>
          <p className={styles.blurb}>
            A minimalist resource management game. Gather, craft, trade, and
            specialize your way through an industrial future.
          </p>
        </div>

        <section>{!session && <RegisterComponent />}</section>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <Link href="/login" className={styles.linkText}>
            Already have an account? Login
          </Link>
        </div>
      </main>
    </div>
  );
}
