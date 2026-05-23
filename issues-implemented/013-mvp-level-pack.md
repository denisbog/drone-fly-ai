# Issue 013: Build MVP level pack

## Status
Completed issue grooming

## Priority
P1 — content validation

## Goal
Produce the initial handcrafted level set that validates the core loop and supports campaign plus challenge play.

## Why
The MVP needs 8 to 10 short levels that progressively prove the game is fun.

## Scope
- Intro movement level
- Hover/precision level
- First wind level
- Delivery level
- Checkpoint race level
- Survival level
- Inspection level
- Advanced mixed-disturbance level
- Optional challenge variants

## Requirements
- Levels introduce mechanics gradually
- Visual language for danger and wind is consistent across levels
- Mission length fits quick retry structure
- At least a few levels are reusable in challenge mode

## Implementation Notes
- Favor short, distinct scenarios over large maps
- Use one or two environment themes for MVP to control production cost
- Each level should teach one main lesson and one supporting lesson

## Suggested MVP Level Order
1. Intro flight
2. Hover gates
3. Basic wind lane
4. Delivery under mild drift
5. Timed checkpoint route
6. Survival in turbulence room
7. Precision inspection pass
8. Mixed-disturbance final exam

## Task Breakdown
1. Define level progression matrix by mechanic introduced
2. Greybox all 8 core levels
3. Playtest retry times and completion times
4. Tag challenge-ready levels and add score variants
5. Polish readability, pacing, and fail-state placement

## Test Checklist
- Difficulty rises smoothly across the set
- Every level has a clear primary lesson
- Failure reasons are readable on first attempt
- At least 3 levels remain fun for repeated challenge runs

## Acceptance Criteria
- 8 to 10 polished levels are playable end to end
- Difficulty curve escalates without sudden spikes
- At least 3 levels are compelling enough for replay-based challenge mode

## Dependencies
- `002-disturbance-system.md`
- `003-collision-hazards-and-fail-states.md`
- `004-mission-objective-framework.md`
- `010-onboarding-and-tutorial-levels.md`
