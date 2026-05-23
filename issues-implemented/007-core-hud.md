# Issue 007: Implement core HUD

## Status
Completed issue grooming

## Priority
P1 — essential feedback

## Goal
Build the minimum gameplay HUD for navigation, state awareness, and mission feedback.

## Why
Fast, readable feedback is essential for challenge-oriented flying.

## Scope
- Objective marker
- Velocity indicator
- Battery/energy display
- Stability or damage warning
- Timer
- Score or medal progress

## Requirements
- HUD is readable during high-motion gameplay
- Warning states are clear but not overwhelming
- Objective and timer remain visible during all missions
- HUD can be expanded later for telemetry

## Implementation Notes
- Keep core HUD separate from advanced telemetry panels
- Use icon + text + color state where possible
- Support mission-specific widgets through a modular layout

## Layout Proposal
- Top: mission objective + timer
- Edge/worldspace: objective marker
- Bottom corner: battery + damage/stability state
- Optional challenge area: score/medal pace

## Task Breakdown
1. Define HUD data contract from gameplay systems
2. Implement persistent HUD shell layout
3. Add real-time battery, timer, and objective widgets
4. Add warning state presentation for instability/damage
5. Add mission-specific widget slot support

## Test Checklist
- All widgets update without pause/menu interference
- Warnings appear before failure events
- HUD remains readable at gameplay camera speed
- Missing optional systems do not break HUD layout

## Acceptance Criteria
- Player can complete a mission without pausing for missing information
- Battery, timer, and objective marker update in real time
- Damage/stability warnings appear before failure when relevant

## Dependencies
- `004-mission-objective-framework.md`
