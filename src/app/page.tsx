import styles from "./page.module.scss";
import Link from "next/link";

import { getSession } from "@/auth/lib";
import ProfileButton from "@/components/ProfileButton";
import ResourcesSection from "@/components/ResourcesSection";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default async function Home() {
  const session = await getSession();

  if (session) {
    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div className={styles.description}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "32px",
              }}
            >
              <div style={{ flex: 1 }}>
                <h1>Nexodus</h1>
                <p className={styles.subtext}>
                  Welcome back,
                  <span className={styles.username}>
                    {" "}
                    {session.user.username}
                  </span>
                  .
                </p>
              </div>
              <div
                style={{
                  flex: "0 0 auto",
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <ThemeSwitcher />
                <ProfileButton username={session.user.username} />
              </div>
            </div>

            <ResourcesSection />
          </div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.wrapper}>
        <main className={`${styles.main} ${styles.narrow}`}>
          <div className={styles.description}>
            <Link href="/">
              <h1>Nexodus</h1>
              <br />
            </Link>
          </div>

          <section>
            Nexodus is an interactive website designed as a minimalist digital
            world where players gather, craft, and trade resources while shaping
            their unique virtual experience. Inspired by a mix of idle games,
            social games, and sandbox elements, Nexodus blends clean, modern UX
            design with light game mechanics to create a casually immersive
            environment.
            <br />
            <br />
            <Link href="/register" className={styles["button"]}>
              Register
            </Link>
            <Link
              style={{ marginTop: "8px" }}
              href="/login"
              className={`${styles["button"]} ${styles["button-secondary"]}`}
            >
              Login
            </Link>
          </section>
        </main>
      </div>
    );
  }
}
