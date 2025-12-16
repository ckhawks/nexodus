"use client";

import { useInventory } from "@/context/InventoryContext";
import ResourceDispenser from "./Harvester";
import ResourceInventory from "./ResourceInventory";

export default function ResourcesSection() {
  const { refreshTrigger, triggerRefresh } = useInventory();

  return (
    <>
      {/* <ResourceDispenser onHarvestComplete={triggerRefresh} /> */}
      <ResourceInventory refreshTrigger={refreshTrigger} />
    </>
  );
}
