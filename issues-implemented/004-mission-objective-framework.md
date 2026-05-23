# Issue 004: Build mission objective framework

## Status
Completed issue grooming

## Implementation
- Added `src/drone_disturbance/objectives.py`
- Implemented `ObjectiveManager` and 4 MVP objectives: reach destination, checkpoint race, hold position, payload delivery
- Added mission success/failure propagation and progress reporting for HUD integration
- Wired objectives into the top-level sim in `src/drone_disturbance/sim.py`

## Priority
P0 — mission structure

## Goal
Implement a reusable objective system to support campaign and challenge missions.

## Why
The game requires multiple objective types built on common logic and UI feedback.

## Scope
- Reach extraction point
- Checkpoint race
- Hold position timer
- Precision inspection zone
- Payload delivery
- Survival duration

## Requirements
- Objectives can be composed per level
- Objective state supports start, progress, success, and failure
- Objective progress can be displayed in HUD
- Designers can configure mission rules without code changes

## Implementation Notes
- Build a base objective interface and objective manager
- Allow optional secondary goals for score and medals
- Expose timers, tolerances, and completion thresholds in data

## Suggested Objective API
- `ObjectiveDefinition`: type, thresholds, timers, linked entities
- `ObjectiveRuntime`: inactive, active, succeeded, failed
- `ObjectiveManager`: lifecycle, composite logic, HUD summary, score hooks
- `MissionResult`: success/fail state plus breakdown data

## MVP Objective Types
1. Reach destination
2. Checkpoint race
3. Hold position
4. Payload delivery

## Task Breakdown
1. Define base objective data and runtime interfaces
2. Implement objective manager and mission result aggregation
3. Implement the 4 MVP objective types
4. Add optional support for secondary goals/medals
5. Expose progress data to HUD and challenge results screen

## Test Checklist
- Objective activation order works correctly
- Parallel and sequential objectives both function
- Timeout/fail conditions interrupt cleanly
- HUD always shows the active objective and progress

## Acceptance Criteria
- At least 4 objective types are fully playable in MVP
- Objectives can trigger win/fail states and score updates
- HUD reflects active objective and progress clearly

## Dependencies
- `001-core-flight-model.md`
- `003-collision-hazards-and-fail-states.md`
