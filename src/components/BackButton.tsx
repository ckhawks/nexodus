import styles from "./BackButton.module.scss";
import Link from "next/link";

const BackButton = (props: { to: string; text: string }) => {
  return (
    <Link href={props.to} className={styles.BackButton}>
      <span style={{ marginRight: "6px" }}>←</span>
      {props.text}
    </Link>
  );
};
export default BackButton;