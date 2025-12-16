"use client";

import { useState, useEffect } from "react";
import { harvestResources, getHarvesterCooldown } from "@/actions/resources";
import { Loader, Zap } from "lucide-react";
import styles from "./Harvester.module.scss";

type ResourceDispenserProps = {
  onHarvestComplete?: () => void;
};

const DISPENSING_DURATION = 5000;

export default function ResourceDispenser({
  onHarvestComplete,
}: ResourceDispenserProps) {
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensingProgress, setDispensingProgress] = useState(0);
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkCooldown();
  }, []);

  useEffect(() => {
    if (!isDispensing) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / DISPENSING_DURATION, 1);
      setDispensingProgress(progress);

      if (elapsed >= DISPENSING_DURATION) {
        clearInterval(interval);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isDispensing]);

  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds((prev) => {
          const newValue = prev - 1;
          if (newValue === 0) {
            setInCooldown(false);
            setMessage("");
          }
          return newValue;
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const checkCooldown = async () => {
    const result = await getHarvesterCooldown();
    if (result.success && !result.isReady) {
      setInCooldown(true);
      setCooldownSeconds(result.remainingSeconds);
      setMessage("Dispenser cooling down...");
    }
  };

  const handleDispense = async () => {
    if (isDispensing || inCooldown) return;

    setIsDispensing(true);
    setDispensingProgress(0);

    setTimeout(async () => {
      const result = await harvestResources();

      if (result.success) {
        setMessage(result.message);
        setInCooldown(true);
        setCooldownSeconds(5);

        if (onHarvestComplete) {
          onHarvestComplete();
        }
      } else {
        setMessage(result.message);
        if (result.cooldownRemaining) {
          setCooldownSeconds(result.cooldownRemaining);
          setInCooldown(true);
        }
      }

      setIsDispensing(false);
    }, DISPENSING_DURATION);
  };

  return (
    <div className={styles.dispenser}>
      <div className={styles.header}>
        <div className={`${styles.iconWrapper}`}>
          <Zap
            className={`${styles.icon} ${
              isDispensing ? styles.dispensingIcon : ""
            }`}
          />
        </div>
        <div>
          <h3 className={styles.title}>Resource Dispenser</h3>
          <p className={styles.subtitle}>Starter resources</p>
        </div>
      </div>

      <button
        onClick={handleDispense}
        disabled={isDispensing || inCooldown}
        className={`${styles.dispenseButton} ${
          isDispensing ? styles.dispensing : ""
        } ${inCooldown ? styles.disabled : ""}`}
      >
        {isDispensing ? (
          <span className={styles.buttonContent}>
            <Loader className={styles.spinnerIcon} />
            Selecting resources...
          </span>
        ) : inCooldown ? (
          <span>
            Ready in <strong>{cooldownSeconds}s</strong>
          </span>
        ) : (
          "Collect Resources"
        )}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            message.includes("!") ? styles.success : styles.info
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
