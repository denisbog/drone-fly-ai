# Issue 006: Implement assists and control tuning

## Status
Completed issue grooming

## Priority
P1 — accessibility + depth

## Goal
Provide beginner-friendly assists and a simple tuning interface that supports deeper control customization without overwhelming players.

## Why
This feature delivers the game's control-theory angle while preserving accessibility.

## Scope
- Beginner assist presets
- Stability vs agility presets
- Plain-language tuning descriptions
- Basic PID-style or equivalent sliders for advanced users
- Recommended preset button

## Requirements
- Default configuration is fun and stable without manual tuning
- Tuning changes have visible and explainable effects
- Beginner players can ignore advanced tuning entirely
- Advanced players can save and load tuned presets

## Implementation Notes
- Start with a simplified tuning surface if full PID exposure is too noisy for MVP
- For each exposed variable, include helper text like “faster correction” or “more wobble risk”
- Add a safe reset-to-default action

## MVP Tuning Surface
- Assist strength
- Angular damping
- Response speed
- Stability vs agility preset
- Optional advanced tab: P, D, and output smoothing only

## Task Breakdown
1. Define preset and custom tuning data model
2. Implement assist layer in controller pipeline
3. Build recommended/default/high-agility presets
4. Add UI with helper text and safe reset action
5. Implement preset save/load
6. Add validation/clamps to prevent broken values

## Test Checklist
- Default preset is stable for beginners
- High-agility preset feels noticeably different
- Invalid tuning values are clamped safely
- Presets persist between sessions

## Acceptance Criteria
- Beginner assist meaningfully reduces wobble and frustration
- At least one advanced tuning panel is functional
- Players can compare a default preset and a high-agility preset in gameplay
- No tuning combination should fully break the drone or soft-lock mission flow

## Dependencies
- `001-core-flight-model.md`
- `008-advanced-telemetry-and-graphs.md`
