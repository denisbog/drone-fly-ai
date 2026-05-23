# Issue 009: Implement input controls and rebinding

## Status
Completed issue grooming

## Priority
P0 — platform usability

## Goal
Support the MVP input set across keyboard/mouse and gamepad, with restart and assist actions optimized for fast retries.

## Why
Control feel and frictionless restart are critical to retention.

## Scope
- Thrust up/down
- Rotate or tilt left/right
- Boost or stabilize
- Restart
- Pause
- Telemetry toggle
- Input rebinding

## Requirements
- Keyboard and gamepad are both fully playable
- Restart input works instantly from failure and from active run where allowed
- Input settings are saved persistently
- UI displays current bindings clearly

## Implementation Notes
- Separate gameplay actions from menu navigation actions
- Consider analog support for gamepad thrust/tilt sensitivity
- Add deadzone and sensitivity settings if engine supports them easily

## Input Actions
- Move/tilt left
- Move/tilt right
- Thrust
- Boost/stabilize
- Restart
- Pause
- Telemetry toggle
- Confirm/back for menus

## Task Breakdown
1. Define action map and device profiles
2. Implement gameplay and menu input separation
3. Add keyboard rebinding UI
4. Add gamepad binding/support and analog tuning
5. Persist bindings and sensitivity/deadzone settings
6. Validate restart responsiveness in mission/fail states

## Test Checklist
- Early levels are completable on keyboard and gamepad
- Rebinding survives relaunch
- Duplicate/conflicting binds are handled clearly
- Restart works from fail and active run states as designed

## Acceptance Criteria
- All minimum inputs are bindable
- A player can complete early levels using keyboard or gamepad
- Rebinding survives relaunch

## Dependencies
- `001-core-flight-model.md`
