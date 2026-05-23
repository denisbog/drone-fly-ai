# Issue 012: Implement sandbox test lab

## Status
Completed issue grooming

## Priority
P2 — advanced experimentation

## Goal
Create a safe experimentation environment for tuning, telemetry, and disturbance testing.

## Why
The sandbox is important for the optional educational layer and advanced player experimentation.

## Scope
- Free-fly test room or arena
- Toggleable disturbances
- Tuning access
- Telemetry visibility
- Reset state button

## Requirements
- Sandbox is accessible without mission failure pressure
- Player can enable or disable at least a few disturbance types
- Tuning changes can be observed immediately
- Arena supports hover, movement, and stability testing

## Implementation Notes
- Start simple: one indoor test facility with configurable wind and payload presets
- Provide a clean reset to default drone state and default tuning
- Reuse systems from campaign rather than building special-case logic

## MVP Controls
- Disturbance toggles
- Preset tuning selector
- Telemetry on/off
- Reset drone
- Reset environment

## Task Breakdown
1. Build sandbox scene and spawn/reset flow
2. Reuse tuning and telemetry panels in sandbox context
3. Add disturbance toggles and preset scenarios
4. Add known-default reset for drone and environment
5. Expose sandbox from menu/progression flow

## Test Checklist
- Disturbance toggles update live
- Tuning changes are immediately reflected
- Reset returns all state to defaults
- Sandbox can run for long sessions without mission-state leaks

## Acceptance Criteria
- Player can enter sandbox, apply tuning changes, and observe differences using telemetry
- Disturbance toggles work in real time
- Reset returns drone and environment to known defaults

## Dependencies
- `002-disturbance-system.md`
- `006-assists-and-control-tuning.md`
- `008-advanced-telemetry-and-graphs.md`
