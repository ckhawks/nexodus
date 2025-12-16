"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import styles from "./ThemeSwitcher.module.scss";

export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeSwitcher}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className={styles.icon} />
      ) : (
        <Sun className={styles.icon} />
      )}
    </button>
  );
}
