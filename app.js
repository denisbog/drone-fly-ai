const STORAGE_KEY = 'drone-disturbance-save-v1';
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const telemetryCanvas = document.getElementById('telemetry');
const tctx = telemetryCanvas.getContext('2d');
const menuPanel = document.getElementById('menu-panel');
const overlay = document.getElementById('overlay');
const promptBox = document.getElementById('prompt');
const resultsBox = document.getElementById('results');
const objectiveBox = document.getElementById('objective-box');
const timerBox = document.getElementById('timer-box');
const scoreBox = document.getElementById('score-box');
const statusBox = document.getElementById('status-box');
const batteryBox = document.getElementById('battery-box');
const warningBox = document.getElementById('warning-box');

const ACTIONS = ['thrust', 'left', 'right', 'stabilize', 'restart', 'telemetry', 'pause'];
const DEFAULT_BINDINGS = {
  thrust: 'KeyW',
  left: 'KeyA',
  right: 'KeyD',
  stabilize: 'ShiftLeft',
  restart: 'KeyR',
  telemetry: 'KeyT',
  pause: 'Escape',
};

const PRESETS = {
  recommended: { name: 'Recommended', assist: 0.72, damping: 0.62, response: 0.58, p: 0.78, d: 0.65, smoothing: 0.22 },
  stable: { name: 'Stable Trainer', assist: 0.92, damping: 0.84, response: 0.45, p: 0.68, d: 0.84, smoothing: 0.36 },
  agile: { name: 'High Agility', assist: 0.42, damping: 0.34, response: 0.92, p: 0.95, d: 0.28, smoothing: 0.1 },
  custom: { name: 'Custom', assist: 0.72, damping: 0.62, response: 0.58, p: 0.78, d: 0.65, smoothing: 0.22 },
};

const LEVELS = [
  {
    id: 'tutorial-1',
    name: '01 Intro Flight',
    description: 'Learn thrust and tilt in a calm test room.',
    mode: 'campaign',
    unlockCost: 0,
    theme: 'lab',
    objective: { type: 'reach', x: 1080, y: 200, radius: 42 },
    start: { x: 120, y: 560 },
    prompt: 'Use thrust and tilt to reach the bright marker.',
    prompts: [
      { text: 'Hold thrust to lift off.', until: s => s.drone.pos.y < 530 },
      { text: 'Tilt toward the marker. Too much wobble? Hold stabilize.', until: s => s.drone.pos.x > 450 },
      { text: 'Great. Fly to the finish ring.', until: s => s.missionComplete || s.failed },
    ],
    hazards: [
      { type: 'floor', x: 0, y: 640, w: 1280, h: 80 },
      { type: 'wall', x: -40, y: 0, w: 40, h: 720 },
      { type: 'wall', x: 1280, y: 0, w: 40, h: 720 },
    ],
    obstacles: [
      { x: 540, y: 440, w: 30, h: 200 },
      { x: 790, y: 350, w: 30, h: 290 },
    ],
    medals: { bronze: 1600, silver: 2500, gold: 3400 },
    parTime: 35,
  },
  {
    id: 'tutorial-2',
    name: '02 Hover Gates',
    description: 'Hold steady at marked stations.',
    mode: 'campaign',
    unlockCost: 1,
    theme: 'lab',
    objective: { type: 'hold-chain', points: [{ x: 320, y: 260 }, { x: 640, y: 210 }, { x: 960, y: 260 }], radius: 40, holdTime: 2.2 },
    start: { x: 140, y: 560 },
    prompt: 'Keep the drone inside each ring until the timer fills.',
    prompts: [
      { text: 'Gentle corrections work best. Too much wobble means you are overcorrecting.', until: s => s.progressIndex > 0 },
      { text: 'Nice hold. Repeat for the remaining gates.', until: s => s.missionComplete || s.failed },
    ],
    hazards: [{ type: 'floor', x: 0, y: 640, w: 1280, h: 80 }],
    medals: { bronze: 2000, silver: 3000, gold: 3900 },
    parTime: 40,
  },
  {
    id: 'tutorial-3',
    name: '03 Wind Lane',
    description: 'Compensate for readable gusts.',
    mode: 'campaign',
    unlockCost: 2,
    theme: 'roof',
    objective: { type: 'reach', x: 1120, y: 180, radius: 44 },
    start: { x: 120, y: 560 },
    globalWind: { baseX: 16, gustX: 70, gustY: 12, speed: 0.9 },
    windZones: [
      { x: 340, y: 110, w: 230, h: 410, forceX: 90, forceY: -10, intensity: 1 },
      { x: 760, y: 90, w: 220, h: 430, forceX: 130, forceY: -25, intensity: 1.2 },
    ],
    obstacles: [{ x: 620, y: 0, w: 30, h: 300 }, { x: 620, y: 420, w: 30, h: 300 }],
    hazards: [{ type: 'floor', x: 0, y: 640, w: 1280, h: 80 }],
    medals: { bronze: 1900, silver: 3000, gold: 3900 },
    parTime: 45,
  },
  {
    id: 'campaign-delivery',
    name: '04 Drift Delivery',
    description: 'Carry fragile cargo to extraction.',
    mode: 'campaign',
    unlockCost: 3,
    theme: 'roof',
    objective: { type: 'payload', x: 1110, y: 210, radius: 46 },
    start: { x: 120, y: 560 },
    payload: true,
    globalWind: { baseX: 12, gustX: 45, gustY: 10, speed: 0.7 },
    imbalance: 0.08,
    hazards: [
      { type: 'floor', x: 0, y: 640, w: 1280, h: 80 },
      { type: 'payloadRisk', x: 460, y: 320, w: 140, h: 220, damage: 16 },
      { type: 'payloadRisk', x: 790, y: 210, w: 150, h: 250, damage: 18 },
    ],
    obstacles: [{ x: 370, y: 0, w: 30, h: 230 }, { x: 700, y: 430, w: 30, h: 210 }],
    medals: { bronze: 2200, silver: 3300, gold: 4200 },
    parTime: 42,
  },
  {
    id: 'campaign-race',
    name: '05 Checkpoint Rush',
    description: 'Hit every checkpoint fast.',
    mode: 'campaign',
    unlockCost: 4,
    theme: 'canyon',
    objective: { type: 'checkpoints', points: [{ x: 250, y: 320 }, { x: 520, y: 160 }, { x: 760, y: 460 }, { x: 1020, y: 200 }, { x: 1140, y: 420 }], radius: 40 },
    start: { x: 80, y: 540 },
    globalWind: { baseX: 8, gustX: 40, gustY: 18, speed: 1.3 },
    turbulenceZones: [{ x: 650, y: 220, w: 220, h: 200, intensity: 58 }],
    hazards: [{ type: 'floor', x: 0, y: 640, w: 1280, h: 80 }],
    obstacles: [
      { x: 320, y: 0, w: 40, h: 360 },
      { x: 320, y: 500, w: 40, h: 220 },
      { x: 920, y: 0, w: 40, h: 260 },
      { x: 920, y: 400, w: 40, h: 320 },
    ],
    medals: { bronze: 2600, silver: 3600, gold: 4600 },
    parTime: 36,
  },
  {
    id: 'campaign-survive',
    name: '06 Turbulence Room',
    description: 'Hold position in violent air.',
    mode: 'campaign',
    unlockCost: 5,
    theme: 'factory',
    objective: { type: 'hold', x: 640, y: 260, radius: 56, holdTime: 12 },
    start: { x: 640, y: 520 },
    turbulenceZones: [{ x: 200, y: 100, w: 880, h: 420, intensity: 76 }],
    hazards: [
      { type: 'floor', x: 0, y: 640, w: 1280, h: 80 },
      { type: 'damage', x: 160, y: 560, w: 960, h: 40, damage: 9 },
    ],
    medals: { bronze: 2300, silver: 3400, gold: 4300 },
    parTime: 18,
  },
  {
    id: 'campaign-inspection',
    name: '07 Inspection Pass',
    description: 'Thread tight corridors and pause at scan points.',
    mode: 'campaign',
    unlockCost: 6,
    theme: 'factory',
    objective: { type: 'inspect', points: [{ x: 340, y: 210 }, { x: 670, y: 350 }, { x: 1000, y: 240 }], radius: 34, holdTime: 1.5 },
    start: { x: 120, y: 570 },
    globalWind: { baseX: 0, gustX: 12, gustY: 6, speed: 0.8 },
    hazards: [
      { type: 'floor', x: 0, y: 640, w: 1280, h: 80 },
      { type: 'noFly', x: 520, y: 120, w: 80, h: 420 },
      { type: 'noFly', x: 820, y: 170, w: 80, h: 320 },
    ],
    obstacles: [{ x: 450, y: 0, w: 30, h: 420 }, { x: 760, y: 250, w: 30, h: 470 }],
    medals: { bronze: 2400, silver: 3500, gold: 4400 },
    parTime: 40,
  },
  {
    id: 'campaign-final',
    name: '08 Final Exam',
    description: 'Mixed disturbances, hazards, and speed.',
    mode: 'campaign',
    unlockCost: 7,
    theme: 'storm',
    objective: { type: 'reach', x: 1140, y: 150, radius: 42 },
    start: { x: 120, y: 570 },
    payload: true,
    globalWind: { baseX: 24, gustX: 85, gustY: 25, speed: 1.7 },
    turbulenceZones: [{ x: 350, y: 160, w: 240, h: 280, intensity: 62 }, { x: 840, y: 80, w: 210, h: 280, intensity: 78 }],
    windZones: [{ x: 610, y: 140, w: 120, h: 400, forceX: 0, forceY: -90, intensity: 1 }],
    imbalance: 0.12,
    hazards: [
      { type: 'floor', x: 0, y: 640, w: 1280, h: 80 },
      { type: 'lethal', x: 560, y: 600, w: 160, h: 40 },
      { type: 'payloadRisk', x: 930, y: 380, w: 150, h: 150, damage: 20 },
    ],
    obstacles: [{ x: 280, y: 0, w: 35, h: 300 }, { x: 280, y: 440, w: 35, h: 280 }, { x: 760, y: 0, w: 35, h: 180 }, { x: 760, y: 300, w: 35, h: 420 }],
    medals: { bronze: 2800, silver: 3900, gold: 4800 },
    parTime: 50,
  },
];

const CHALLENGES = [
  { levelId: 'campaign-race', id: 'ch-rush', name: 'Rush Variant', description: 'Best time wins.' },
  { levelId: 'campaign-survive', id: 'ch-hold', name: 'Hold Under Pressure', description: 'Stability bonus focus.' },
  { levelId: 'campaign-final', id: 'ch-exam', name: 'Final Exam Sprint', description: 'Fast restart mastery.' },
];

const SANDBOX_LEVEL = {
  id: 'sandbox-lab',
  name: 'Sandbox Lab',
  description: 'Freely test tuning, wind, and telemetry.',
  mode: 'sandbox',
  theme: 'lab',
  objective: { type: 'sandbox' },
  start: { x: 260, y: 500 },
  hazards: [{ type: 'floor', x: 0, y: 640, w: 1280, h: 80 }],
  windZones: [{ x: 760, y: 120, w: 240, h: 300, forceX: 90, forceY: 0, intensity: 1 }],
  turbulenceZones: [{ x: 360, y: 160, w: 220, h: 240, intensity: 45 }],
  globalWind: { baseX: 0, gustX: 0, gustY: 0, speed: 1 },
};

const state = {
  view: 'campaign',
  running: true,
  waitingForBind: null,
  input: {},
  justPressed: {},
  binds: {},
  profile: null,
  telemetryVisible: false,
  selectedLevelId: LEVELS[0].id,
  selectedChallengeId: CHALLENGES[0].id,
  gamepadConnected: false,
  mission: null,
  drone: null,
  simTime: 0,
  resultsShown: false,
  currentPromptIndex: 0,
  progressIndex: 0,
  currentRunScore: 0,
  particles: [],
  overlayText: '',
};

const audio = {
  ctx: null,
  master: null,
  motorOsc: null,
  motorGain: null,
  windOsc: null,
  windGain: null,
  lastWarn: 0,
  enabled: false,
};

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function length(x, y) { return Math.hypot(x, y); }
function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
function rectContains(r, x, y) { return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; }
function formatKey(code) {
  return code.replace('Key', '').replace('Digit', '').replace('Arrow', '').replace('ShiftLeft', 'Shift').replace('ShiftRight', 'Shift').replace('Space', 'Space');
}
function levelById(id) { return LEVELS.find(l => l.id === id) || SANDBOX_LEVEL; }
function challengeById(id) { return CHALLENGES.find(c => c.id === id) || CHALLENGES[0]; }

function defaultProfile() {
  return {
    version: 1,
    bindings: { ...DEFAULT_BINDINGS },
    telemetryVisible: false,
    missions: {},
    challengeBests: {},
    unlockedFeatures: { telemetry: false, tuning: false, sandbox: false },
    tuning: { preset: 'recommended', ...PRESETS.recommended },
    customPresets: [],
    settings: { deadzone: 0.16, sensitivity: 1 },
  };
}

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : defaultProfile();
    state.profile = { ...defaultProfile(), ...parsed };
    state.profile.bindings = { ...DEFAULT_BINDINGS, ...(parsed.bindings || {}) };
    state.profile.unlockedFeatures = { ...defaultProfile().unlockedFeatures, ...(parsed.unlockedFeatures || {}) };
    state.profile.tuning = { ...PRESETS.recommended, ...(parsed.tuning || {}) };
    state.binds = state.profile.bindings;
    state.telemetryVisible = !!state.profile.telemetryVisible;
  } catch {
    state.profile = defaultProfile();
    state.binds = state.profile.bindings;
  }
}

function saveProfile() {
  state.profile.bindings = state.binds;
  state.profile.telemetryVisible = state.telemetryVisible;
  state.profile.tuning = getTuning();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.profile));
}

function getTuning() {
  const t = state.profile.tuning;
  return {
    preset: t.preset || 'custom',
    name: t.name || 'Custom',
    assist: clamp(+t.assist || 0.7, 0, 1),
    damping: clamp(+t.damping || 0.6, 0, 1),
    response: clamp(+t.response || 0.6, 0.1, 1),
    p: clamp(+t.p || 0.8, 0.1, 1),
    d: clamp(+t.d || 0.65, 0, 1),
    smoothing: clamp(+t.smoothing || 0.2, 0, 0.8),
  };
}

function applyPreset(name) {
  const preset = PRESETS[name];
  if (!preset) return;
  state.profile.tuning = { preset: name, ...preset };
  saveProfile();
  renderMenu();
}

function initMission(level, variant = 'campaign') {
  const tuning = getTuning();
  state.mission = {
    level,
    variant,
    time: 0,
    score: 0,
    medal: null,
    failed: false,
    failReason: '',
    complete: false,
    checkpointIndex: 0,
    holdProgress: 0,
    inspectIndex: 0,
    promptDone: false,
    tutorialPrompts: level.prompts || [],
    promptIndex: 0,
    stats: { impacts: 0, collisions: 0, maxWobble: 0, avgPrecision: 0, precisionSamples: 0 },
    sandbox: variant === 'sandbox',
    disturbanceOverrides: { wind: 1, turbulence: 1, imbalance: level.imbalance || 0 },
    tuningSnapshot: { ...tuning },
  };
  state.drone = {
    pos: { ...(level.start || { x: 140, y: 560 }) },
    vel: { x: 0, y: 0 },
    angle: 0,
    angularVelocity: 0,
    battery: 100,
    damage: 0,
    payload: level.payload ? 100 : null,
    alive: true,
    motor: 0,
    torque: 0,
    sensorNoise: 0,
    actuatorLag: 0,
    disturbanceNames: [],
    debug: { thrust: 0, windX: 0, windY: 0, torque: 0, inputTilt: 0 },
    telemetry: { angle: [], angVel: [], thrust: [], wind: [] },
  };
  state.resultsShown = false;
  state.simTime = 0;
  state.particles = [];
  resultsBox.classList.add('hidden');
  state.currentRunScore = 0;
  state.currentPromptIndex = 0;
  state.progressIndex = 0;
  state.running = true;
  updatePrompt();
}

function currentLevel() {
  if (state.view === 'sandbox') return SANDBOX_LEVEL;
  if (state.view === 'challenge') return levelById(challengeById(state.selectedChallengeId).levelId);
  return levelById(state.selectedLevelId);
}

function isLevelUnlocked(level) {
  if (level.mode !== 'campaign') return true;
  const medals = totalCampaignMedals();
  return medals >= level.unlockCost;
}

function totalCampaignMedals() {
  return LEVELS.reduce((sum, level) => sum + ((state.profile.missions[level.id]?.medalValue) || 0), 0);
}

function medalFromScore(level, score) {
  if (score >= level.medals.gold) return { name: 'Gold', className: 'good', value: 3 };
  if (score >= level.medals.silver) return { name: 'Silver', className: 'warn', value: 2 };
  if (score >= level.medals.bronze) return { name: 'Bronze', className: 'medal', value: 1 };
  return { name: 'None', className: 'bad', value: 0 };
}

function completeMission() {
  if (state.mission.complete || state.mission.failed) return;
  state.mission.complete = true;
  state.running = false;
  const level = state.mission.level;
  const score = calculateScore();
  state.mission.score = score;
  state.currentRunScore = score;
  const medal = medalFromScore(level, score);
  state.mission.medal = medal;
  if (state.mission.variant === 'campaign') {
    const prev = state.profile.missions[level.id] || { bestScore: 0, medalValue: 0, medalName: 'None', completed: false };
    state.profile.missions[level.id] = {
      completed: true,
      bestScore: Math.max(prev.bestScore || 0, score),
      medalValue: Math.max(prev.medalValue || 0, medal.value),
      medalName: ['None', 'Bronze', 'Silver', 'Gold'][Math.max(prev.medalValue || 0, medal.value)],
      bestTime: prev.bestTime ? Math.min(prev.bestTime, state.mission.time) : state.mission.time,
    };
    if (LEVELS.findIndex(l => l.id === level.id) >= 1) state.profile.unlockedFeatures.telemetry = true;
    if (LEVELS.findIndex(l => l.id === level.id) >= 2) state.profile.unlockedFeatures.tuning = true;
    if (LEVELS.findIndex(l => l.id === level.id) >= 4) state.profile.unlockedFeatures.sandbox = true;
  } else if (state.mission.variant === 'challenge') {
    const challenge = challengeById(state.selectedChallengeId);
    const prev = state.profile.challengeBests[challenge.id] || { bestScore: 0, bestTime: 9999 };
    state.profile.challengeBests[challenge.id] = { bestScore: Math.max(prev.bestScore, score), bestTime: Math.min(prev.bestTime, state.mission.time) };
  }
  saveProfile();
  showResults(true);
  renderMenu();
  beep(760, 0.12, 0.03);
}

function failMission(reason) {
  if (state.mission.failed || state.mission.complete) return;
  state.mission.failed = true;
  state.mission.failReason = reason;
  state.running = false;
  showResults(false);
  beep(180, 0.25, 0.06);
}

function showResults(success) {
  const level = state.mission.level;
  const score = success ? state.mission.score : calculateScore();
  const medal = success ? state.mission.medal : medalFromScore(level, score);
  resultsBox.classList.remove('hidden');
  resultsBox.innerHTML = `
    <h2>${success ? 'Mission Complete' : 'Mission Failed'}</h2>
    <p>${success ? level.description : state.mission.failReason}</p>
    <div class="stack">
      <div class="list-card">Time: <strong>${state.mission.time.toFixed(1)}s</strong></div>
      <div class="list-card">Score: <strong>${Math.round(score)}</strong></div>
      <div class="list-card">Medal: <strong class="${medal.className}">${medal.name}</strong></div>
      <div class="list-card">Impacts: <strong>${state.mission.stats.impacts}</strong> · Max wobble: <strong>${Math.round(state.mission.stats.maxWobble)}°</strong></div>
      <button id="restart-run">Restart</button>
    </div>
  `;
  document.getElementById('restart-run').onclick = () => initMission(level, state.mission.variant);
}

function calculateScore() {
  const level = state.mission.level;
  const timeScore = Math.max(0, 2200 - state.mission.time * 36);
  const batteryScore = state.drone.battery * 8;
  const payloadScore = (state.drone.payload == null ? 100 : state.drone.payload) * 6;
  const precisionAvg = state.mission.stats.precisionSamples ? state.mission.stats.avgPrecision / state.mission.stats.precisionSamples : 1;
  const precisionScore = precisionAvg * 950;
  const collisionPenalty = state.mission.stats.collisions * 260 + state.drone.damage * 10;
  return Math.max(0, Math.round(timeScore + batteryScore + payloadScore + precisionScore - collisionPenalty + (level.parTime * 8)));
}

function updatePrompt() {
  const prompts = state.mission?.tutorialPrompts || [];
  if (!prompts.length) {
    promptBox.innerHTML = state.mission?.sandbox ? 'Sandbox controls are in the sidebar. Toggle disturbances live.' : (state.mission?.level.prompt || 'Reach the objective.');
    return;
  }
  const idx = state.mission.promptIndex || 0;
  promptBox.innerHTML = `${prompts[idx]?.text || ''} <span class="tiny">Press ${formatKey(state.binds.restart)} to restart. ${state.profile.unlockedFeatures.telemetry ? `Press ${formatKey(state.binds.telemetry)} for telemetry.` : ''}</span>`;
}

function setupInput() {
  window.addEventListener('keydown', e => {
    if (state.waitingForBind) {
      state.binds[state.waitingForBind] = e.code;
      state.waitingForBind = null;
      saveProfile();
      renderMenu();
      refreshBindLabels();
      return;
    }
    state.input[e.code] = true;
    state.justPressed[e.code] = true;
    handleImmediateActions(e.code);
    ensureAudio();
  });
  window.addEventListener('keyup', e => { state.input[e.code] = false; });
  window.addEventListener('gamepadconnected', () => state.gamepadConnected = true);
  window.addEventListener('gamepaddisconnected', () => state.gamepadConnected = false);
}

function handleImmediateActions(code) {
  if (code === state.binds.restart) initMission(currentLevel(), state.view === 'challenge' ? 'challenge' : state.view === 'sandbox' ? 'sandbox' : 'campaign');
  if (code === state.binds.telemetry && state.profile.unlockedFeatures.telemetry) {
    state.telemetryVisible = !state.telemetryVisible;
    telemetryCanvas.style.display = state.telemetryVisible ? 'block' : 'none';
    saveProfile();
  }
  if (code === state.binds.pause) state.running = !state.running;
}

function pollGamepad() {
  const pad = navigator.getGamepads?.()[0];
  if (!pad) return { thrust: 0, left: 0, right: 0, stabilize: false };
  const dz = state.profile.settings.deadzone || 0.16;
  const stick = Math.abs(pad.axes[0]) > dz ? pad.axes[0] : 0;
  return {
    thrust: clamp((pad.buttons[7]?.value || 0) + ((1 - (pad.axes[1] || 1)) * 0.15), 0, 1),
    left: stick < 0 ? -stick : 0,
    right: stick > 0 ? stick : 0,
    stabilize: !!pad.buttons[0]?.pressed,
    restart: !!pad.buttons[3]?.pressed,
  };
}

function actionPressed(action) {
  return !!state.input[state.binds[action]];
}

function currentActionInput() {
  const gp = pollGamepad();
  return {
    thrust: clamp((actionPressed('thrust') ? 1 : 0) + gp.thrust, 0, 1),
    tilt: clamp((actionPressed('right') ? 1 : 0) + gp.right - (actionPressed('left') ? 1 : 0) - gp.left, -1, 1),
    stabilize: actionPressed('stabilize') || gp.stabilize,
    restart: actionPressed('restart') || gp.restart,
  };
}

function disturbanceEffect(level, drone, t) {
  let fx = 0, fy = 0, torque = 0;
  const names = [];
  const windScale = state.mission.disturbanceOverrides.wind;
  const turbulenceScale = state.mission.disturbanceOverrides.turbulence;
  if (level.globalWind) {
    const w = level.globalWind;
    fx += (w.baseX + Math.sin(t * w.speed) * w.gustX + Math.sin(t * w.speed * 2.2) * w.gustX * 0.25) * windScale;
    fy += (Math.cos(t * w.speed * 1.3) * w.gustY) * windScale;
    names.push('Gusting wind');
  }
  for (const z of level.windZones || []) {
    if (rectContains(z, drone.pos.x, drone.pos.y)) {
      fx += z.forceX * z.intensity * windScale;
      fy += z.forceY * z.intensity * windScale;
      names.push('Wind lane');
    }
  }
  for (const z of level.turbulenceZones || []) {
    if (rectContains(z, drone.pos.x, drone.pos.y)) {
      fx += Math.sin(t * 7 + drone.pos.y * 0.01) * z.intensity * turbulenceScale;
      fy += Math.cos(t * 9 + drone.pos.x * 0.01) * z.intensity * turbulenceScale;
      torque += Math.sin(t * 11 + drone.pos.x * 0.02) * 0.02 * z.intensity * turbulenceScale;
      names.push('Turbulence');
    }
  }
  if (state.mission.disturbanceOverrides.imbalance || level.imbalance) {
    torque += ((state.mission.disturbanceOverrides.imbalance || level.imbalance || 0) * 1.8);
    names.push('Payload imbalance');
  }
  return { fx, fy, torque, names };
}

function stepDrone(dt) {
  const drone = state.drone;
  const tuning = getTuning();
  const input = currentActionInput();
  if (input.restart) initMission(currentLevel(), state.view === 'challenge' ? 'challenge' : state.view === 'sandbox' ? 'sandbox' : 'campaign');
  const level = state.mission.level;
  const d = disturbanceEffect(level, drone, state.simTime);
  const response = 0.7 + tuning.response * 1.9;
  const targetAngle = input.tilt * 0.72;
  const angleError = targetAngle - drone.angle;
  const dampingFactor = 1.8 + tuning.d * 3.6 + tuning.damping * 1.4;
  const assistStrength = tuning.assist * (input.stabilize ? 1.5 : 1);
  const attitudeTorque = angleError * (4 + tuning.p * 8) * response - drone.angularVelocity * dampingFactor - drone.angle * assistStrength * 0.7;
  drone.torque = lerp(drone.torque, attitudeTorque + d.torque, clamp(dt * 8 * (1 - tuning.smoothing * 0.7), 0, 1));
  drone.angularVelocity += drone.torque * dt;
  drone.angularVelocity = clamp(drone.angularVelocity, -3.8, 3.8);
  drone.angle += drone.angularVelocity * dt;

  const thrustTarget = input.thrust * (input.stabilize ? 1.06 : 1);
  drone.motor = lerp(drone.motor, thrustTarget, clamp(dt * 5 * (1 - tuning.smoothing * 0.6), 0, 1));
  const thrust = 340 * drone.motor;
  const ax = Math.sin(drone.angle) * thrust + d.fx - drone.vel.x * (1.5 + tuning.damping * 1.4);
  const ay = -Math.cos(drone.angle) * thrust + d.fy + 190 - drone.vel.y * (1.15 + tuning.damping * 1.15);
  drone.vel.x += ax * dt;
  drone.vel.y += ay * dt;
  const speed = length(drone.vel.x, drone.vel.y);
  const maxSpeed = 290 + tuning.response * 120;
  if (speed > maxSpeed) {
    const s = maxSpeed / speed;
    drone.vel.x *= s;
    drone.vel.y *= s;
  }
  drone.pos.x += drone.vel.x * dt;
  drone.pos.y += drone.vel.y * dt;
  drone.battery = clamp(drone.battery - dt * (1.1 + thrustTarget * 2.4 + speed * 0.003), 0, 100);
  drone.disturbanceNames = d.names;
  drone.debug = { thrust, windX: d.fx, windY: d.fy, torque: drone.torque, inputTilt: input.tilt };
  drone.telemetry.angle.push(drone.angle);
  drone.telemetry.angVel.push(drone.angularVelocity);
  drone.telemetry.thrust.push(drone.motor);
  drone.telemetry.wind.push(Math.hypot(d.fx, d.fy) / 120);
  for (const key of Object.keys(drone.telemetry)) {
    if (drone.telemetry[key].length > 180) drone.telemetry[key].shift();
  }
  state.mission.stats.maxWobble = Math.max(state.mission.stats.maxWobble, Math.abs(drone.angle) * 57.3);
}

function resolveHazards(dt) {
  const level = state.mission.level;
  const drone = state.drone;
  let collided = false;
  for (const h of level.hazards || []) {
    if (!rectContains(h, drone.pos.x, drone.pos.y)) continue;
    if (h.type === 'floor') {
      drone.pos.y = h.y - 2;
      if (drone.vel.y > 30) impactDamage(Math.abs(drone.vel.y) * 0.18, 'Hard landing');
      drone.vel.y *= -0.18;
      drone.vel.x *= 0.9;
      collided = true;
    }
    if (h.type === 'damage') {
      drone.damage = clamp(drone.damage + h.damage * dt, 0, 100);
    }
    if (h.type === 'payloadRisk' && drone.payload != null) {
      drone.payload = clamp(drone.payload - h.damage * dt, 0, 100);
      if (drone.payload <= 0) failMission('Fragile payload broke.');
    }
    if (h.type === 'lethal') failMission('Entered lethal hazard.');
    if (h.type === 'noFly') failMission('Entered no-fly zone.');
  }
  for (const o of level.obstacles || []) {
    if (!rectContains(o, drone.pos.x, drone.pos.y)) continue;
    const cx = o.x + o.w / 2;
    const cy = o.y + o.h / 2;
    const dx = drone.pos.x - cx;
    const dy = drone.pos.y - cy;
    if (Math.abs(dx / o.w) > Math.abs(dy / o.h)) {
      drone.vel.x *= -0.3;
      drone.pos.x = dx > 0 ? o.x + o.w + 8 : o.x - 8;
      impactDamage(Math.abs(drone.vel.x) * 0.28 + 7, 'Hit obstacle');
    } else {
      drone.vel.y *= -0.25;
      drone.pos.y = dy > 0 ? o.y + o.h + 8 : o.y - 8;
      impactDamage(Math.abs(drone.vel.y) * 0.24 + 6, 'Hit obstacle');
    }
    collided = true;
  }
  drone.pos.x = clamp(drone.pos.x, 18, 1262);
  drone.pos.y = clamp(drone.pos.y, 14, 638);
  if (drone.battery <= 0) failMission('Battery depleted.');
  if (drone.damage >= 100) failMission('Drone destroyed.');
  if (collided) state.mission.stats.collisions += 1;
}

function impactDamage(amount, reason) {
  state.mission.stats.impacts += 1;
  state.drone.damage = clamp(state.drone.damage + amount, 0, 100);
  warningBox.classList.add('warning');
  addParticles(state.drone.pos.x, state.drone.pos.y, 10, '#ff5d73');
  beep(240 + Math.random() * 50, 0.04, 0.03);
  if (state.drone.payload != null) state.drone.payload = clamp(state.drone.payload - amount * 0.7, 0, 100);
  if (state.drone.payload === 0) failMission('Fragile payload broke.');
  if (state.drone.damage >= 100) failMission(reason);
}

function updateObjective(dt) {
  const obj = state.mission.level.objective;
  const drone = state.drone;
  if (!obj || state.mission.failed || state.mission.complete) return;
  let target = null;
  if (obj.type === 'reach' || obj.type === 'payload') {
    target = { x: obj.x, y: obj.y };
    if (dist(drone.pos, target) <= obj.radius) completeMission();
  }
  if (obj.type === 'hold') {
    target = { x: obj.x, y: obj.y };
    const inside = dist(drone.pos, target) <= obj.radius;
    state.mission.holdProgress = clamp(state.mission.holdProgress + (inside ? dt : -dt * 0.8), 0, obj.holdTime);
    if (inside) samplePrecision(target, obj.radius);
    if (state.mission.holdProgress >= obj.holdTime) completeMission();
  }
  if (obj.type === 'hold-chain' || obj.type === 'inspect') {
    const points = obj.points;
    const idx = obj.type === 'inspect' ? state.mission.inspectIndex : state.mission.checkpointIndex;
    if (idx >= points.length) return completeMission();
    target = points[idx];
    const inside = dist(drone.pos, target) <= obj.radius;
    state.mission.holdProgress = clamp(state.mission.holdProgress + (inside ? dt : -dt * 1.2), 0, obj.holdTime);
    if (inside) samplePrecision(target, obj.radius);
    if (state.mission.holdProgress >= obj.holdTime) {
      state.mission.holdProgress = 0;
      if (obj.type === 'inspect') state.mission.inspectIndex += 1;
      else state.mission.checkpointIndex += 1;
      state.progressIndex += 1;
      if ((obj.type === 'inspect' ? state.mission.inspectIndex : state.mission.checkpointIndex) >= points.length) completeMission();
    }
  }
  if (obj.type === 'checkpoints') {
    const points = obj.points;
    const idx = state.mission.checkpointIndex;
    if (idx >= points.length) return completeMission();
    target = points[idx];
    if (dist(drone.pos, target) <= obj.radius) {
      samplePrecision(target, obj.radius);
      state.mission.checkpointIndex += 1;
      state.progressIndex += 1;
      if (state.mission.checkpointIndex >= points.length) completeMission();
    }
  }
  if (obj.type === 'sandbox') {
    state.mission.score = 0;
  }
  state.mission.target = target;
}

function samplePrecision(target, radius) {
  const p = 1 - clamp(dist(state.drone.pos, target) / radius, 0, 1);
  state.mission.stats.avgPrecision += p;
  state.mission.stats.precisionSamples += 1;
}

function updateTutorialPrompts() {
  const prompts = state.mission.tutorialPrompts;
  if (!prompts.length) return;
  const current = prompts[state.mission.promptIndex];
  if (current?.until?.(state)) {
    state.mission.promptIndex = Math.min(state.mission.promptIndex + 1, prompts.length - 1);
    updatePrompt();
  }
}

function addParticles(x, y, count, color) {
  for (let i = 0; i < count; i++) {
    state.particles.push({ x, y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, life: 0.5 + Math.random() * 0.5, color });
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter(p => (p.life -= dt) > 0);
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 45 * dt;
  }
}

function updateAudio() {
  if (!audio.enabled || !audio.ctx || !state.drone) return;
  const speed = length(state.drone.vel.x, state.drone.vel.y);
  const wind = Math.hypot(state.drone.debug.windX, state.drone.debug.windY);
  audio.motorOsc.frequency.value = 110 + state.drone.motor * 200 + speed * 0.2;
  audio.motorGain.gain.value = 0.03 + state.drone.motor * 0.06;
  audio.windOsc.frequency.value = 180 + wind * 0.7;
  audio.windGain.gain.value = 0.005 + clamp(wind / 1200, 0, 0.06);
  if ((state.drone.damage > 70 || state.drone.battery < 18 || Math.abs(state.drone.angle) > 0.9) && audio.ctx.currentTime - audio.lastWarn > 1.2) {
    audio.lastWarn = audio.ctx.currentTime;
    beep(660, 0.08, 0.02);
  }
}

function ensureAudio() {
  if (audio.enabled) return;
  try {
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.master = audio.ctx.createGain();
    audio.master.gain.value = 0.18;
    audio.master.connect(audio.ctx.destination);
    audio.motorOsc = audio.ctx.createOscillator();
    audio.motorGain = audio.ctx.createGain();
    audio.motorGain.gain.value = 0.02;
    audio.motorOsc.type = 'sawtooth';
    audio.motorOsc.connect(audio.motorGain).connect(audio.master);
    audio.motorOsc.start();
    audio.windOsc = audio.ctx.createOscillator();
    audio.windGain = audio.ctx.createGain();
    audio.windGain.gain.value = 0.005;
    audio.windOsc.type = 'triangle';
    audio.windOsc.connect(audio.windGain).connect(audio.master);
    audio.windOsc.start();
    audio.enabled = true;
  } catch {}
}

function beep(freq, duration, gain) {
  if (!audio.ctx) return;
  const osc = audio.ctx.createOscillator();
  const g = audio.ctx.createGain();
  osc.frequency.value = freq;
  osc.type = 'square';
  g.gain.value = gain;
  osc.connect(g).connect(audio.master);
  osc.start();
  osc.stop(audio.ctx.currentTime + duration);
}

function updateHUD() {
  const level = state.mission.level;
  const obj = level.objective;
  let objectiveText = level.name;
  if (obj.type === 'reach') objectiveText += ' · Reach extraction';
  if (obj.type === 'payload') objectiveText += ` · Deliver payload ${Math.round(state.drone.payload)}%`;
  if (obj.type === 'hold') objectiveText += ` · Hold ${(obj.holdTime - state.mission.holdProgress).toFixed(1)}s`;
  if (obj.type === 'checkpoints') objectiveText += ` · Checkpoint ${Math.min(state.mission.checkpointIndex + 1, obj.points.length)}/${obj.points.length}`;
  if (obj.type === 'hold-chain') objectiveText += ` · Hover gate ${Math.min(state.mission.checkpointIndex + 1, obj.points.length)}/${obj.points.length}`;
  if (obj.type === 'inspect') objectiveText += ` · Scan ${Math.min(state.mission.inspectIndex + 1, obj.points.length)}/${obj.points.length}`;
  if (obj.type === 'sandbox') objectiveText += ' · Free flight';
  objectiveBox.textContent = objectiveText;
  timerBox.textContent = `Time ${state.mission.time.toFixed(1)}s ${state.running ? '' : '· paused'}`;
  scoreBox.textContent = `Score ${Math.round(calculateScore())}`;
  const speed = length(state.drone.vel.x, state.drone.vel.y);
  statusBox.innerHTML = `Speed ${speed.toFixed(0)} · Damage <span class="${state.drone.damage > 60 ? 'bad' : state.drone.damage > 30 ? 'warn' : 'good'}">${state.drone.damage.toFixed(0)}%</span> · Wobble ${Math.abs(state.drone.angle * 57.3).toFixed(0)}°`;
  batteryBox.innerHTML = `Battery <span class="${state.drone.battery < 20 ? 'bad' : state.drone.battery < 40 ? 'warn' : 'good'}">${state.drone.battery.toFixed(0)}%</span><div class="progress"><div style="width:${state.drone.battery}%"></div></div>`;
  const warnings = [];
  if (state.drone.disturbanceNames.length) warnings.push(state.drone.disturbanceNames.join(', '));
  if (state.drone.damage > 60) warnings.push('Structural damage high');
  if (state.drone.payload != null && state.drone.payload < 40) warnings.push('Payload at risk');
  if (Math.abs(state.drone.angle) > 0.9) warnings.push('Instability risk');
  if (state.drone.battery < 18) warnings.push('Low battery');
  warningBox.textContent = warnings[0] || 'Systems nominal';
  overlay.textContent = state.mission.failed ? state.mission.failReason : state.mission.complete ? 'Objective complete.' : '';
}

function draw() {
  const level = state.mission.level;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(level.theme);
  drawDisturbances(level);
  drawHazards(level);
  drawObjective(level.objective);
  drawDrone();
  drawParticles();
}

function drawBackground(theme) {
  const gradients = {
    lab: ['#08111a', '#112237'],
    roof: ['#07131f', '#17324d'],
    canyon: ['#20140d', '#4a2817'],
    factory: ['#0c1317', '#253843'],
    storm: ['#0b1020', '#2e3158'],
  };
  const [a, b] = gradients[theme] || gradients.lab;
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 24; i++) {
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = '#fff';
    ctx.fillRect((i * 67 + state.simTime * 8) % canvas.width, (i * 91) % canvas.height, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawHazards(level) {
  for (const h of level.hazards || []) {
    if (h.type === 'floor') { ctx.fillStyle = '#1b2f43'; }
    if (h.type === 'damage') { ctx.fillStyle = 'rgba(255,209,102,0.38)'; }
    if (h.type === 'payloadRisk') { ctx.fillStyle = 'rgba(255,93,115,0.22)'; }
    if (h.type === 'lethal' || h.type === 'noFly') { ctx.fillStyle = 'rgba(255,93,115,0.38)'; }
    ctx.fillRect(h.x, h.y, h.w, h.h);
    if (h.type === 'payloadRisk' || h.type === 'lethal' || h.type === 'noFly') {
      ctx.strokeStyle = h.type === 'payloadRisk' ? '#ffd166' : '#ff5d73';
      ctx.setLineDash([10, 6]);
      ctx.strokeRect(h.x, h.y, h.w, h.h);
      ctx.setLineDash([]);
    }
  }
  ctx.fillStyle = '#2a425d';
  for (const o of level.obstacles || []) ctx.fillRect(o.x, o.y, o.w, o.h);
}

function drawDisturbances(level) {
  for (const z of level.windZones || []) {
    ctx.fillStyle = 'rgba(108,224,255,0.08)';
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = 'rgba(108,224,255,0.5)';
    ctx.strokeRect(z.x, z.y, z.w, z.h);
    for (let y = z.y + 24; y < z.y + z.h; y += 40) {
      for (let x = z.x + 12; x < z.x + z.w; x += 60) drawArrow(x, y, x + z.forceX * 0.18, y + z.forceY * 0.18, '#6ce0ff');
    }
  }
  for (const z of level.turbulenceZones || []) {
    ctx.fillStyle = 'rgba(114,241,184,0.06)';
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = 'rgba(114,241,184,0.4)';
    ctx.strokeRect(z.x, z.y, z.w, z.h);
    for (let i = 0; i < 9; i++) {
      const x = z.x + (i * 61 + state.simTime * 35) % z.w;
      const y = z.y + 28 + (Math.sin(state.simTime * 2 + i) * 0.5 + 0.5) * (z.h - 56);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(114,241,184,0.45)';
      ctx.arc(x, y, 12 + Math.sin(state.simTime * 4 + i) * 4, 0, Math.PI * 1.5);
      ctx.stroke();
    }
  }
  if (level.globalWind) {
    for (let i = 0; i < 14; i++) {
      const x = (i * 120 + state.simTime * 40) % (canvas.width + 80) - 40;
      const y = 90 + i * 38;
      drawArrow(x, y, x + 40 + Math.sin(state.simTime + i) * 15, y + Math.cos(state.simTime * 1.2 + i) * 8, 'rgba(255,255,255,0.22)');
    }
  }
}

function drawArrow(x1, y1, x2, y2, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const a = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(a - 0.4) * 8, y2 - Math.sin(a - 0.4) * 8);
  ctx.lineTo(x2 - Math.cos(a + 0.4) * 8, y2 - Math.sin(a + 0.4) * 8);
  ctx.closePath();
  ctx.fill();
}

function drawObjective(obj) {
  if (!obj || obj.type === 'sandbox') return;
  let target = state.mission.target;
  if (!target && (obj.type === 'reach' || obj.type === 'payload' || obj.type === 'hold')) target = { x: obj.x, y: obj.y };
  if (!target && (obj.type === 'checkpoints' || obj.type === 'hold-chain')) target = obj.points[state.mission.checkpointIndex];
  if (!target && obj.type === 'inspect') target = obj.points[state.mission.inspectIndex];
  if (!target) return;
  ctx.strokeStyle = '#6ce0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(target.x, target.y, obj.radius || 40, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(target.x, target.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = '#6ce0ff';
  ctx.fill();
  drawArrow(state.drone.pos.x, state.drone.pos.y, lerp(state.drone.pos.x, target.x, 0.18), lerp(state.drone.pos.y, target.y, 0.18), 'rgba(108,224,255,0.35)');
}

function drawDrone() {
  const d = state.drone;
  ctx.save();
  ctx.translate(d.pos.x, d.pos.y);
  ctx.rotate(d.angle);
  ctx.fillStyle = d.damage > 70 ? '#ff5d73' : '#d8f2ff';
  ctx.fillRect(-18, -8, 36, 16);
  ctx.fillStyle = '#7ac7ff';
  ctx.fillRect(-26, -3, 10, 6);
  ctx.fillRect(16, -3, 10, 6);
  if (d.payload != null) {
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-8, 12, 16, 12);
    ctx.strokeStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(0, 12);
    ctx.stroke();
  }
  const flame = 18 + d.motor * 30;
  ctx.fillStyle = `rgba(108,224,255,${0.35 + d.motor * 0.45})`;
  ctx.beginPath();
  ctx.moveTo(-8, 8);
  ctx.lineTo(0, flame);
  ctx.lineTo(8, 8);
  ctx.fill();
  if (Math.abs(d.angle) > 0.9) {
    ctx.strokeStyle = 'rgba(255,93,115,0.8)';
    ctx.beginPath();
    ctx.arc(0, 0, 28 + Math.sin(state.simTime * 18) * 4, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles() {
  for (const p of state.particles) {
    ctx.globalAlpha = clamp(p.life, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function drawTelemetry() {
  telemetryCanvas.style.display = state.telemetryVisible ? 'block' : 'none';
  if (!state.telemetryVisible || !state.drone) return;
  tctx.clearRect(0, 0, telemetryCanvas.width, telemetryCanvas.height);
  tctx.fillStyle = 'rgba(7,16,25,.92)';
  tctx.fillRect(0, 0, telemetryCanvas.width, telemetryCanvas.height);
  tctx.strokeStyle = '#28425e';
  tctx.strokeRect(0, 0, telemetryCanvas.width, telemetryCanvas.height);
  tctx.fillStyle = '#8ea7c1';
  tctx.font = '12px sans-serif';
  tctx.fillText('Angle / Angular Velocity', 10, 14);
  graphLine(state.drone.telemetry.angle, '#6ce0ff', 8, 80, 1.5);
  graphLine(state.drone.telemetry.angVel, '#72f1b8', 8, 80, 0.35);
  tctx.fillText('Thrust / Wind', 10, 102);
  graphLine(state.drone.telemetry.thrust, '#ffd166', 8, 168, 0.8);
  graphLine(state.drone.telemetry.wind, '#ff5d73', 8, 168, 0.9);
  tctx.fillStyle = '#e7f0fb';
  tctx.fillText(`Tilt input ${state.drone.debug.inputTilt.toFixed(2)}`, 200, 18);
  tctx.fillText(`Wind ${Math.hypot(state.drone.debug.windX, state.drone.debug.windY).toFixed(0)}`, 200, 34);
  tctx.fillText(`P ${getTuning().p.toFixed(2)} D ${getTuning().d.toFixed(2)}`, 200, 50);
}

function graphLine(values, color, x, y, scale) {
  if (!values.length) return;
  tctx.strokeStyle = color;
  tctx.beginPath();
  values.forEach((v, i) => {
    const px = x + i * 1.6;
    const py = y - v * 34 * scale;
    if (i === 0) tctx.moveTo(px, py);
    else tctx.lineTo(px, py);
  });
  tctx.stroke();
}

function renderMenu() {
  const medals = totalCampaignMedals();
  if (state.view === 'campaign') {
    menuPanel.innerHTML = `<h2>Campaign</h2><div class="stack">${LEVELS.map(level => {
      const unlocked = isLevelUnlocked(level);
      const progress = state.profile.missions[level.id];
      return `<button class="${state.selectedLevelId === level.id ? 'active ' : ''}${unlocked ? '' : 'locked'}" data-level="${level.id}" ${unlocked ? '' : 'disabled'}>
        <div>${level.name}</div>
        <div class="tiny">${progress?.medalName || 'Locked'} · Need ${level.unlockCost} medals · ${level.description}</div>
      </button>`;
    }).join('')}</div><p class="tiny">Campaign medals: ${medals}. Completing missions unlocks telemetry, tuning, and sandbox.</p>`;
    menuPanel.querySelectorAll('[data-level]').forEach(btn => btn.onclick = () => { state.selectedLevelId = btn.dataset.level; initMission(levelById(state.selectedLevelId), 'campaign'); renderMenu(); });
  }
  if (state.view === 'challenge') {
    menuPanel.innerHTML = `<h2>Challenge Mode</h2><div class="stack">${CHALLENGES.map(ch => {
      const best = state.profile.challengeBests[ch.id];
      return `<button class="${state.selectedChallengeId === ch.id ? 'active' : ''}" data-challenge="${ch.id}">
        <div>${ch.name}</div>
        <div class="tiny">${ch.description} · Best ${best?.bestScore || 0}</div>
      </button>`;
    }).join('')}</div>`;
    menuPanel.querySelectorAll('[data-challenge]').forEach(btn => btn.onclick = () => { state.selectedChallengeId = btn.dataset.challenge; initMission(currentLevel(), 'challenge'); renderMenu(); });
  }
  if (state.view === 'sandbox') {
    const o = state.mission?.disturbanceOverrides || { wind: 1, turbulence: 1, imbalance: 0 };
    menuPanel.innerHTML = `
      <h2>Sandbox Lab</h2>
      <label>Wind intensity</label><input id="sb-wind" type="range" min="0" max="2" step="0.05" value="${o.wind}">
      <label>Turbulence intensity</label><input id="sb-turb" type="range" min="0" max="2" step="0.05" value="${o.turbulence}">
      <label>Imbalance torque</label><input id="sb-imb" type="range" min="0" max="0.2" step="0.01" value="${o.imbalance}">
      <div class="row"><button id="sb-reset">Reset drone</button><button id="sb-env">Reset defaults</button></div>
      <p class="tiny">Use telemetry and tuning to compare stable versus agile control.</p>
      ${renderTuningPanel(true)}
    `;
    document.getElementById('sb-wind').oninput = e => state.mission.disturbanceOverrides.wind = +e.target.value;
    document.getElementById('sb-turb').oninput = e => state.mission.disturbanceOverrides.turbulence = +e.target.value;
    document.getElementById('sb-imb').oninput = e => state.mission.disturbanceOverrides.imbalance = +e.target.value;
    document.getElementById('sb-reset').onclick = () => initMission(SANDBOX_LEVEL, 'sandbox');
    document.getElementById('sb-env').onclick = () => { initMission(SANDBOX_LEVEL, 'sandbox'); renderMenu(); };
    bindTuningPanel();
  }
  if (state.view === 'settings') {
    menuPanel.innerHTML = `
      <h2>Controls & Tuning</h2>
      <div class="stack">${ACTIONS.map(action => `<div class="bind-row"><span>${action}</span><button class="inline" data-bind="${action}">${state.waitingForBind === action ? 'Press key...' : formatKey(state.binds[action])}</button></div>`).join('')}</div>
      <label>Gamepad deadzone</label><input id="deadzone" type="range" min="0.05" max="0.35" step="0.01" value="${state.profile.settings.deadzone}">
      <p class="tiny">Restart and telemetry are designed for fast retries.</p>
      ${renderTuningPanel(state.profile.unlockedFeatures.tuning)}
      <div class="row"><button id="preset-reco">Recommended preset</button><button id="preset-agile">High agility</button></div>
      <button id="preset-stable">Stable trainer</button>
    `;
    menuPanel.querySelectorAll('[data-bind]').forEach(btn => btn.onclick = () => { state.waitingForBind = btn.dataset.bind; renderMenu(); });
    document.getElementById('deadzone').oninput = e => { state.profile.settings.deadzone = +e.target.value; saveProfile(); };
    document.getElementById('preset-reco').onclick = () => applyPreset('recommended');
    document.getElementById('preset-agile').onclick = () => applyPreset('agile');
    document.getElementById('preset-stable').onclick = () => applyPreset('stable');
    bindTuningPanel();
  }
}

function renderTuningPanel(unlocked) {
  const t = getTuning();
  if (!unlocked) return `<div class="list-card">Advanced tuning unlocks after early campaign missions.</div>`;
  return `
    <div class="panel small" style="margin-top:12px; margin-bottom:0;">
      <h2>Tuning</h2>
      <label>Assist strength <span class="tiny">More help, less wobble</span></label><input data-tune="assist" type="range" min="0" max="1" step="0.01" value="${t.assist}">
      <label>Angular damping <span class="tiny">Slower correction, safer hover</span></label><input data-tune="damping" type="range" min="0" max="1" step="0.01" value="${t.damping}">
      <label>Response speed <span class="tiny">Faster correction, more wobble risk</span></label><input data-tune="response" type="range" min="0.1" max="1" step="0.01" value="${t.response}">
      <label>P gain <span class="tiny">Correction force</span></label><input data-tune="p" type="range" min="0.1" max="1" step="0.01" value="${t.p}">
      <label>D gain <span class="tiny">Oscillation damping</span></label><input data-tune="d" type="range" min="0" max="1" step="0.01" value="${t.d}">
      <label>Output smoothing <span class="tiny">Motor lag feel</span></label><input data-tune="smoothing" type="range" min="0" max="0.8" step="0.01" value="${t.smoothing}">
      <div class="row"><button id="save-custom">Save custom</button><button id="reset-tuning">Reset</button></div>
    </div>`;
}

function bindTuningPanel() {
  menuPanel.querySelectorAll('[data-tune]').forEach(el => {
    el.oninput = e => {
      const tune = getTuning();
      tune[e.target.dataset.tune] = +e.target.value;
      tune.preset = 'custom';
      tune.name = 'Custom';
      state.profile.tuning = tune;
      saveProfile();
    };
  });
  const saveBtn = document.getElementById('save-custom');
  if (saveBtn) saveBtn.onclick = () => {
    const current = getTuning();
    state.profile.customPresets = [{ ...current, label: `Custom ${new Date().toLocaleTimeString()}` }, ...(state.profile.customPresets || [])].slice(0, 5);
    saveProfile();
  };
  const resetBtn = document.getElementById('reset-tuning');
  if (resetBtn) resetBtn.onclick = () => applyPreset('recommended');
}

function refreshBindLabels() {
  document.querySelectorAll('[data-bind-label]').forEach(el => {
    el.textContent = formatKey(state.binds[el.dataset.bindLabel]);
  });
}

function switchView(view) {
  state.view = view;
  document.querySelectorAll('[data-view]').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
  if (view === 'sandbox' && !state.profile.unlockedFeatures.sandbox) state.profile.unlockedFeatures.sandbox = true;
  if (view === 'campaign') initMission(levelById(state.selectedLevelId), 'campaign');
  if (view === 'challenge') initMission(currentLevel(), 'challenge');
  if (view === 'sandbox') initMission(SANDBOX_LEVEL, 'sandbox');
  if (view === 'settings' && !state.mission) initMission(levelById(state.selectedLevelId), 'campaign');
  renderMenu();
}

function update(dt) {
  if (!state.mission) return;
  if (state.running && !state.mission.failed && !state.mission.complete) {
    state.simTime += dt;
    state.mission.time += dt;
    stepDrone(dt);
    resolveHazards(dt);
    updateObjective(dt);
    updateTutorialPrompts();
    updateParticles(dt);
  }
  updateHUD();
  updateAudio();
}

let accumulator = 0;
let lastTime = performance.now();
function frame(now) {
  const dtReal = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  accumulator += dtReal;
  while (accumulator >= 1 / 60) {
    update(1 / 60);
    accumulator -= 1 / 60;
  }
  draw();
  drawTelemetry();
  state.justPressed = {};
  requestAnimationFrame(frame);
}

function boot() {
  loadProfile();
  refreshBindLabels();
  setupInput();
  document.querySelectorAll('[data-view]').forEach(btn => btn.onclick = () => switchView(btn.dataset.view));
  telemetryCanvas.style.display = state.telemetryVisible ? 'block' : 'none';
  initMission(levelById(state.selectedLevelId), 'campaign');
  renderMenu();
  requestAnimationFrame(frame);
}

boot();