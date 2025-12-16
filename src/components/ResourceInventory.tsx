"use client";

import { useEffect, useState } from "react";
import { getInventory } from "@/actions/resources";
import * as LucideIcons from "lucide-react";
import styles from "./ResourceInventory.module.scss";

type InventoryItem = {
  id: string;
  quantity: string;
  updated_at: Date;
  resource: {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    tier: number;
    icon: string | null;
  };
};

type ResourceInventoryProps = {
  refreshTrigger?: number;
};

export default function ResourceInventory({ refreshTrigger }: ResourceInventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    // Only show loading state on first load
    const isFirstLoad = inventory.length === 0;
    if (isFirstLoad) {
      setLoading(true);
    }

    const result = await getInventory();
    if (result.success && result.inventory) {
      setInventory(result.inventory as InventoryItem[]);
    }

    if (isFirstLoad) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = (LucideIcons as any)[iconName];
    return Icon ? <Icon className={styles.resourceIcon} /> : null;
  };

  if (loading) {
    return (
      <div className={styles.inventory}>
        <h3 className={styles.title}>Resources</h3>
        <p className={styles.loading}>Loading inventory...</p>
      </div>
    );
  }

  if (inventory.length === 0) {
    return (
      <div className={styles.inventory}>
        <h3 className={styles.title}>Resources</h3>
        <p className={styles.empty}>No resources yet. Use the Harvester to collect resources!</p>
      </div>
    );
  }

  return (
    <div className={styles.inventory}>
      <h3 className={styles.title}>Resources</h3>
      <div className={styles.grid}>
        {inventory.map((item) => (
          <div key={item.id} className={styles.resourceCard}>
            <div className={styles.resourceHeader}>
              <div className={styles.iconWrapper}>
                {getIcon(item.resource.icon)}
              </div>
              <div className={styles.resourceInfo}>
                <div className={styles.resourceName}>
                  {item.resource.display_name}
                </div>
                <div className={styles.tierBadge}>Tier {item.resource.tier}</div>
              </div>
            </div>
            <div className={styles.quantity}>
              {parseFloat(item.quantity).toLocaleString()}
            </div>
            {item.resource.description && (
              <div className={styles.description}>
                {item.resource.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
