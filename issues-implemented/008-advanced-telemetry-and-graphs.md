# Issue 008: Implement advanced telemetry and graphs

## Status
Completed issue grooming

## Priority
P1 — educational differentiator

## Goal
Build optional telemetry views that help technically curious players understand response, stability, and disturbance effects.

## Why
Telemetry is a core differentiator and supports the educational layer.

## Scope
- Attitude indicator
- Control input visualization
- Wind strength indicator
- Oscillation/stability graph
- Tuning panel integration

## Requirements
- Telemetry is optional and hidden by default for beginners
- Graphs update live without harming gameplay performance
- Telemetry terms are understandable with labels or helper text
- Systems expose data needed for control tuning comparisons

## Implementation Notes
- Start with lightweight rolling graphs for angle, angular velocity, and control output
- Provide hover labels or glossary text where possible
- Ensure telemetry can be toggled during sandbox and challenge modes

## MVP Telemetry Set
- Angle and angular velocity graph
- Input vs output bars
- Wind indicator
- Compact attitude indicator
- Tuning values readback

## Task Breakdown
1. Define telemetry sampling API from flight systems
2. Implement rolling buffer graphs
3. Add input/output and wind indicator widgets
4. Add toggle flow and persistence for telemetry visibility
5. Integrate telemetry with tuning screen comparisons

## Test Checklist
- Telemetry can be toggled without pausing gameplay
- Graphs remain performant under long sessions
- Indicators match underlying gameplay values
- Sandbox and challenge modes both support telemetry

## Acceptance Criteria
- Player can toggle telemetry on/off during gameplay or in sandbox
- At least one live graph visibly changes when tuning parameters are adjusted
- Wind and control input indicators match actual underlying state

## Dependencies
- `001-core-flight-model.md`
- `007-core-hud.md`
