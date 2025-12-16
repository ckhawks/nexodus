"use client";

import { useState } from "react";
import ResourceDispenser from "./Harvester";
import ResourceInventory from "./ResourceInventory";

export default function ResourcesSection() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDispenseComplete = () => {
    // Trigger inventory refresh by updating the state
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <ResourceDispenser onHarvestComplete={handleDispenseComplete} />
      <ResourceInventory refreshTrigger={refreshTrigger} />
    </>
  );
}
