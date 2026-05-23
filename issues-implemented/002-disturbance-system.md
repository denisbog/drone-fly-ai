# Issue 002: Implement disturbance system

## Status
Completed issue grooming

## Implementation
- Added `src/drone_disturbance/disturbances.py`
- Implemented `DisturbanceManager` plus `GustingWind`, `TurbulenceZone`, and `PayloadImbalance`
- Added global and local-zone disturbance support via disturbance sampling and `Zone`
- Surfaced active disturbance names into drone state for UI/telemetry hooks

## Priority
P0 — core differentiator

## Goal
Create a modular disturbance framework that can affect drone behavior through environmental and system-level disruptions.

## Why
Disturbances are the main source of challenge and the central theme of the game.

## Scope
- Gusting wind
- Turbulence zones
- Sensor noise hooks
- Actuator lag hooks
- Payload imbalance hooks
- Partial motor failure hooks for later content

## Requirements
- Disturbances can be attached to levels as reusable components
- Each disturbance has intensity, duration, and spatial or temporal behavior
- Wind zones must visibly affect motion and be readable to players
- Disturbances can stack safely without producing broken physics
- Designers can tune disturbances without code changes

## Implementation Notes
- Model disturbances as force, torque, input corruption, or state-estimation modifiers
- Add a standard disturbance interface for level scripting
- Include seeded randomness for challenge repeatability where needed
- Support both global disturbances and local trigger volumes

## Suggested Architecture
- `DisturbanceDefinition`: serialized tuning data
- `DisturbanceInstance`: runtime state with seed and timers
- `DisturbanceEffect`: force, torque, lag, noise, imbalance contribution
- `DisturbanceManager`: gathers active sources and applies stacked effects safely
- Global sources for weather; local volumes for level-specific events

## MVP Disturbances
1. Gusting wind: time-varying directional force
2. Turbulence zone: noisy local force/torque field
3. Payload imbalance: persistent torque bias or COM offset

## Task Breakdown
1. Define disturbance interface and serialized data format
2. Add seeded random utility for repeatable patterns
3. Implement global disturbance support
4. Implement trigger-volume/local zone support
5. Implement the 3 MVP disturbances
6. Surface active disturbance info to HUD/telemetry
7. Add visual hook points for wind/turbulence readability

## Test Checklist
- Disturbance start/stop events fire correctly
- Multiple disturbances stack without unstable spikes
- Same seed reproduces same pattern
- Designers can change intensity/duration without code changes

## Acceptance Criteria
- At least 3 disturbance types are playable in MVP: gusting wind, turbulence zone, and payload imbalance or actuator lag
- Disturbance parameters can be edited in data files or inspector tools
- Player can identify when a disturbance starts and stops
- Disturbances meaningfully change piloting strategy

## Dependencies
- `001-core-flight-model.md`
