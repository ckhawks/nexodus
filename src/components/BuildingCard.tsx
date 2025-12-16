"use client";

import { useState, useEffect } from "react";
import { collectResources } from "@/actions/buildings";
import { harvestResources, getHarvesterCooldown } from "@/actions/resources";
import { Loader } from "lucide-react";
import * as LucideIcons from "lucide-react";
import styles from "./BuildingCard.module.scss";
import harvesterStyles from "./Harvester.module.scss";

type BuildingProduction = {
  resource_type_id: string;
  resourceType: {
    id: string;
    name: string;
    display_name: string;
    icon: string | null;
  };
  rate_per_minute: number;
  storage_capacity: number;
};

type BuildingCardProps = {
  id: string;
  buildingType: {
    display_name: string;
    icon: string | null;
    tier: number;
    description: string | null;
    name: string;
  };
  production: BuildingProduction[];
  lastCollectionAt: Date;
  onCollectComplete?: () => void;
};

const getIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const Icon = (LucideIcons as any)[iconName];
  return Icon ? <Icon /> : null;
};

const DISPENSING_DURATION = 5000;

export default function BuildingCard({
  id,
  buildingType,
  production,
  lastCollectionAt,
  onCollectComplete,
}: BuildingCardProps) {
  // Check if this is the Resource Dispenser
  const isDispenser = buildingType.name === "resource_dispenser";

  // Dispenser state
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensingProgress, setDispensingProgress] = useState(0);
  const [inCooldown, setInCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [message, setMessage] = useState("");

  // Passive producer state
  const [isCollecting, setIsCollecting] = useState(false);
  const [production_state, setProductionState] = useState<
    Array<BuildingProduction & { produced: number }>
  >([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Dispenser: Check cooldown on mount
  useEffect(() => {
    if (!isDispenser) return;
    checkCooldown();
  }, [isDispenser]);

  // Dispenser: Progress animation
  useEffect(() => {
    if (!isDispenser || !isDispensing) return;

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
  }, [isDispensing, isDispenser]);

  // Dispenser: Cooldown countdown
  useEffect(() => {
    if (!isDispenser || cooldownSeconds <= 0) return;

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
  }, [cooldownSeconds, isDispenser]);

  // Passive producer: Calculate production
  useEffect(() => {
    if (isDispenser) return;

    const calculateProduction = () => {
      const minutesElapsed =
        (Date.now() - new Date(lastCollectionAt).getTime()) / (1000 * 60);

      const updated = production.map((prod) => ({
        ...prod,
        produced: Math.min(
          minutesElapsed * prod.rate_per_minute,
          prod.storage_capacity
        ),
      }));

      setProductionState(updated);
    };

    calculateProduction();
    const interval = setInterval(calculateProduction, 5000);

    return () => clearInterval(interval);
  }, [isDispenser, lastCollectionAt, production]);

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

        if (onCollectComplete) {
          onCollectComplete();
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

  const handleCollect = async () => {
    if (isCollecting) return;

    setIsCollecting(true);
    setMessage("");

    const result = await collectResources(id);

    if (result.success) {
      setMessage("Resources collected!");
      setProductionState(
        production.map((prod) => ({
          ...prod,
          produced: 0,
        }))
      );

      if (onCollectComplete) {
        onCollectComplete();
      }
    } else {
      setMessage(result.message || "Failed to collect resources");
    }

    setIsCollecting(false);
  };

  const canCollect = production_state.some((prod) => prod.produced >= 1);

  // Render Resource Dispenser with harvester UI
  if (isDispenser) {
    return (
      <div className={harvesterStyles.dispenser}>
        <div className={harvesterStyles.header}>
          <div className={harvesterStyles.iconWrapper}>
            <div>{getIcon(buildingType.icon)}</div>
          </div>
          <div>
            <h3 className={harvesterStyles.title}>
              {buildingType.display_name}
            </h3>
            <p className={harvesterStyles.subtitle}>Starter resources</p>
          </div>
        </div>

        <button
          onClick={handleDispense}
          disabled={isDispensing || inCooldown}
          className={`${harvesterStyles.dispenseButton} ${
            isDispensing ? harvesterStyles.dispensing : ""
          } ${inCooldown ? harvesterStyles.disabled : ""}`}
        >
          {isDispensing ? (
            <span className={harvesterStyles.buttonContent}>
              <Loader className={harvesterStyles.spinnerIcon} />
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
            className={`${harvesterStyles.message} ${
              message.includes("!")
                ? harvesterStyles.success
                : harvesterStyles.info
            }`}
          >
            {message}
          </div>
        )}
      </div>
    );
  }

  // Render passive producer buildings
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{getIcon(buildingType.icon)}</div>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{buildingType.display_name}</h3>
            <span
              className={`${styles.tier} ${styles[`tier${buildingType.tier}`]}`}
            >
              Tier {buildingType.tier}
            </span>
          </div>
          {buildingType.description && (
            <p className={styles.description}>{buildingType.description}</p>
          )}
        </div>
      </div>

      <div className={styles.productionList}>
        <div className={styles.processingIndicator}>
          <Loader className={styles.processingSpinner} />
          <p className={styles.processingText}>Processing...</p>
        </div>

        {production_state.map((prod) => (
          <div key={prod.resource_type_id} className={styles.productionItem}>
            <div className={styles.resourceHeader}>
              <div className={styles.resourceInfo}>
                <div className={styles.resourceIcon}>
                  {getIcon(prod.resourceType.icon)}
                </div>
                <div className={styles.resourceDetails}>
                  <p className={styles.resourceName}>
                    {prod.resourceType.display_name}
                  </p>
                </div>
              </div>
              <p className={styles.storageAmount}>
                {Math.floor(prod.produced)} / {prod.storage_capacity}
              </p>
            </div>
            <div className={styles.storageBar}>
              <div
                className={styles.storageFill}
                style={{
                  width: `${(prod.produced / prod.storage_capacity) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.detailsToggle}
      >
        <span>{isExpanded ? "Hide" : "Show"} Production Details</span>
      </button>

      {isExpanded && (
        <div className={styles.detailsSection}>
          {production_state.map((prod) => (
            <div
              key={`details-${prod.resource_type_id}`}
              className={styles.detailRow}
            >
              <div className={styles.detailLabel}>
                {prod.resourceType.display_name} Rate:
              </div>
              <div className={styles.detailValue}>
                {prod.rate_per_minute}/min
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleCollect}
        disabled={isCollecting || !canCollect}
        className={`${styles.collectButton} ${
          isCollecting ? styles.collecting : ""
        } ${!canCollect ? styles.disabled : ""}`}
      >
        {isCollecting ? (
          <span className={styles.buttonContent}>
            <Loader className={styles.spinnerIcon} />
            Collecting...
          </span>
        ) : canCollect ? (
          "Collect Resources"
        ) : (
          "Still generating..."
        )}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            message.includes("collected") ? styles.success : styles.error
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
