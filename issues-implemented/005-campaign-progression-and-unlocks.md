# Issue 005: Implement campaign progression and unlocks

## Status
Completed issue grooming

## Priority
P1 — retention loop

## Goal
Create the MVP progression loop across campaign missions, unlocks, and simple upgrades.

## Why
The product loop depends on players improving both skill and equipment over time.

## Scope
- Mission completion tracking
- Medal or score thresholds
- Unlock gating for later levels
- Unlock gating for drone modules and tuning features
- Persistent save data

## Requirements
- Campaign map or mission list shows locked, unlocked, and completed states
- Players earn progression from mission completion and performance
- Save system persists unlocks and best scores
- Upgrade unlocks do not create pay-to-win behavior

## Implementation Notes
- Keep upgrade effects understandable and modest in MVP
- Distinguish between permanent unlocks and per-run loadout selection
- Add telemetry/tuning unlocks gradually to reduce overwhelm

## Progression Model
- Mission stars/medals unlock future missions
- Feature unlocks gate telemetry/tuning depth
- Upgrades should be side-grade leaning, not hard power spikes
- Save profile stores progress, best scores, unlocked content, settings references

## Task Breakdown
1. Define persistent profile schema
2. Implement mission unlock rules and completion tracking
3. Implement unlockable modules/features list
4. Build campaign mission-select status UI hooks
5. Add save/load validation and migration version field

## Test Checklist
- Fresh profile unlock flow works
- Returning player state restores correctly
- Locked content explains its unlock condition
- Failed save/load does not corrupt profile silently

## Acceptance Criteria
- Completing early missions unlocks later missions and at least one new upgrade/tuning option
- Save/load works across sessions
- UI communicates why an item or mission is locked

## Dependencies
- `004-mission-objective-framework.md`
