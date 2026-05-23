# Issue 014: Implement audio feedback system

## Status
Completed issue grooming

## Priority
P2 — support readability

## Goal
Add gameplay-critical audio cues for motion, wind, instability, battery state, and failure.

## Why
Audio should help players sense instability before they lose control.

## Scope
- Rotor and motor loop layers
- Wind intensity cues
- Warning tones for instability, battery, or faults
- Impact and destruction sounds
- Basic music state hooks

## Requirements
- Audio reacts to thrust and stress state
- Warnings trigger early enough to inform player correction
- Sound mix supports precision play and does not mask critical cues

## Implementation Notes
- Prioritize functional feedback over soundtrack complexity in MVP
- Parameterize motor pitch, wind intensity, and alarm urgency from gameplay state
- Leave room for accessibility options such as independent volume sliders

## Audio Parameters
- Motor thrust level
- Wind intensity
- Instability risk
- Damage state
- Fail/destruction state

## Task Breakdown
1. Define runtime audio parameter feed from gameplay systems
2. Implement motor and wind reactive loops
3. Add warning and fail-state one-shots
4. Add mixer groups and key volume settings
5. Validate restart behavior so loops reset cleanly

## Test Checklist
- Audio changes match flight stress clearly
- Warning timing gives actionable lead time
- Rapid restarts do not leave stuck loops
- Critical cues remain audible over music

## Acceptance Criteria
- Players can distinguish calm flight from unstable flight by sound alone
- Low battery, impact risk, or instability warnings are audible and timely
- Audio remains responsive during rapid restart loops

## Dependencies
- `001-core-flight-model.md`
- `003-collision-hazards-and-fail-states.md`
