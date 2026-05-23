# Issue 010: Implement onboarding and tutorial levels

## Status
Completed issue grooming

## Priority
P1 — first-session success

## Goal
Introduce flight, disturbance response, and optional tuning without making the game feel like a lecture.

## Why
The biggest product risk is that controls feel too technical too early.

## Scope
- Basic movement tutorial
- Hover and landing tutorial
- Wind response tutorial
- Plain-language feedback prompts
- First tuning introduction

## Requirements
- Tutorials teach through short playable tasks
- Guidance uses simple language such as “too much wobble” or “slow correction”
- Players can skip or replay tutorial content
- First 10 minutes should lead to successful mission completion for most players

## Implementation Notes
- Keep prompts contextual and brief
- Use safe environments before introducing hazards
- Delay technical terminology until after player confidence is established

## Suggested Flow
1. Free movement
2. Controlled hover
3. Pass through markers
4. Basic wind correction
5. Optional “try a preset” tuning prompt

## Task Breakdown
1. Script tutorial objective sequence
2. Add contextual prompt system with skip/replay support
3. Build safe tutorial spaces with limited hazards
4. Add optional tuning introduction branch
5. Measure first-session completion timing internally

## Test Checklist
- Prompt timing does not interrupt control
- Skip path still teaches enough to continue
- Replay path resets tutorial state correctly
- New player can complete first mission sequence in target time

## Acceptance Criteria
- New players can learn controls and clear the first mission sequence
- Tutorial completion and skip flows both function correctly
- Tuning introduction is optional and does not block progression

## Dependencies
- `001-core-flight-model.md`
- `006-assists-and-control-tuning.md`
- `007-core-hud.md`
