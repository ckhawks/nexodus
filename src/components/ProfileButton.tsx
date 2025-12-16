"use client";

import styles from "@/app/page.module.scss";
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
    <div ref={ref} style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={handleProfileClick}
        className={`${styles.button} ${styles["button-secondary"]}`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
      >
        {show ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <User size={16} />
        <span style={{ color: "black", fontWeight: 500 }}>{props.username}</span>
      </button>

      {show && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            zIndex: 1000,
            minWidth: "150px",
          }}
        >
          <div style={{ padding: "8px 0" }}>
            <Link
              href="/api/logout"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                color: "black",
                textDecoration: "none",
                fontSize: "14px",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "#f0f0f0";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <LogOut size={16} /> Logout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;