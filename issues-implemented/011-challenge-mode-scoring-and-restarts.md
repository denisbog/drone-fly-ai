# Issue 011: Implement challenge mode, scoring, and instant restarts

## Status
Completed issue grooming

## Priority
P1 — replayability

## Goal
Create replayable short-form content centered on time, precision, score, and fast iteration.

## Why
Challenge mode supports retention and skill expression beyond the campaign.

## Scope
- Challenge level selection
- Time tracking
- Score calculation
- Medal thresholds
- Instant restart flow
- Best score persistence

## Requirements
- Challenge mode can run independently from campaign progression once unlocked or exposed
- Score formulas support speed, precision, and damage or mistake penalties
- Restart is near-instant to encourage repeated attempts

## Implementation Notes
- Keep scoring transparent enough for optimization-minded players
- Store personal best per level and per loadout if practical
- Design for future leaderboard integration but do not require online services in MVP

## Score Inputs
- Completion time
- Precision/accuracy bonus
- Damage or collision penalties
- Objective bonus/chain bonus if used

## Task Breakdown
1. Define score formula data model
2. Implement challenge run lifecycle and results screen
3. Add medal thresholds per level
4. Integrate instant restart from active and fail states
5. Save personal bests and result history summary

## Test Checklist
- Score breakdown matches actual run events
- Restart is fast enough for repeated attempts
- Best result persistence works across sessions
- Medal thresholds are readable before or after run

## Acceptance Criteria
- Players can replay a short challenge repeatedly with immediate restart
- End-of-run results show time, score breakdown, and medal earned
- Best results persist between sessions

## Dependencies
- `004-mission-objective-framework.md`
- `005-campaign-progression-and-unlocks.md`
