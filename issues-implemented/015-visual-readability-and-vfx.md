# Issue 015: Implement visual readability and VFX for disturbances

## Status
Completed issue grooming

## Priority
P2 — fairness/readability

## Goal
Create the visual language for wind, turbulence, hazards, drone stress, and objective clarity.

## Why
Readable feedback is required so the game feels challenging rather than unfair.

## Scope
- Wind direction/intensity visualization
- Turbulence zone visualization
- Hazard and no-fly zone readability
- Drone stress or instability feedback
- Objective marker styling

## Requirements
- Players can identify dangerous areas before entering them
- Wind and turbulence are visible enough to explain motion changes
- Visual feedback remains readable at gameplay speed
- Effects do not clutter the screen or hide obstacles

## Implementation Notes
- Use a restrained sci-fi industrial style for MVP
- Prefer simple particles, arrows, distortion, or color coding over expensive effects
- Coordinate warning colors with HUD and audio states

## Visual Language Proposal
- Wind: arrows, particles, stream lines
- Turbulence: noisy shimmer or local swirl effect
- Lethal/no-fly: strong shape language + red accent
- Stress: drone wobble sparks, warning flash, or body-light pulse
- Objective: bright high-contrast marker with distance cue

## Task Breakdown
1. Define visual language guide for hazards and disturbances
2. Implement wind/turbulence preview effects
3. Implement hazard/no-fly readability treatment
4. Add drone stress feedback tied to instability state
5. Align colors and warning timing with HUD/audio systems

## Test Checklist
- Players identify major threats before entering them
- Wind direction and strength are understandable at a glance
- Effects do not hide gameplay geometry
- Objective marker remains visible in busy scenes

## Acceptance Criteria
- Wind zones and hazards are understandable without opening telemetry
- Players can visually track active objective and main threats
- Internal playtesting confirms visual cues reduce “unfair death” feedback

## Dependencies
- `002-disturbance-system.md`
- `007-core-hud.md`
