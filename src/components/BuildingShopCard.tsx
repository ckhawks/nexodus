"use client";

import { useState } from "react";
import { purchaseBuilding } from "@/actions/buildings";
import { Loader } from "lucide-react";
import * as LucideIcons from "lucide-react";
import styles from "./BuildingShopCard.module.scss";

const getIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const Icon = (LucideIcons as any)[iconName];
  return Icon ? <Icon /> : null;
};

type BuildingCost = {
  resource_type_id: string;
  resourceType: {
    id: string;
    name: string;
    display_name: string;
    icon: string | null;
  };
  quantity: number;
};

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

type BuildingShopCardProps = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  tier: number;
  costs: BuildingCost[];
  production: BuildingProduction[];
  userInventory: Record<string, number>;
  isAlreadyOwned: boolean;
  onPurchaseComplete?: () => void;
};

export default function BuildingShopCard({
  id,
  display_name,
  description,
  icon,
  tier,
  costs,
  production,
  userInventory,
  isAlreadyOwned,
  onPurchaseComplete,
}: BuildingShopCardProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [message, setMessage] = useState("");

  // Check if user can afford this building
  const isFree = costs.length === 0;
  const canAfford =
    !isAlreadyOwned &&
    (isFree ||
      costs.every((cost) => {
        const userQuantity = userInventory[cost.resource_type_id] || 0;
        return userQuantity >= cost.quantity;
      }));

  const handlePurchase = async () => {
    if (isPurchasing || !canAfford || isAlreadyOwned) return;

    setIsPurchasing(true);
    setMessage("");

    const result = await purchaseBuilding(id);

    if (result.success) {
      setMessage(result.message || "Building purchased!");
      if (onPurchaseComplete) {
        onPurchaseComplete();
      }
    } else {
      setMessage(result.message || "Failed to purchase building");
    }

    setIsPurchasing(false);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          {getIcon(icon)}
        </div>
        <div className={styles.headerContent}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{display_name}</h3>
            <span className={`${styles.tier} ${styles[`tier${tier}`]}`}>
              Tier {tier}
            </span>
          </div>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      </div>

      {/* Production Info */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Produces</h4>
        <div className={styles.productionList}>
          {production.map((prod) => (
            <div key={prod.resource_type_id} className={styles.productionItem}>
              <div className={styles.productionItemContent}>
                <div className={styles.resourceIcon}>
                  {getIcon(prod.resourceType.icon)}
                </div>
                <div className={styles.productionDetails}>
                  <p className={styles.resourceName}>
                    {prod.resourceType.display_name}
                  </p>
                  <p className={styles.rate}>
                    {prod.rate_per_minute}/min (cap: {prod.storage_capacity})
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Info */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Costs</h4>
        <div className={styles.costList}>
          {costs.length === 0 ? (
            <p className={styles.free}>FREE</p>
          ) : (
            costs.map((cost) => {
              const userQuantity = userInventory[cost.resource_type_id] || 0;
              const hasEnough = userQuantity >= cost.quantity;

              return (
                <div
                  key={cost.resource_type_id}
                  className={`${styles.costItem} ${
                    !hasEnough ? styles.insufficient : ""
                  }`}
                >
                  <div className={styles.costItemContent}>
                    <div className={styles.resourceIcon}>
                      {getIcon(cost.resourceType.icon)}
                    </div>
                    <div className={styles.resourceDetails}>
                      <p className={styles.resourceName}>
                        {cost.resourceType.display_name}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`${styles.quantity} ${
                      !hasEnough ? styles.insufficient : ""
                    }`}
                  >
                    {userQuantity} / {cost.quantity}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <button
        onClick={handlePurchase}
        disabled={isPurchasing || !canAfford || isAlreadyOwned}
        className={`${styles.purchaseButton} ${
          isPurchasing ? styles.purchasing : ""
        } ${!canAfford || isAlreadyOwned ? styles.disabled : ""}`}
      >
        {isPurchasing ? (
          <span className={styles.buttonContent}>
            <Loader className={styles.spinnerIcon} />
            Purchasing...
          </span>
        ) : isAlreadyOwned ? (
          "Already Owned"
        ) : canAfford ? (
          "Purchase"
        ) : (
          "Insufficient Resources"
        )}
      </button>

      {message && (
        <div
          className={`${styles.message} ${
            message.includes("purchased") ? styles.success : styles.error
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
