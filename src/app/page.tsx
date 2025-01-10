import styles from "./page.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faHeart } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

import { getSession } from "@/auth/lib";
import { Col, Row } from "react-bootstrap";
import ProfileButton from "@/components/ProfileButton";
import { db } from "@/util/db/db";

export default async function Home() {
  const session = await getSession();

  if (session) {
    // const query = `
    //   SELECT
    //     t.*,
    //     COALESCE(SUM(pe.points), 0) as points
    //   FROM "Tracker" t
    //   LEFT JOIN "Progress" p
    //   ON p."trackerid" = t.id AND p."deletedat" is NULL
    //   LEFT JOIN (
    //     SELECT "progressid", points
    //     FROM "ProgressEvent"
    //     WHERE id IN (
    //       SELECT MAX(id)
    //       FROM "ProgressEvent"
    //       GROUP BY "progressid"
    //     )
    //   ) pe ON pe."progressid" = p.id
    //   WHERE t.userid = $1
    //   GROUP BY t."id"
    // `;
    // const params = [session.user.id];
    // const trackers = await db(query, params);

    return (
      <div className={styles.wrapper}>
        <main className={styles.main}>
          <div className={styles.description}>
            <Row style={{ alignItems: "center" }}>
              <Col>
                <h1>Nexodus</h1>
                <p className={styles.subtext}>
                  You are
                  <span style={{ color: "rgba(0,0,0,.8)", fontWeight: 600 }}>
                    {" "}
                    {session.user.username}
                  </span>
                  !
                </p>
              </Col>
              <Col xs={3}>
                <ProfileButton username={session.user.username} />
              </Col>
            </Row>
            ok lets go
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
