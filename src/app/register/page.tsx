"use server";

import styles from "../page.module.scss";
import { getSession } from "@/auth/lib";
import RegisterComponent from "./RegisterComponent";
import { redirect } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
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
            <br />
          </Link>
        </div>

        <section>{!session && <RegisterComponent />}</section>
      </main>
    </div>
  );
}
