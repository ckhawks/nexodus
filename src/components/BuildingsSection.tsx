"use client";

import { useState, useEffect } from "react";
import { getResourcesForUser } from "@/actions/resources";
import { getBuildingsForUser } from "@/actions/buildings";
import { useInventory } from "@/context/InventoryContext";
import BuildingsInventory from "./BuildingsInventory";
import BuildingsShop from "./BuildingsShop";
import styles from "./BuildingsSection.module.scss";

type UserInventory = Record<string, number>;

export default function BuildingsSection() {
  const { refreshTrigger, triggerRefresh } = useInventory();
  const [activeTab, setActiveTab] = useState<"inventory" | "shop">("inventory");
  const [userInventory, setUserInventory] = useState<UserInventory>({});
  const [ownedBuildingIds, setOwnedBuildingIds] = useState<Set<string>>(new Set());
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);

  // Fetch user inventory on mount and when global refreshTrigger changes
  useEffect(() => {
    fetchUserInventory();
  }, [refreshTrigger]);

  const fetchUserInventory = async () => {
    try {
      setIsLoadingInventory(true);
      const [resourcesResult, buildingsResult] = await Promise.all([
        getResourcesForUser(),
        getBuildingsForUser(),
      ]);

      if (resourcesResult.success && resourcesResult.resources) {
        // Convert resources array to object indexed by resource_type_id
        const inventoryMap: UserInventory = {};
        resourcesResult.resources.forEach((resource) => {
          inventoryMap[resource.resource.id] = resource.quantity;
        });
        setUserInventory(inventoryMap);
      }

      if (buildingsResult.success && buildingsResult.buildings) {
        // Extract building type IDs to track ownership
        const ownedIds = new Set(
          buildingsResult.buildings.map((b) => b.buildingType.id)
        );
        setOwnedBuildingIds(ownedIds);
      }
    } catch (error) {
      console.error("Error fetching user inventory:", error);
    } finally {
      setIsLoadingInventory(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Buildings</h2>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "inventory" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("inventory")}
          >
            My Buildings
          </button>
          <button
            className={`${styles.tab} ${activeTab === "shop" ? styles.active : ""}`}
            onClick={() => setActiveTab("shop")}
          >
            Shop
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === "inventory" && (
          <BuildingsInventory
            refreshTrigger={refreshTrigger}
            onBuildingCollected={triggerRefresh}
          />
        )}
        {activeTab === "shop" && (
          <BuildingsShop
            userInventory={userInventory}
            ownedBuildingIds={ownedBuildingIds}
            refreshTrigger={refreshTrigger}
            onPurchaseComplete={triggerRefresh}
          />
        )}
      </div>
    </section>
  );
}
