"use client";

import { useState, useEffect } from "react";
import { getBuildingsForUser } from "@/actions/buildings";
import BuildingCard from "./BuildingCard";
import styles from "./BuildingsInventory.module.scss";

type Building = {
  id: string;
  last_collection_at: Date;
  buildingType: {
    id: string;
    name: string;
    display_name: string;
    icon: string | null;
    tier: number;
    description: string | null;
  };
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

type BuildingsInventoryProps = {
  refreshTrigger?: number;
  onBuildingCollected?: () => void;
};

export default function BuildingsInventory({
  refreshTrigger,
  onBuildingCollected,
}: BuildingsInventoryProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  // Fetch buildings on mount and when refreshTrigger changes
  useEffect(() => {
    fetchBuildings();
  }, [refreshTrigger]);

  const fetchBuildings = async () => {
    try {
      const result = await getBuildingsForUser();
      if (result.success && result.buildings) {
        setBuildings(result.buildings);
        setHasData(true);
      } else {
        setBuildings([]);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuildingCollected = async () => {
    // Refetch to get updated production
    await fetchBuildings();
    if (onBuildingCollected) {
      onBuildingCollected();
    }
  };

  if (isLoading && !hasData) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>Loading buildings...</p>
        </div>
      </div>
    );
  }

  if (buildings.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p>No buildings yet. Purchase buildings to start production!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            id={building.id}
            buildingType={building.buildingType}
            production={building.production}
            lastCollectionAt={building.last_collection_at}
            onCollectComplete={handleBuildingCollected}
          />
        ))}
      </div>
    </div>
  );
}
