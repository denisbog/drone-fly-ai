# Issue 003: Implement collision, hazards, and fail states

## Status
Completed issue grooming

## Implementation
- Added `src/drone_disturbance/hazards.py`
- Implemented hazard typing, damage rules, payload risk, lethal/no-fly fail states, and failure reasons
- Added hazard resolution that can fail the mission independently of drone destruction for payload cases
- Added simulation wiring in `src/drone_disturbance/sim.py`

## Priority
P0 — gameplay readability

## Goal
Create clear interactions between the drone and level hazards, including damage, mission failure, and restart behavior.

## Why
Players need understandable consequences for unstable flight and environmental mistakes.

## Scope
- Static obstacle collision
- Moving obstacle collision
- Hazard volumes
- Damage states
- Destruction or mission failure states
- Fast restart flow

## Requirements
- Collision response must be readable and consistent
- Fragile mission payloads can fail independently of drone destruction
- Hazard types can define instant fail, gradual damage, or score penalty
- Failure reason should be surfaced to the player

## Implementation Notes
- Tag hazards by type: obstacle, no-fly, turbulence, lethal, payload risk
- Add checkpoint support only if needed after MVP validation
- Restart should be possible in one input from fail state

## Hazard Model
- `Obstacle`: physical collision + impact damage
- `LethalVolume`: immediate fail
- `DamageVolume`: damage over time
- `PayloadRiskZone`: damages payload rating or break threshold
- `MovingHazard`: obstacle with scripted motion

## Task Breakdown
1. Define hazard typing and damage/fail rules
2. Implement drone collision response and impact severity calculation
3. Implement payload-specific failure path
4. Implement fail-state controller and failure reason messaging
5. Add one-button restart from fail and from active run where allowed
6. Hook impact events into HUD/audio/VFX

## Test Checklist
- Light vs heavy impacts produce consistent results
- Lethal zones fail immediately
- Payload can fail while drone remains controllable
- Restart clears all timers, damage, and disturbances cleanly

## Acceptance Criteria
- Player receives immediate visual and audio feedback on impact
- Mission ends correctly on destruction, objective timeout, or payload breakage
- Restart to playable state happens quickly with no lingering state bugs

## Dependencies
- `001-core-flight-model.md`
- `002-disturbance-system.md`
