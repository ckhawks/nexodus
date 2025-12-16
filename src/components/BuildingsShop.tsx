"use client";

import { useState, useEffect } from "react";
import { getBuildingTypes } from "@/actions/buildings";
import BuildingShopCard from "./BuildingShopCard";
import styles from "./BuildingsShop.module.scss";

type BuildingType = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  tier: number;
  created_at: Date;
  costs: Array<{
    resource_type_id: string;
    resourceType: {
      id: string;
      name: string;
      display_name: string;
      icon: string | null;
    };
    quantity: number;
  }>;
  production: Array<{
    resource_type_id: string;
    resourceType: {
      id: string;
      name: string;
      display_name: string;
      icon: string | null;
    };
    rate_per_minute: number;
    storage_capacity: number;
  }>;
};

type BuildingsShopProps = {
  userInventory: Record<string, number>;
  ownedBuildingIds: Set<string>;
  refreshTrigger?: number;
  onPurchaseComplete?: () => void;
};

export default function BuildingsShop({
  userInventory,
  ownedBuildingIds,
  refreshTrigger,
  onPurchaseComplete,
}: BuildingsShopProps) {
  const [buildingTypes, setBuildingTypes] = useState<BuildingType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available buildings on mount and when refreshTrigger changes
  useEffect(() => {
    fetchBuildingTypes();
  }, [refreshTrigger]);

  const fetchBuildingTypes = async () => {
    try {
      const result = await getBuildingTypes();
      if (result.success && result.buildingTypes) {
        setBuildingTypes(result.buildingTypes);
      } else {
        setBuildingTypes([]);
      }
    } catch (error) {
      console.error("Error fetching building types:", error);
      setBuildingTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <p>Loading available buildings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {buildingTypes.map((buildingType) => (
          <BuildingShopCard
            key={buildingType.id}
            id={buildingType.id}
            name={buildingType.name}
            display_name={buildingType.display_name}
            description={buildingType.description}
            icon={buildingType.icon}
            tier={buildingType.tier}
            costs={buildingType.costs}
            production={buildingType.production}
            userInventory={userInventory}
            isAlreadyOwned={ownedBuildingIds.has(buildingType.id)}
            onPurchaseComplete={onPurchaseComplete}
          />
        ))}
      </div>
    </div>
  );
}
