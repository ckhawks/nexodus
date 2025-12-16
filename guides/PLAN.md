Below is a **clean, self‑contained project brief** you can hand to another LLM.  
It intentionally **excludes tech‑stack decision debates** and focuses on **game design, systems, scope, and implementation plan**.

---

# Nexodus – Project Summary & Plan

## 1. High‑Level Concept

**Nexodus** is a minimalist, text‑driven web game centered on **resource production, buildings, specialization, and trading**.  
It is designed as a **slow‑burn systems game**, not a visual world or combat game.

Core themes:

- Futuristic collective society
- Industrial production chains
- Meaningful player choices
- Social interaction via economic interdependence
- No exploitative monetization
- Professional, clean UI with subtle flavor text

---

## 2. Core Gameplay Loop (Current Focus)

```
Generate resources
→ Process/refine them via buildings
→ Choose which production chains to focus on
→ Trade surplus with other players (or NPC market)
→ Upgrade buildings and unlock new production
→ Gradually expand specialization and capacity
```

**No combat, expeditions, or items initially.**  
The game should be fun and complete with **just resources + buildings + constraints + trading**.

---

## 3. Resources

### Existing Resource Genres

All resources are **physical, real “things”** (not abstract concepts).

**Core genres:**

- **Metal / Mineral** – stone, steel, titanium, alloys
- **Bio / Organic** – timber, cloth, fibers, synthweave
- **Energy / Fuel** – raw fuel, fluxfuel, energy cores
- **Data (physical interpretation)** – data fragments, encrypted shards (treated as stored information/media)

### Resource Structure

- Tiered progression (Tier 1 → Tier 5)
- Higher tiers require refinement from lower tiers
- No “between‑tier” filler resources
- Late‑game resources act as bottlenecks and trade drivers

### Possible Future Genre (Optional, Later)

- **Rare Earths / Electronics**
- **Synthetic Chemicals (late‑game, exotic, universal bottleneck)**

These are **not required for MVP**.

---

## 4. Buildings

### Building Categories

**1. Primary Production**

- Resource Generator (baseline multi‑resource)
- Stone Quarry
- (Later: Timber Mill, Fuel Harvester, Data Center, etc.)

**2. Refinement / Processing**

- Workshop (Tier 1 → Tier 2)
- Gas Refinery (Fuel → Fluxfuel)
- Data Forge (Tier 2 → Tier 3)
- Fabrication Chamber (complex recipes)
- Quantum Forge (endgame)

**3. Utility / Infrastructure**

- Warehouse (storage expansion – optional early)
- Research Lab (unlock buildings/tiers)
- Automation/QoL buildings (later)

**4. Specialization‑Exclusive Buildings**

- Unlocked by specialization choice
- Strong bonuses to specific production chains

---

## 5. Specialization System

### Design Goals

- Force **economic asymmetry**
- Encourage **trading**
- Avoid permanent punishment
- Allow slow adaptation over time

### How It Works

- Player unlocks **specialization slots** over time
- Each slot can be assigned to a resource focus

Example specializations:

- Metal
- Energy
- Data
- Bio

**Bonuses:**

- +X% production in specialization
- Reduced costs for related buildings
- Unlock exclusive buildings

### Progression

- Start with 1 specialization slot
- Unlock additional slots at higher levels
- Eventually semi‑self‑sufficient, but never perfect at everything

Respec is allowed but **intentionally slow or costly**.

---

## 6. Building Constraints (Very Important)

### Problem to Solve

Players should **not be able to do everything at once**, but also should not feel permanently locked.

### Strong Candidate Solution: **Focus System**

- Players can **build many buildings**
- Only a limited number of buildings can be **“Focused”**
- Focused buildings run at **100% efficiency**
- Unfocused buildings run at **reduced efficiency (e.g. 30–50%)**
- Focus slots unlock slowly as the player progresses
- Changing focus is allowed, but not constantly (cooldown or cost)

**Why this works:**

- No arbitrary swap timers
- No new resource system (like power)
- Flexible but still strategic
- Encourages specialization and planning
- Easy to communicate in UI

This replaces:

- Hard building slot limits
- Electricity/power systems
- Maintenance taxes
- Arbitrary swap cooldowns

---

## 7. Trading & Economy

### Early Phase

- **NPC Market** with dynamic prices
- Acts as a baseline for resource value
- Works with low player population

### Player Trading (Later)

- Barter board or market listings
- Player deals can beat NPC prices
- Encourages specialization interaction

### Key Economic Principles

- Players should _need_ others’ resources
- Scarcity comes from:
  - Specialization bonuses
  - Focus limits
  - High‑tier refinement bottlenecks
- Trading is a **solution**, not optional flavor

---

## 8. Time & Production Model

### Critical Rule

**No ticking loops. No cron‑based resource generation.**

### Correct Model

- Store `lastCollectedAt`
- Calculate production as:
  ```
  produced = rate × timeElapsed
  ```
- Apply production on interaction (collect, view, trade, etc.)
- Works offline
- Scales infinitely

---

## 9. UI / Player Interaction Model

### Core Screens

**Dashboard**

- Resource overview
- Generation rates
- Focused buildings
- Alerts (full storage, ready to collect)

**Buildings**

- View all buildings
- Focus/unfocus toggle
- Upgrade buildings
- See production breakdown

**Build New**

- Tiered building list
- Clear lock states (requirements vs affordability)
- Specialization‑exclusive section

**Resources**

- Full inventory
- Per‑resource info (sources, uses)
- Trade entry points

**Trading**

- NPC market prices
- Buy/sell interface
- Later: player trades

**Profile**

- Level
- Specializations
- Lifetime stats

### UX Principles

- Minimalist black/white
- Clear information hierarchy
- No spatial world map
- Text + icons + numbers
- Mobile‑friendly cards

---

## 10. Development Phases (Recommended)

### Phase 1 – Core Proof

- Accounts
- Tier 1 resources
- Resource Generator
- Workshop
- Resource delta system
- Simple UI dashboard

### Phase 2 – Depth

- Multiple buildings
- Tier 2–3 resources
- Building upgrades
- Research Lab
- Specialization system
- NPC trading

### Phase 3 – Strategy

- Focus system
- Specialization‑exclusive buildings
- More complex production chains
- Economy balancing

### Phase 4 – Social Expansion (Later)

- Player trading
- Global challenges
- Alliances
- Companions, items, cosmetics (optional)

---

## 11. Explicit Non‑Goals (For Now)

- Combat
- Expeditions
- Prestige resets
- Abstract/meta resources
- Territory control
- PvP
- Heavy narrative

These can be layered **later**, not early.

---

## 12. Design North Stars

- Systems over spectacle
- Scarcity through choice, not punishment
- Flexibility without chaos
- Social interaction via economics
- Respect player time
- Avoid feature bloat early

---

If you pass this to another LLM, it should be able to:

- Understand the game clearly
- Propose systems without breaking scope
- Help design schemas, mechanics, or UI
- Continue iteration without re‑debating fundamentals

# Resources & Buildings

### **Resources and Tiers**

The game features a tiered resource system, with resources organized by progression:

**Tier 1: Foundational Resources**

- **Stone**: Core material for construction.
- **Timber**: Basic wood for building and crafting.
- **Scrap Metal**: Scavenged material for tools and repairs.
- **Cloth**: Lightweight material for crafting simple items.
- **Raw Fuel**: A liquid/gaseous energy source for powering early buildings.
- **Data Fragments**: Research material for unlocking blueprints.

**Tier 2: Refined Resources**

- **Reinforced Concrete**: Processed from Stone for durable structures.
- **Lumber**: Refined Timber for intermediate construction.
- **Steel**: Smelted Scrap Metal for advanced tools.
- **Composite Fiber**: Durable fabric refined from Cloth for mid-tier crafting.
- **Fluxfuel**: A refined liquid energy source from Raw Fuel.
- **Encrypted Data Shards**: Advanced research material refined from Data Fragments.

**Tier 3: Advanced Materials**

- **Energy Cores**: Crafted from Fluxfuel and Steel for powering advanced buildings.
- **Plasteel**: Lightweight alloy from Steel and Catalysts.
- **Titanium Alloy**: High-strength metal for advanced construction.
- **Advanced Components**: Complex parts crafted from modular components.
- **Nanomesh Fabric**: High-strength textile for advanced tools and buildings.
- **Catalysts**: Rare materials for boosting crafting and unlocking upgrades.

**Tier 4: Rare Resources**

- **Rare Crystals**: Precious gems for advanced crafting and cosmetics.
- **Synthweave**: Ultra-advanced fabric for top-tier crafting.
- **Quantum Shards**: High-tech resources for powerful upgrades.

**Tier 5: Ultra-Rare Resources**

- **Aurora Crystals**: Extremely rare crystals tied to endgame crafting.
- **Exotic Catalysts**: Unique materials for legendary upgrades.
- **Quantum Fragments**: Legendary shards used for ultimate crafting.

---

### **Buildings and Functions**

The game’s progression revolves around constructing and upgrading buildings, each serving unique purposes:

1. **Resource Generator**: Produces basic resources like Stone, Timber, and Raw Fuel.
2. **Workshop**: Processes basic resources into refined materials (e.g., Stone → Reinforced Concrete).
3. **Gas Refinery**: Converts Raw Fuel into Fluxfuel for mid-tier energy needs.
4. **Research Lab**: Uses Data Fragments and Encrypted Data Shards to unlock blueprints and advanced mechanics.
5. **Stone Quarry**: Specializes in generating Stone with a chance to drop Rare Crystals.
6. **Data Forge**: Processes refined materials into advanced components (e.g., Steel → Titanium Alloy).
7. **Quantum Forge**: Crafts endgame resources like Quantum Shards and advanced tools.
8. **Incubator:**
9. **Recycler / Recycling Plant:**
10. **Trade Hub / Marketplace**
11. **Warehouse / Depot**
12. **Trophy Hall**: enables showcase section on profile
13. **Observatory**: Space-related high-end resource collection or something. build a lot later

# Miscellaneous Ideas

mars - diamond / diamond ring

wear items (does not affect appearance but shows wearing list)

item highlight on profil

gambling - bet something and see if you can double it or lose it or whatever

battle royale thing where you join with a bet and if you win you win all of items from all players

rng ?

make 3d models as supporting content for the buildings
