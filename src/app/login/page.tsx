"use server";

import styles from "../page.module.scss";
import { getSession, logout } from "@/auth/lib";
import LoginComponent from "./LoginComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
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
            <br />
          </Link>
        </div>

        <section>{!session && <LoginComponent />}</section>
      </main>
    </div>
  );
}
