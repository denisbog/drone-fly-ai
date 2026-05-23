# Issue 001: Implement core flight model

## Status
Completed issue grooming

## Implementation
- Added `src/drone_disturbance/flight.py`
- Implemented `DroneConfig`, `DroneInput`, `DroneState`, `DroneController`, and `step_drone`
- Added deterministic fixed-step state updates with thrust, torque, drag, gravity, battery drain, and assist hooks
- Added debug snapshot output for HUD/telemetry consumers

## Priority
P0 — foundation

## Goal
Build the MVP drone simulation and controller feel for a single drone archetype in a 2D side-view or top-down format.

## Why
The product depends on tight, readable, satisfying flight before advanced systems are added. This is the core gameplay foundation.

## Scope
- Simulate thrust
- Simulate tilt/attitude control
- Simulate momentum and drag
- Simulate gravity if using side-view
- Support external force injection from disturbance systems
- Support optional battery/energy consumption hooks
- Expose tunable values through config

## Requirements
- Drone can accelerate, decelerate, hover, and rotate predictably
- Flight remains controllable with default assist settings
- Physics update is deterministic enough for repeatable challenge runs
- Max speed, angular speed, acceleration, and damping are configurable
- Drone state can be queried by HUD and telemetry systems

## Implementation Notes
- Separate raw player input from applied thrust/torque
- Create a drone state object containing position, velocity, angle, angular velocity, battery, damage, and active disturbances
- Leave hooks for future sensor noise and actuator lag
- Keep realism secondary to readability and fun

## Suggested Architecture
- `DroneConfig`: mass, thrust, torque, drag, damping, max limits, battery hooks
- `DroneInput`: thrust, yaw/tilt, boost/stabilize, restart intent
- `DroneState`: pose, motion, health, battery, assist state, active disturbance summary
- `DroneController`: converts input + assists into target forces/torques
- `DroneMotorModel`: clamps and smooths output
- `DronePhysicsStepper`: deterministic fixed-step integration

## Task Breakdown
1. Define config, input, and runtime state data structures
2. Implement fixed-step physics update loop
3. Implement thrust and angular torque application
4. Add drag, damping, and speed clamps
5. Add assist hooks for hover stabilization and attitude damping
6. Add debug readout for core state values
7. Expose tunables in config/inspector data

## Test Checklist
- Hover test with no disturbance
- Acceleration/braking test in both directions
- Rotation test at low and high speed
- Restart produces same initial state every run
- Default assist prevents immediate oscillation for new players

## Acceptance Criteria
- Player can complete a simple obstacle-free hover course using default settings
- Hovering is stable enough for beginners but still shows room for mastery
- Drone response feels immediate and consistent across restarts
- Debug output shows core physics values updating correctly

## Dependencies
- None
