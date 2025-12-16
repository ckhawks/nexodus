"use client";

import styles from "./ProfileButton.module.scss";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, User, LogOut } from "lucide-react";

const ProfileButton = (props: { username: string }) => {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleProfileClick = () => {
    setShow(!show);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setShow(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!show) return;

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [show]);

  return (
    <div ref={ref} className={styles.profileWrapper}>
      <button onClick={handleProfileClick} className={styles.profileButton}>
        {show ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <User size={16} />
        <span>{props.username}</span>
      </button>

      {show && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            <Link href="/api/logout" className={styles.dropdownLink}>
              <LogOut size={16} /> Logout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
