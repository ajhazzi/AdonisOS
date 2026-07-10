const STORAGE_KEY = "adonis_os_state_v1";
const CLOUD_PIN_KEY = "adonis_os_cloud_pin";
const DEFAULT_PROGRAM_START_DATE = "2026-07-06";
const APP_TIME_ZONE = "America/Vancouver";

const icons = {
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>`,
  dumbbell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V5M16 20v-8M22 20H2"/><path d="m16 8 3-3 3 3"/></svg>`,
  fork: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><path d="M7 3v8M4 3v8M10 3v8M4 11h6M7 11v10M17 3v18M17 3c2.3 2.3 3 4.7 3 8h-3"/></svg>`,
  more: `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M5 20 3 7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3l-2 13z"/><path d="M9 9a3 3 0 0 1 6 0"/><path d="M12 9v3"/></svg>`,
  tape: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8c2-3 10-3 14 0 3 2 3 6 0 8-4 3-12 3-14 0-2-2-2-6 0-8z"/><path d="M7 9v3M11 8v3M15 9v3M18 11v3"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5M20 4v4M20 4h-4"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="m3 19 2-11 5 5 2-8 2 8 5-5 2 11H3Zm1 2h16v2H4v-2Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 13 4 4L19 7"/></svg>`
};

const tvaRoutine = [
  "Standing vacuum: 5 x 30 sec",
  "Dead bug: 3 x 12",
  "Bird dog: 3 x 10",
  "Pallof press: 3 x 12",
  "Side plank: 3 x 30 sec"
];

const habits = [
  { id: "hydration", name: "Hydration", type: "number", target: 4, unit: "L", note: "Water + electrolytes" },
  { id: "sleep", name: "Sleep", type: "number", target: 8, unit: "h", note: "Quality recovery window" },
  { id: "creatine", name: "Creatine", type: "check", note: "Daily saturation" },
  { id: "glutamine", name: "Glutamine", type: "check", note: "Gut + recovery support" },
  { id: "bcaas", name: "BCAA's", type: "check", note: "Training support" },
  { id: "perfectAmino", name: "Perfect Amino", type: "check", note: "Amino protocol" }
];

const workouts = [
  {
    id: "upper-a",
    day: "Monday",
    short: "Upper A",
    name: "Upper A: V-Taper Builder",
    icon: "UA",
    focus: "Upper chest, lats, lateral delts, rear delts",
    exercises: [
      ex("incline-db-press", "Incline DB Press", 4, "6-10", 180, "Heavy compound. 1-2 reps in reserve. Add reps until all sets hit 10, then increase load."),
      ex("weighted-pull-ups", "Weighted Pull-Ups", 4, "6-10", 180, "Full hang, chest up. Stop before form breaks."),
      ex("chest-supported-row", "Chest Supported Row", 3, "8-12", 120, "Pull toward lower ribs. No momentum."),
      ex("cable-lateral-raise", "Cable Lateral Raise", 4, "15-20", 60, "Lead with elbows. Last set can approach failure."),
      ex("reverse-pec-deck", "Reverse Pec Deck", 3, "15-20", 60, "Rear delt focus. Pause in the shortened position."),
      ex("upper-a-finisher", "Incline Curl / Overhead Rope Extension", 2, "10-15", 60, "Alternate weekly: Week A curl, Week B extension.")
    ]
  },
  recovery("Tuesday", "Recovery", "Recovery + Longevity", ["45-60 min Zone 2 walk", "TVA routine 10 min", "Mobility 10-20 min", "Optional pickleball, boxing technique, or walking golf", "Sauna/cold optional"]),
  {
    id: "lower-a",
    day: "Wednesday",
    short: "Lower A",
    name: "Lower A: Glutes & Posterior Chain",
    icon: "LA",
    focus: "Glutes, hamstrings, calves, carries",
    exercises: [
      ex("romanian-deadlift", "Romanian Deadlift", 4, "6-8", 180, "Hips back, neutral spine. Heavy compound, 1-2 reps in reserve."),
      ex("hip-thrust", "Hip Thrust", 4, "8-10", 120, "Two-second pause. Ribs down, full lockout."),
      ex("bulgarian-split-squat", "Bulgarian Split Squat", 3, "8-10/leg", 120, "Forward torso lean for glutes. Controlled descent."),
      ex("seated-ham-curl", "Seated Ham Curl", 3, "10-12", 90, "Full squeeze and controlled stretch."),
      ex("standing-calf-raise", "Standing Calf Raise", 4, "12-15", 75, "Deep stretch. Pause at top."),
      ex("farmer-carry", "Farmer Carry", 3, "rounds", 90, "Brace hard. Tall posture.")
    ]
  },
  recovery("Thursday", "Recovery", "Recovery + Athleticism", ["45-60 min Zone 2 walk", "TVA routine 10 min", "Mobility 10-20 min", "Optional pickleball, boxing technique, or walking golf", "Sauna/cold optional"]),
  {
    id: "upper-b",
    day: "Friday",
    short: "Upper B",
    name: "Upper B: Density & Arms",
    icon: "UB",
    focus: "Chest/back density, delts, arms",
    exercises: [
      ex("flat-db-press", "Flat DB Press", 4, "8-10", 180, "Strong press, clean reps. No shoulder crank."),
      ex("one-arm-cable-row", "One Arm Cable Row", 4, "10/side", 120, "Drive elbow toward hip for lat."),
      ex("lat-pulldown", "Lat Pulldown", 3, "10-12", 120, "Full stretch, chest up."),
      ex("machine-lateral-raise", "Machine Lateral Raise", 4, "15-20", 60, "Pump work. Last set near failure."),
      ex("rear-delt-fly", "Rear Delt Fly", 3, "15-20", 60, "Sweep wide. Keep traps quiet."),
      ex("upper-b-finisher", "Hammer Curl / Rope Pushdown", 2, "10-12", 60, "Alternate weekly. Beat last week by one rep.")
    ]
  },
  {
    id: "lower-b",
    day: "Saturday",
    short: "Lower B",
    name: "Lower B: Athletic Power",
    icon: "LB",
    focus: "Quads, glutes, athletic engine",
    exercises: [
      ex("front-squat", "Front Squat", 4, "6-8", 180, "Tall torso. Brace. Clean reps."),
      ex("walking-lunges", "Walking Lunges", 3, "20 steps", 120, "Long stride, controlled."),
      ex("leg-press", "Leg Press", 3, "12-15", 120, "Feet high enough to hit glutes."),
      ex("glute-bridge", "Glute Bridge", 4, "10-12", 120, "Pause and squeeze hard."),
      ex("seated-calf-raise", "Seated Calf Raise", 4, "15", 75, "Stretch, pause, full range."),
      ex("sled-push", "Sled Push", 6, "rounds", 90, "Powerful, repeatable efforts.")
    ]
  },
  recovery("Sunday", "Recovery", "Full Recovery + Check-In", ["45-60 min Zone 2 walk", "TVA routine 10 min", "Mobility 10-20 min", "Progress photos: front, side, back", "Sunday check-in: weight, waist, photos, 7-day average"])
];

function ex(id, name, sets, reps, restSec, cue) {
  return { id, name, sets, reps, restSec, cue };
}

function recovery(day, short, name, items) {
  return { id: day.toLowerCase(), day, short, name, rest: true, items };
}

const defaultState = {
  settings: {
    week: 1,
    startDate: DEFAULT_PROGRAM_START_DATE,
    calorieTarget: 2700,
    proteinTarget: 200,
    carbTarget: 275,
    fatTarget: 75,
    weeklyIncrease: 125,
    maintenanceGoal: 3000,
    waistGuardrail: 34
  },
  workoutLogs: [],
  exerciseHistory: {},
  progressLogs: [
    entryDaysAgo(8, { weight: 181.2, waist: 33.7, shoulders: 47.0, arms: 15.4, biceps: 15.4, hips: 40.0, thighs: 23.0, neck: 16.0, calves: 15.0, bodyFat: 11.6, leanMass: 160.2, source: "Manual", notes: "Baseline check." }),
    entryDaysAgo(1, { weight: 180.0, waist: 33.4, shoulders: 47.2, arms: 15.6, biceps: 15.6, hips: 40.1, thighs: 23.1, neck: 16.1, calves: 15.1, bodyFat: 11.1, leanMass: 160.0, source: "Manual", notes: "On track. Waist moving right." })
  ],
  morningWeights: [
    entryDaysAgo(8, { weight: 181.2, notes: "Baseline morning weight." }),
    entryDaysAgo(1, { weight: 180.0, notes: "Morning weigh-in." })
  ],
  nutritionLogs: {},
  nutritionDay: todayIso(),
  savedMeals: [],
  habitLogs: {},
  coachMessages: [
    {
      role: "coach",
      text: "I am Coach Valentina. I am here to get you to the Adonis build, not pat your head while the waist creeps up. Log honestly, train hard, and I will tell you what the data says.",
      createdAt: new Date().toISOString()
    }
  ],
  activeWorkout: null
};

let state = loadState();
let currentScreen = "home";
let selectedWorkoutId = "upper-a";
let activeTick = null;
let toastTimer = null;
let cloudSyncTimer = null;
let cloudStatus = "Local mode";
let currentLocalDate = todayIso();
let dateRolloverTimer = null;

const app = document.querySelector("#app");

init();

function init() {
  renderShell();
  route(state.activeWorkout ? "active" : "home");
  startDateRolloverWatch();
  registerServiceWorker();
  if (getCloudPin()) pullCloudState(false);
}

function renderShell() {
  app.innerHTML = `
    <div class="app">
      <header class="topbar">
        <button class="icon-button" data-action="open-more" aria-label="Open menu">${icons.menu}</button>
        <div class="brand">ADONIS <span>OS</span></div>
        <button class="icon-button active-dot" data-action="coach-note" aria-label="Coach note">${icons.bell}</button>
      </header>
      <main>
        <section id="screen-home" class="screen"></section>
        <section id="screen-workouts" class="screen"></section>
        <section id="screen-detail" class="screen"></section>
        <section id="screen-active" class="screen"></section>
        <section id="screen-progress" class="screen"></section>
        <section id="screen-nutrition" class="screen"></section>
        <section id="screen-coach" class="screen"></section>
        <section id="screen-more" class="screen"></section>
      </main>
    </div>
    <nav class="bottom-nav" aria-label="Primary">
      <div class="bottom-nav-inner">
        ${navItem("home", "Home", icons.home)}
        ${navItem("workouts", "Workouts", icons.dumbbell)}
        ${navItem("progress", "Progress", icons.chart)}
        ${navItem("nutrition", "Nutrition", icons.fork)}
        ${navItem("more", "More", icons.more)}
      </div>
    </nav>
    <div id="set-modal" class="modal" role="dialog" aria-modal="true"></div>
    <div id="toast" class="toast"></div>
  `;

  app.addEventListener("click", handleClick);
  app.addEventListener("submit", handleSubmit);
  document.querySelector(".bottom-nav").addEventListener("click", handleClick);
  document.querySelector("#set-modal").addEventListener("click", handleClick);
}

function navItem(id, label, icon) {
  return `<button class="nav-item" data-route="${id}" aria-label="${label}">${icon}<span>${label}</span></button>`;
}

function handleClick(event) {
  const routeButton = event.target.closest("[data-route]");
  const actionButton = event.target.closest("[data-action]");
  const workoutButton = event.target.closest("[data-workout-id]");
  const weekButton = event.target.closest("[data-week]");
  const logButton = event.target.closest("[data-log-set]");
  const editSetButton = event.target.closest("[data-edit-set]");
  const editExerciseButton = event.target.closest("[data-edit-exercise]");
  const removeFoodButton = event.target.closest("[data-remove-food]");
  const savedMealButton = event.target.closest("[data-add-saved-meal]");
  const removeSavedMealButton = event.target.closest("[data-remove-saved-meal]");

  if (routeButton) route(routeButton.dataset.route);
  if (workoutButton) openWorkout(workoutButton.dataset.workoutId);
  if (weekButton) setWeek(Number(weekButton.dataset.week));
  if (logButton) openSetModal(logButton.dataset.logSet);
  if (editSetButton) openSetModal(editSetButton.dataset.exerciseId, Number(editSetButton.dataset.editSet));
  if (editExerciseButton) openExerciseModal(editExerciseButton.dataset.editExercise);
  if (removeFoodButton) removeFood(Number(removeFoodButton.dataset.removeFood));
  if (savedMealButton) addSavedMealToToday(savedMealButton.dataset.addSavedMeal);
  if (removeSavedMealButton) removeSavedMeal(removeSavedMealButton.dataset.removeSavedMeal);
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "start-today") startWorkout(todayWorkout().id);
  if (action === "start-selected") startWorkout(selectedWorkoutId);
  if (action === "pause-workout") pauseWorkout();
  if (action === "resume-workout") resumeWorkout();
  if (action === "finish-workout") finishWorkout();
  if (action === "cancel-workout") cancelWorkout();
  if (action === "close-modal") closeModal();
  if (action === "open-more") route("more");
  if (action === "coach-note") route("coach");
  if (action === "coach-prompt") sendCoachPrompt(actionButton.dataset.prompt || "");
  if (action === "clear-coach") clearCoach();
  if (action === "cloud-pull") pullCloudState(true);
  if (action === "cloud-push") pushCloudState(true);
  if (action === "reset-data") resetData();
}

function handleSubmit(event) {
  event.preventDefault();
  const form = event.target;
  if (form.id === "set-form") {
    const setData = event.submitter ? new FormData(form, event.submitter) : new FormData(form);
    saveSet(setData);
  }
  if (form.id === "exercise-form") saveExerciseEdit(new FormData(form));
  if (form.id === "progress-form") saveProgress(new FormData(form));
  if (form.id === "shapescale-form") importShapeScale(new FormData(form));
  if (form.id === "food-form") saveFood(new FormData(form));
  if (form.id === "meal-label-form") scanMealLabel(new FormData(form));
  if (form.id === "settings-form") saveSettings(new FormData(form));
  if (form.id === "cloud-form") saveCloudSettings(new FormData(form));
  if (form.id === "habit-form") saveHabitNumbers(new FormData(form));
  if (form.id === "coach-form") sendCoachMessage(new FormData(form));
}

function route(screen) {
  currentScreen = screen;
  document.querySelectorAll(".screen").forEach((el) => el.classList.toggle("active", el.id === `screen-${screen}`));
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.route === screen));

  if (screen !== "active") stopActiveTick();
  if (screen === "home") renderHome();
  if (screen === "workouts") renderWorkouts();
  if (screen === "active") {
    renderActiveWorkout();
    if (isWorkoutPaused(state.activeWorkout)) stopActiveTick();
    else startActiveTick();
  }
  if (screen === "progress") renderProgress();
  if (screen === "nutrition") renderNutrition();
  if (screen === "coach") renderCoach();
  if (screen === "more") renderMore();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderHome() {
  const screen = byId("screen-home");
  const latest = latestProgress();
  const previous = previousProgress();
  const currentWeight = latestMorningWeight();
  const previousWeight = previousMorningWeight();
  const today = todayWorkout();
  const week = programWeek();
  const completedToday = hasWorkoutOnDate(today.id, todayIso());
  const ratio = ratioText(latest);
  const score = adonisScore(latest);
  const habitScoreToday = habitScore(todayIso());

  screen.innerHTML = `
    <div class="home-hero">
      <img class="hero-img" src="/adonis-hero-clean.png" alt="Adonis OS physique target">
      <div class="hero-vignette"></div>
      <div class="mobile-hero-card">
        <div>
          <span>Week ${week} / 12</span>
          <b>${today.short}</b>
        </div>
        <button class="small-chip" data-action="start-today">${today.rest ? "Recovery" : "Start"}</button>
      </div>
      <div class="hero-copy">
        <div class="eyebrow">Project Adonis</div>
        <h1>12 Week<br><span class="orange">Transformation</span></h1>
        <div class="quote"><span class="quote-mark">“</span>Discipline today.<br>Freedom forever.<div class="signature">AJ Hazzi</div></div>
      </div>
      <div class="week-widget">
        <div class="eyebrow">Week</div>
        <b>${week} <span class="orange">/</span> 12</b>
        <small>DAY ${programDay()}</small>
      </div>
      <div class="today-label"><b>${today.short}</b><span>Today's workout</span></div>
      <div class="measurement-line shoulders"><span class="line-label">Target Shoulders</span><span class="line-value">48.0"</span></div>
      <div class="measurement-line waist"><span class="line-label">Target Waist</span><span class="line-value">33.0"</span></div>
      <div class="goals-panel">
        <h2>Goals</h2>
        ${goalRow(icons.scale, "Weight", "180-182 lbs")}
        ${goalRow(icons.target, "Body Fat", "10-11%")}
        ${goalRow(icons.dumbbell, "Lean Mass", "150+ lbs")}
        ${goalRow(icons.tape, "Waist", "33-33.25\"")}
        ${goalRow(icons.home, "Shoulders", "48\"+")}
      </div>
    </div>
    <div class="mobile-goals section-panel panel">
      <div class="section-head"><h2>Goals</h2><span class="small">Project Adonis</span></div>
      <div class="stats-grid">
        ${statCard("Weight", "180-182 lbs", "Target range")}
        ${statCard("Body Fat", "10-11%", "Lean finish")}
        ${statCard("Lean Mass", "150+ lbs", "Build phase")}
        ${statCard("Waist / Shoulders", "33\" / 48\"+", "Ratio work")}
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head">
        <h2>This Week</h2>
        <button class="link-button" data-route="workouts">View Schedule ›</button>
      </div>
      <div class="week-grid">
        ${workouts.map((day) => dayCard(day, hasWorkoutOnDate(day.id, todayIso()))).join("")}
      </div>
      <button class="button primary" data-action="start-today">${today.rest ? "Open Recovery Day" : completedToday ? "Train Again" : "Start Today's Workout"}</button>
    </div>
    <div class="section-panel panel">
      <div class="section-head">
        <h2>Daily Habits</h2>
        <span class="small">${habitScoreToday}% locked</span>
      </div>
      ${habitPanel(todayIso())}
    </div>
    <div class="section-panel panel">
      <div class="section-head">
        <h2>Progress Overview</h2>
        <button class="link-button" data-route="progress">Edit</button>
      </div>
      <div class="stats-grid">
        ${statCard("Weight", `${fmt(currentWeight.weight)} lbs`, changeText(currentWeight.weight, previousWeight?.weight, "lb"))}
        ${statCard("Waist", `${fmt(latest.waist)}"`, changeText(latest.waist, previous?.waist, "\"", true))}
        ${statCard("Ratio", ratio, "Shoulder-to-waist")}
        ${statCard("Adonis Score", `${score}%`, score >= 80 ? "On Track" : "Build Phase")}
      </div>
    </div>
    <div class="mission panel">
      <div class="crown">${icons.crown}</div>
      <div><b>Mission</b><h2>Best Shape Ever.</h2><p>Stay focused. The standard is unstoppable.</p></div>
      <div class="mission-targets">150 lb lean mass<br>10-11% body fat<br>33" waist</div>
    </div>
  `;
}

function goalRow(icon, label, value) {
  return `<div class="goal-row"><div class="goal-icon">${icon}</div><div><span>${label}</span><b>${value}</b></div></div>`;
}

function dayCard(day, done) {
  const trained = done && !day.rest;
  return `
    <button class="day-card" data-workout-id="${day.id}" aria-label="${day.day} ${day.short}">
      <b>${day.day.slice(0, 3).toUpperCase()}</b>
      <span>${day.short}</span>
      <div class="day-symbol">${day.rest ? "◇" : icons.dumbbell}</div>
      <div class="day-status ${trained ? "done" : ""}">${trained ? "✓" : ""}</div>
    </button>
  `;
}

function renderWorkouts() {
  const screen = byId("screen-workouts");
  const week = programWeek();
  screen.innerHTML = `
    <div class="hero-card">
      <h1>12 Week Plan</h1>
      <p>Four focused 60-minute sessions. Recovery days protect the waist, joints, and nervous system.</p>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Week Selector</h2><span class="small">Current: Week ${week} · Day ${programDay()}</span></div>
      <div class="segmented">${Array.from({ length: 12 }, (_, index) => `<button data-week="${index + 1}" class="${week === index + 1 ? "active" : ""}">W${index + 1}</button>`).join("")}</div>
    </div>
    <div class="workout-list two-col">
      ${workouts.map((workout) => workout.rest ? recoveryCard(workout) : workoutCard(workout)).join("")}
    </div>
  `;
}

function workoutCard(workout) {
  return `
    <button class="workout-card" data-workout-id="${workout.id}">
      <div class="workout-icon">${icons.dumbbell}</div>
      <div>
        <h3>${workout.day} — ${workout.name}</h3>
        <div class="meta">${workout.focus}</div>
        <div class="pills"><span class="pill">60 min</span><span class="pill">${workout.exercises.length} exercises</span><span class="pill">Double progression</span></div>
      </div>
      <div class="chevron">›</div>
    </button>
  `;
}

function recoveryCard(workout) {
  return `
    <div class="workout-card">
      <div class="workout-icon">◇</div>
      <div>
        <h3>${workout.day} — ${workout.name}</h3>
        <ul class="recovery-list">${workout.items.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>
    </div>
  `;
}

function openWorkout(workoutId) {
  selectedWorkoutId = workoutId;
  const workout = getWorkout(workoutId);
  if (workout.rest) {
    renderRecoveryDetail(workout);
  } else {
    renderWorkoutDetail(workout);
  }
  route("detail");
}

function renderWorkoutDetail(workout) {
  byId("screen-detail").innerHTML = `
    <button class="back-button" data-route="workouts">‹ Back to Workouts</button>
    <div class="hero-card">
      <h1>${workout.name}</h1>
      <p>${workout.focus}. Use double progression, keep compounds 1-2 reps in reserve, and let rest periods support performance.</p>
    </div>
    ${workout.exercises.map((exercise) => detailExerciseCard(workout, exercise)).join("")}
    <button class="button primary" data-action="start-selected">Start Workout</button>
  `;
}

function detailExerciseCard(workout, exercise) {
  const last = lastExerciseSets(workout.id, exercise.id);
  return `
    <div class="exercise-card">
      <div class="exercise-head">
        <div>
          <h3>${exercise.name}</h3>
          <div class="meta">${exercise.sets} sets · ${exercise.reps} reps · Rest ${formatRest(exercise.restSec)}</div>
        </div>
      </div>
      <div class="pills">
        <span class="pill">${targetText(last)}</span>
        <span class="pill">${last ? `Last: ${last.map((set) => `${set.weight}x${set.reps}`).join(", ")}` : "No previous log"}</span>
      </div>
      <p class="small">${exercise.cue}</p>
    </div>
  `;
}

function renderRecoveryDetail(workout) {
  byId("screen-detail").innerHTML = `
    <button class="back-button" data-route="workouts">‹ Back to Workouts</button>
    <div class="hero-card">
      <h1>${workout.name}</h1>
      <p>Recovery is programmed. Keep the engine high, the waist tight, and the next lift ready.</p>
    </div>
    <div class="section-panel panel">
      <h2 class="panel-title">Today</h2>
      <ul class="recovery-list">${workout.items.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
    <div class="section-panel panel">
      <h2 class="panel-title">Daily TVA Routine</h2>
      <ul class="recovery-list">${tvaRoutine.map((item) => `<li>${item}</li>`).join("")}</ul>
    </div>
  `;
}

function startWorkout(workoutId) {
  const workout = getWorkout(workoutId);
  if (workout.rest) {
    openWorkout(workoutId);
    return;
  }
  if (state.activeWorkout) {
    selectedWorkoutId = state.activeWorkout.workoutId;
    route("active");
    showToast("Workout already open. Pick up where you left off.");
    return;
  }
  selectedWorkoutId = workoutId;
  renderWorkoutDetail(workout);
  state.activeWorkout = {
    id: crypto.randomUUID(),
    workoutId,
    startedAt: new Date().toISOString(),
    pausedAt: null,
    totalPausedSec: 0,
    restRemainingSec: null,
    exerciseOverrides: {},
    sets: [],
    restEndAt: null
  };
  saveState();
  route("active");
}

function renderActiveWorkout() {
  const active = state.activeWorkout;
  if (!active) {
    byId("screen-active").innerHTML = `<div class="empty">No active workout. Pick a workout to begin.</div>`;
    return;
  }
  const workout = getWorkout(active.workoutId);
  selectedWorkoutId = workout.id;
  const paused = isWorkoutPaused(active);
  const exercises = activeWorkoutExercises(workout, active);
  byId("screen-active").innerHTML = `
    <button class="back-button" data-route="workouts">‹ Workouts</button>
    <div class="timer-block">
      <div class="small">${workout.name}</div>
      <div id="total-timer" class="timer-main">00:00</div>
      <div class="small">${paused ? "Paused" : "Rest Timer"}</div>
      <div id="rest-timer" class="rest-timer">ready</div>
      ${paused ? `<div class="pause-badge">Workout paused. Timers are frozen.</div>` : ""}
    </div>
    ${exercises.map((exercise) => activeExerciseCard(workout, exercise, active)).join("")}
    <div class="button-row">
      <button class="button secondary" data-action="cancel-workout">Cancel</button>
      <button class="button secondary" data-action="${paused ? "resume-workout" : "pause-workout"}">${paused ? "Resume" : "Pause"}</button>
      <button class="button primary" data-action="finish-workout">Finish</button>
    </div>
  `;
  tickTimers();
}

function activeExerciseCard(workout, exercise, active) {
  const sets = active.sets
    .map((set, index) => ({ set, index }))
    .filter((item) => item.set.exerciseId === exercise.id);
  const last = lastExerciseSets(workout.id, exercise.id, { excludeSessionId: active.id });
  return `
    <div class="exercise-card">
      <div class="exercise-head">
        <div>
          <h3>${exercise.name}</h3>
          <div class="meta">${exercise.sets} sets · ${exercise.reps} reps · Rest ${formatRest(exercise.restSec)}</div>
        </div>
        <div class="exercise-actions">
          <button class="small-chip" data-edit-exercise="${exercise.id}">Edit</button>
          <button class="small-chip" data-log-set="${exercise.id}">Log</button>
        </div>
      </div>
      <div class="pills">
        <span class="pill">${targetText(last)}</span>
        <span class="pill">${last ? `Last: ${last.map((set) => `${set.weight}x${set.reps}`).join(", ")}` : "Last: none"}</span>
        <span class="pill">${sets.length}/${exercise.sets} complete</span>
      </div>
      <div class="set-list">
        ${sets.length ? sets.map(({ set, index }, setNumber) => `
          <div class="set-line">
            <span>Set ${setNumber + 1}: ${set.weight} lb × ${set.reps}</span>
            <button class="mini-link" data-edit-set="${index}" data-exercise-id="${exercise.id}">Edit</button>
          </div>
        `).join("") : `<div class="small">No sets logged yet.</div>`}
      </div>
    </div>
  `;
}

function openSetModal(exerciseId, setIndex = null) {
  const active = state.activeWorkout;
  if (!active) return;
  const workout = getWorkout(active.workoutId);
  const exercise = activeExerciseById(workout, active, exerciseId);
  if (!exercise) return;
  const last = lastExerciseSets(workout.id, exercise.id, { excludeSessionId: active.id });
  const editingSet = Number.isInteger(setIndex) ? active.sets[setIndex] : null;
  const suggested = suggestedSetValues(active, workout, exercise, editingSet);
  byId("set-modal").innerHTML = `
    <div class="modal-card">
      <h2>${editingSet ? `Edit ${exercise.name}` : exercise.name}</h2>
      <p class="form-help">${targetText(last)} · Prescribed rest ${formatRest(exercise.restSec)}</p>
      <form id="set-form">
        <input type="hidden" name="exerciseId" value="${exercise.id}">
        <input type="hidden" name="setIndex" value="${editingSet ? setIndex : ""}">
        <div class="field-grid">
          <div class="field"><label>Weight</label><input name="weight" inputmode="decimal" required placeholder="80" value="${suggested.weight ?? ""}"></div>
          <div class="field"><label>Reps</label><input name="reps" inputmode="numeric" required placeholder="10" value="${suggested.reps ?? ""}"></div>
        </div>
        <div class="field" style="margin-top:10px"><label>Notes</label><textarea name="notes" placeholder="Clean reps, +1 next time">${escapeTextarea(suggested.notes || "")}</textarea></div>
        <div class="button-row">
          <button class="button secondary" type="button" data-action="close-modal">Cancel</button>
          <button class="button primary" type="submit" name="saveMode" value="one">${editingSet ? "Update Set" : "Save Set"}</button>
        </div>
        ${editingSet ? "" : `<button class="button secondary full-row-action" type="submit" name="saveMode" value="all">Save All ${exercise.sets} Sets</button>`}
      </form>
    </div>
  `;
  byId("set-modal").classList.add("active");
  byId("set-modal").querySelector("input[name='weight']").focus();
}

function openExerciseModal(exerciseId) {
  const active = state.activeWorkout;
  if (!active) return;
  const workout = getWorkout(active.workoutId);
  const exercise = activeExerciseById(workout, active, exerciseId);
  if (!exercise) return;
  byId("set-modal").innerHTML = `
    <div class="modal-card">
      <h2>Edit Exercise</h2>
      <p class="form-help">This changes the exercise for this workout session only.</p>
      <form id="exercise-form">
        <input type="hidden" name="exerciseId" value="${escapeAttribute(exercise.id)}">
        <div class="field"><label>Exercise Name</label><input name="name" required value="${escapeAttribute(exercise.name)}"></div>
        <div class="field-grid" style="margin-top:10px">
          <div class="field"><label>Sets</label><input name="sets" type="number" inputmode="numeric" min="1" max="12" required value="${exercise.sets}"></div>
          <div class="field"><label>Reps</label><input name="reps" required value="${escapeAttribute(exercise.reps)}"></div>
        </div>
        <div class="field-grid" style="margin-top:10px">
          <div class="field"><label>Rest Seconds</label><input name="restSec" type="number" inputmode="numeric" min="0" step="15" required value="${exercise.restSec}"></div>
          <div class="field"><label>Original</label><input disabled value="${escapeAttribute(baseExerciseById(workout, exercise.id)?.name || exercise.name)}"></div>
        </div>
        <div class="field" style="margin-top:10px"><label>Cue</label><textarea name="cue" placeholder="Form cue or substitution note">${escapeTextarea(exercise.cue || "")}</textarea></div>
        <div class="button-row">
          <button class="button secondary" type="button" data-action="close-modal">Cancel</button>
          <button class="button primary" type="submit">Save Exercise</button>
        </div>
      </form>
    </div>
  `;
  byId("set-modal").classList.add("active");
  byId("set-modal").querySelector("input[name='name']").focus();
}

function saveExerciseEdit(formData) {
  const active = state.activeWorkout;
  if (!active) return;
  const workout = getWorkout(active.workoutId);
  const exerciseId = String(formData.get("exerciseId"));
  const base = baseExerciseById(workout, exerciseId);
  if (!base) return;
  const edited = {
    ...base,
    name: String(formData.get("name") || base.name).trim(),
    sets: Math.max(1, Number(formData.get("sets") || base.sets)),
    reps: String(formData.get("reps") || base.reps).trim(),
    restSec: Math.max(0, Number(formData.get("restSec") || base.restSec)),
    cue: String(formData.get("cue") || "").trim()
  };
  active.exerciseOverrides = active.exerciseOverrides || {};
  active.exerciseOverrides[exerciseId] = edited;
  active.sets = active.sets.map((set) => set.exerciseId === exerciseId ? { ...set, exerciseName: edited.name } : set);
  rememberExerciseHistory(active, edited);
  saveState();
  closeModal();
  renderActiveWorkout();
  if (isWorkoutPaused(active)) stopActiveTick();
  else startActiveTick();
  showToast("Exercise updated.");
}

function suggestedSetValues(active, workout, exercise, editingSet) {
  if (editingSet) return editingSet;
  const currentSets = active.sets.filter((set) => set.exerciseId === exercise.id);
  if (currentSets.length) return currentSets[currentSets.length - 1];
  const historySets = lastExerciseSets(workout.id, exercise.id, { excludeSessionId: active.id });
  if (historySets?.length) return historySets[historySets.length - 1];
  return { weight: "", reps: "", notes: "" };
}

function saveSet(formData) {
  const active = state.activeWorkout;
  if (!active) return;
  const workout = getWorkout(active.workoutId);
  const exercise = activeExerciseById(workout, active, formData.get("exerciseId"));
  if (!exercise) return;
  const setIndex = formData.get("setIndex") === "" ? null : Number(formData.get("setIndex"));
  const mode = formData.get("saveMode") || "one";
  const baseSet = {
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    weight: Number(formData.get("weight")),
    reps: Number(formData.get("reps")),
    notes: String(formData.get("notes") || "").trim(),
    loggedAt: new Date().toISOString()
  };

  if (Number.isInteger(setIndex) && active.sets[setIndex]) {
    active.sets[setIndex] = { ...active.sets[setIndex], ...baseSet };
  } else if (mode === "all") {
    const existingCount = active.sets.filter((set) => set.exerciseId === exercise.id).length;
    const remaining = Math.max(0, exercise.sets - existingCount);
    for (let index = 0; index < remaining; index += 1) {
      active.sets.push({ ...baseSet, loggedAt: new Date().toISOString() });
    }
  } else {
    active.sets.push(baseSet);
  }

  rememberExerciseHistory(active, exercise);
  if (isWorkoutPaused(active)) {
    active.restRemainingSec = exercise.restSec;
    active.restEndAt = null;
  } else {
    active.restEndAt = new Date(Date.now() + exercise.restSec * 1000).toISOString();
    active.restRemainingSec = null;
  }
  saveState();
  closeModal();
  renderActiveWorkout();
  if (isWorkoutPaused(active)) stopActiveTick();
  else startActiveTick();
  showToast(`${mode === "all" ? "Sets saved" : Number.isInteger(setIndex) ? "Set updated" : "Set saved"}. ${isWorkoutPaused(active) ? "Rest is queued for resume." : `Rest ${formatRest(exercise.restSec)} started.`}`);
}

function pauseWorkout() {
  const active = state.activeWorkout;
  if (!active || isWorkoutPaused(active)) return;
  active.pausedAt = new Date().toISOString();
  active.restRemainingSec = remainingRestSeconds(active);
  active.restEndAt = null;
  saveState();
  renderActiveWorkout();
  stopActiveTick();
  showToast("Workout paused.");
}

function resumeWorkout() {
  const active = state.activeWorkout;
  if (!active || !isWorkoutPaused(active)) return;
  const pausedSec = Math.max(0, Math.round((Date.now() - new Date(active.pausedAt).getTime()) / 1000));
  active.totalPausedSec = Number(active.totalPausedSec || 0) + pausedSec;
  active.pausedAt = null;
  if (Number(active.restRemainingSec) > 0) {
    active.restEndAt = new Date(Date.now() + Number(active.restRemainingSec) * 1000).toISOString();
  }
  active.restRemainingSec = null;
  saveState();
  renderActiveWorkout();
  startActiveTick();
  showToast("Workout resumed.");
}

function rememberExerciseHistory(active, exercise) {
  state.exerciseHistory = state.exerciseHistory || {};
  const key = exerciseHistoryKey(active.workoutId, exercise.id);
  state.exerciseHistory[key] = {
    sessionId: active.id,
    workoutId: active.workoutId,
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    date: new Date().toISOString(),
    sets: active.sets.filter((set) => set.exerciseId === exercise.id)
  };
}

function finishWorkout() {
  const active = state.activeWorkout;
  if (!active) return;
  state.workoutLogs.unshift({
    id: active.id,
    workoutId: active.workoutId,
    workoutName: getWorkout(active.workoutId).name,
    date: new Date().toISOString(),
    durationSec: activeWorkoutElapsedSec(active),
    sets: active.sets
  });
  state.activeWorkout = null;
  saveState();
  stopActiveTick();
  route("workouts");
  showToast("Workout saved to history.");
}

function cancelWorkout() {
  if (!confirm("Cancel this workout? Unsaved active sets will be removed.")) return;
  state.activeWorkout = null;
  saveState();
  route("workouts");
}

function renderProgress() {
  const latest = latestProgress();
  const prev = previousProgress();
  const morningWeight = latestMorningWeight();
  const avg = sevenDayAverage();
  byId("screen-progress").innerHTML = `
    <div class="hero-card">
      <h1>Scoreboard</h1>
      <p>Log morning metrics. Waist is the guardrail; shoulders, lean mass, and training performance are the climb.</p>
    </div>
    <div class="stats-grid">
      ${statCard("Morning Weight", `${fmt(morningWeight.weight)} lbs`, avg ? `7-day avg ${fmt(avg)} lbs` : "Need 7 days")}
      ${statCard("Current Waist", `${fmt(latest.waist)}"`, changeText(latest.waist, prev?.waist, "\"", true))}
      ${statCard("Shoulder Ratio", ratioText(latest), "Target 1.45+")}
      ${statCard("Adonis Score", `${adonisScore(latest)}%`, "Composite physique signal")}
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>ShapeScale Import</h2><span class="small">Weekly source of truth</span></div>
      <form id="shapescale-form">
        <label class="file-drop">
          <span>Upload ShapeScale PDF or Screenshot</span>
          <small>Select the weekly PDF, or take a screenshot/photo of the report.</small>
          <input name="scanFile" type="file" accept="application/pdf,image/*">
        </label>
        <div class="field" style="margin-top:12px"><label>Paste ShapeScale Report Text</label><textarea name="reportText" class="large-textarea" placeholder="Optional fallback if you copied report text."></textarea></div>
        <p class="form-help">Imports scan date, body fat, lean mass, shoulders, waist, hips, biceps, thighs, neck, and calves. PDF/photo import uses the AI backend; pasted text uses the local parser first.</p>
        <button class="button primary" type="submit">Import ShapeScale Scan</button>
      </form>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Log Metrics</h2><span class="small">ShapeScale + morning weight</span></div>
      <form id="progress-form">
        <div class="field-grid metrics-top-grid">
          ${field("date", "Date", "date", todayIso())}
          ${field("weight", "Morning Weight", "number", morningWeight.weight)}
        </div>
        <div class="field-grid shapescale-metric-grid">
          ${metricDisplay("Waist", `${fmt(latest.waist)}\"`)}
          ${metricDisplay("Shoulders", `${fmt(latest.shoulders)}\"`)}
          ${metricDisplay("Arms / Biceps", `${fmt(latest.arms ?? latest.biceps)}\"`)}
          ${metricDisplay("Hips", `${fmt(latest.hips)}\"`)}
          ${metricDisplay("Thighs", `${fmt(latest.thighs)}\"`)}
          ${metricDisplay("Neck", `${fmt(latest.neck)}\"`)}
          ${metricDisplay("Calves", `${fmt(latest.calves)}\"`)}
          ${metricDisplay("Body Fat", `${fmt(latest.bodyFat)}%`)}
          ${metricDisplay("Lean Mass", `${fmt(latest.leanMass)} lbs`)}
        </div>
        <div class="field" style="margin-top:10px"><label>Morning Weight Notes</label><textarea name="notes" placeholder="Sleep, sodium, late meal, travel, weigh-in context"></textarea></div>
        <button class="button primary" type="submit">Save Morning Weight</button>
      </form>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Recent Logs</h2><span class="small">${state.progressLogs.length} entries</span></div>
      <div class="workout-list">${state.progressLogs.slice(0, 6).map(progressRow).join("")}</div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Morning Weight History</h2><span class="small">${(state.morningWeights || []).length} entries</span></div>
      <div class="workout-list">${(state.morningWeights || []).slice(0, 6).map(morningWeightRow).join("") || `<div class="empty">No morning weights yet.</div>`}</div>
    </div>
  `;
}

function field(name, label, type, value) {
  const step = type === "number" ? ` step="0.1"` : "";
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}"${step} value="${value ?? ""}" required></div>`;
}

function metricDisplay(label, value) {
  return `<div class="metric-display"><span>${label}</span><b>${value}</b></div>`;
}

function saveProgress(formData) {
  const entry = {
    date: formData.get("date"),
    weight: Number(formData.get("weight")),
    notes: String(formData.get("notes") || "").trim()
  };
  state.morningWeights = state.morningWeights || [];
  state.morningWeights = state.morningWeights.filter((item) => item.date !== entry.date);
  state.morningWeights.unshift(entry);
  state.morningWeights.sort((a, b) => b.date.localeCompare(a.date));
  saveState();
  renderProgress();
  renderHome();
  showToast("Morning weight saved.");
}

async function importShapeScale(formData) {
  const text = String(formData.get("reportText") || "");
  const file = formData.get("scanFile");
  let scan = text.trim() ? parseShapeScaleText(text) : null;

  if (!scan) {
    showToast("Reading ShapeScale scan...");
    try {
      const fileData = file && file.size ? await scanFileData(file) : "";
      const data = await apiRequest("/api/shapescale-scan", {
        method: "POST",
        body: JSON.stringify({
          fileData,
          filename: file && file.size ? file.name : "",
          reportText: text
        })
      });
      scan = data.scan;
    } catch (error) {
      showToast(error.message || "Could not find ShapeScale measurements.");
      return;
    }
  }

  state.progressLogs = state.progressLogs.filter((item) => item.date !== scan.date);
  state.progressLogs.unshift(scan);
  state.progressLogs.sort((a, b) => b.date.localeCompare(a.date));
  saveState();
  renderProgress();
  renderHome();
  showToast("ShapeScale scan imported.");
}

async function scanFileData(file) {
  if (file.type.startsWith("image/")) return resizeImageFile(file);
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    if (file.size > 3_200_000) {
      throw new Error("That ShapeScale PDF is too large for the app upload. Use a screenshot/photo of the report page, or paste the report text.");
    }
    return fileToDataUrl(file);
  }
  throw new Error("Use a ShapeScale PDF or image file.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function parseShapeScaleText(rawText) {
  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text || !/ShapeScale|Scan Rep|Body Map|BODY FAT/i.test(text)) return null;
  const dateMatch = text.match(/([A-Z][a-z]{2})\s+(\d{1,2}),\s+(20\d{2})\s+at/i);
  const date = dateMatch ? toIsoDate(dateMatch[1], dateMatch[2], dateMatch[3]) : todayIso();
  const topRow = rowValues(text, "BODY FAT", "SHOULDERS", "HIPS");
  const middleRow = rowValues(text, "LEAN MASS", "BICEPS", "THIGHS");
  const lowerRow = rowValues(text, "NECK", "WAIST", "CALVES");
  const bodyFat = topRow[0];
  const shoulders = topRow[1];
  const hips = topRow[2];
  const leanMass = middleRow[0];
  const biceps = middleRow[1];
  const thighs = middleRow[2];
  const neck = lowerRow[0];
  const waist = lowerRow[1];
  const calves = lowerRow[2];
  const explicitWeight = explicitWeightValue(text);
  const weight = explicitWeight || (leanMass && bodyFat ? leanMass / (1 - bodyFat / 100) : null);
  if (![bodyFat, shoulders, leanMass, waist].every(Boolean)) return null;
  return {
    date,
    weight: round1(weight),
    waist: round1(waist),
    shoulders: round1(shoulders),
    arms: round1(biceps),
    biceps: round1(biceps),
    hips: round1(hips),
    thighs: round1(thighs),
    neck: round1(neck),
    calves: round1(calves),
    bodyFat: round1(bodyFat),
    leanMass: round1(leanMass),
    source: "ShapeScale",
    notes: weight && !explicitWeight ? "Imported from ShapeScale. Weight derived from lean mass and body fat." : "Imported from ShapeScale."
  };
}

function rowValues(text, firstLabel, secondLabel, thirdLabel) {
  const pattern = new RegExp(`${firstLabel}\\s+${secondLabel}\\s+${thirdLabel}\\s+([0-9]+(?:\\.[0-9]+)?)(?:%|in|lbs)?\\s+([0-9]+(?:\\.[0-9]+)?)(?:%|in|lbs)?\\s+([0-9]+(?:\\.[0-9]+)?)(?:%|in|lbs)?`, "i");
  const match = text.match(pattern);
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : [null, null, null];
}

function explicitWeightValue(text) {
  const match = text.match(/\bWEIGHT\b(?!\s+BMI)[^0-9]{0,40}([0-9]+(?:\.[0-9]+)?)\s*lbs/i);
  return match ? Number(match[1]) : null;
}

function toIsoDate(monthName, day, year) {
  const months = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const date = new Date(Number(year), months[monthName.slice(0, 3)], Number(day));
  return toLocalIsoDate(date);
}

function round1(value) {
  return value === null || value === undefined || Number.isNaN(Number(value)) ? "" : Math.round(Number(value) * 10) / 10;
}

function renderNutrition() {
  ensureNutritionDay();
  const date = todayIso();
  const foods = state.nutritionLogs[date] || [];
  const savedMeals = state.savedMeals || [];
  const totals = macroTotals(foods);
  const targets = state.settings;
  byId("screen-nutrition").innerHTML = `
    <div class="hero-card">
      <h1>Nutrition</h1>
      <p>MacroFactor-inspired control center for reverse dieting while keeping the waist under ${targets.waistGuardrail}".</p>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Daily Targets</h2><span class="small">${date} · Vancouver time</span></div>
      <div class="stats-grid">
        ${statCard("Calories", `${totals.calories}/${targets.calorieTarget}`, `${Math.max(0, targets.calorieTarget - totals.calories)} remaining`)}
        ${statCard("Protein", `${totals.protein}/${targets.proteinTarget}g`, `${Math.max(0, targets.proteinTarget - totals.protein)}g remaining`)}
        ${statCard("Carbs", `${totals.carbs}/${targets.carbTarget}g`, `${Math.max(0, targets.carbTarget - totals.carbs)}g remaining`)}
        ${statCard("Fat", `${totals.fat}/${targets.fatTarget}g`, `${Math.max(0, targets.fatTarget - totals.fat)}g remaining`)}
      </div>
      <div class="macro-bars" style="margin-top:14px">
        ${bar("Calories", totals.calories, targets.calorieTarget, "orange")}
        ${bar("Protein", totals.protein, targets.proteinTarget, "teal")}
        ${bar("Carbs", totals.carbs, targets.carbTarget, "green")}
        ${bar("Fat", totals.fat, targets.fatTarget, "orange")}
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Add Food</h2><span class="small">${date}</span></div>
      <form id="meal-label-form" class="label-scan-form">
        <div class="label-photo-grid">
          <label class="file-drop">
            <span>Take Photo</span>
            <small>Open the camera for a fresh meal-prep lid or nutrition sticker.</small>
            <input name="labelCameraPhoto" type="file" accept="image/*" capture="environment">
          </label>
          <label class="file-drop">
            <span>Choose From Photos</span>
            <small>Use a label photo you already took from the camera roll.</small>
            <input name="labelLibraryPhoto" type="file" accept="image/*">
          </label>
        </div>
        <button class="button secondary" type="submit">Read Label</button>
      </form>
      <form id="food-form">
        <div class="field-grid one">${field("name", "Food Name", "text", "")}</div>
        <div class="field-grid">
          ${field("calories", "Calories", "number", "")}
          ${field("protein", "Protein", "number", "")}
          ${field("carbs", "Carbs", "number", "")}
          ${field("fat", "Fat", "number", "")}
        </div>
        <label class="check-row">
          <input name="saveMeal" type="checkbox">
          <span>Save this meal for one-tap logging</span>
        </label>
        <button class="button primary" type="submit">Add Food</button>
      </form>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Saved Meals</h2><span class="small">${savedMeals.length} ready</span></div>
      <div class="saved-meal-grid">${savedMeals.length ? savedMeals.map(savedMealCard).join("") : `<div class="empty">Save frequent meals here. One tap logs the macros next time.</div>`}</div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Today's Food</h2><span class="small">${foods.length} items</span></div>
      <div class="workout-list">${foods.length ? foods.map(foodRow).join("") : `<div class="empty">No food logged yet.</div>`}</div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Weekly Nutrition Trend</h2><span class="small">Last 7 days</span></div>
      <div class="stats-grid">
        ${weeklyNutritionTrend()}
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Reverse Diet Mode</h2><span class="small">Maintenance goal ${targets.maintenanceGoal}</span></div>
      <div class="stats-grid">
        ${statCard("Current Target", `${targets.calorieTarget} kcal`, "Training-day baseline")}
        ${statCard("Weekly Increase", `+${targets.weeklyIncrease} kcal`, "If waist stable")}
        ${statCard("Goal Maintenance", `${targets.maintenanceGoal} kcal`, "Long-term target")}
        ${statCard("Waist Guardrail", `<${targets.waistGuardrail}"`, "Hold if +0.5\" jump")}
      </div>
      <div class="exercise-card">
        <h3>Coach Note</h3>
        <p class="small">The goal is to raise maintenance calories while keeping the waist tight. If weight rises but waist stays stable, stay the course. If waist jumps 0.5"+, hold calories.</p>
      </div>
    </div>
  `;
}

function saveFood(formData) {
  const date = todayIso();
  const meal = stampMeal(mealFromForm(formData), date);
  if (!meal.name) {
    showToast("Meal needs a name.");
    return;
  }
  state.nutritionLogs[date] = state.nutritionLogs[date] || [];
  state.nutritionLogs[date].push(meal);
  if (formData.get("saveMeal")) saveMealTemplate(meal);
  saveState();
  renderNutrition();
  showToast(formData.get("saveMeal") ? "Food added and meal saved." : "Food added.");
}

function mealFromForm(formData) {
  return cleanMeal({
    name: formData.get("name"),
    calories: formData.get("calories"),
    protein: formData.get("protein"),
    carbs: formData.get("carbs"),
    fat: formData.get("fat")
  });
}

function cleanMeal(meal) {
  return {
    name: String(meal.name || "").trim(),
    calories: Math.round(Number(meal.calories || 0)),
    protein: roundMacro(meal.protein),
    carbs: roundMacro(meal.carbs),
    fat: roundMacro(meal.fat)
  };
}

function stampMeal(meal, date = todayIso()) {
  return {
    ...cleanMeal(meal),
    logDate: date,
    loggedAt: new Date().toISOString()
  };
}

function roundMacro(value) {
  return Math.round(Number(value || 0) * 10) / 10;
}

function saveMealTemplate(meal) {
  state.savedMeals = normalizeSavedMeals(state.savedMeals);
  const savedMeal = { ...meal, id: mealId(meal), updatedAt: new Date().toISOString() };
  const existingIndex = state.savedMeals.findIndex((item) => item.id === savedMeal.id);
  if (existingIndex >= 0) {
    state.savedMeals[existingIndex] = savedMeal;
  } else {
    state.savedMeals.unshift(savedMeal);
  }
  state.savedMeals = state.savedMeals.slice(0, 40);
}

function mealId(meal) {
  return String(meal.name || "meal").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `meal-${Date.now()}`;
}

function addSavedMealToToday(id) {
  const meal = (state.savedMeals || []).find((item) => item.id === id);
  if (!meal) return;
  const date = todayIso();
  state.nutritionLogs[date] = state.nutritionLogs[date] || [];
  state.nutritionLogs[date].push(stampMeal(cleanMeal(meal), date));
  saveState();
  renderNutrition();
  showToast(`${meal.name} added.`);
}

function removeSavedMeal(id) {
  state.savedMeals = (state.savedMeals || []).filter((meal) => meal.id !== id);
  saveState();
  renderNutrition();
  showToast("Saved meal removed.");
}

async function scanMealLabel(formData) {
  const cameraPhoto = formData.get("labelCameraPhoto");
  const libraryPhoto = formData.get("labelLibraryPhoto");
  const photo = cameraPhoto?.size ? cameraPhoto : libraryPhoto;
  if (!photo || !photo.size) {
    showToast("Take or choose a label photo first.");
    return;
  }

  showToast("Reading label...");
  try {
    const image = await resizeImageFile(photo);
    const data = await apiRequest("/api/meal-label", {
      method: "POST",
      body: JSON.stringify({ image })
    });
    populateFoodForm(data.meal || data);
    showToast("Label read. Check it, then add food.");
  } catch (error) {
    showToast(error.message || "Label scan failed");
  }
}

function populateFoodForm(meal) {
  const clean = cleanMeal(meal || {});
  const form = byId("food-form");
  if (!form) return;
  ["name", "calories", "protein", "carbs", "fat"].forEach((key) => {
    const input = form.elements[key];
    if (input) input.value = clean[key] || "";
  });
}

function removeFood(index) {
  const date = todayIso();
  ensureNutritionDay();
  state.nutritionLogs[date].splice(index, 1);
  saveState();
  renderNutrition();
}

function renderCoach() {
  const context = coachContext();
  byId("screen-coach").innerHTML = `
    <div class="coach-hero panel">
      <div class="coach-avatar">V</div>
      <div>
        <div class="eyebrow">Coach Valentina</div>
        <h1>Brutal Truth. Clean Execution.</h1>
        <p>Thirty, sharp, uncomfortably observant. She wants the Adonis result badly enough to call out sloppy patterns before they become your personality.</p>
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Current Read</h2><span class="small">${context.latest.source || "Manual"} data</span></div>
      <div class="coach-brief">
        ${coachBriefItem("Waist", `${fmt(context.latest.waist)}"`, context.waistLine)}
        ${coachBriefItem("Body Fat", `${fmt(context.latest.bodyFat)}%`, context.bodyFatLine)}
        ${coachBriefItem("Training", `${context.recentWorkouts} / 7d`, context.trainingLine)}
        ${coachBriefItem("Habits", `${context.habitScore}%`, context.habitLine)}
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Ask Her</h2><button class="link-button" data-action="clear-coach">Clear</button></div>
      <div class="coach-prompts">
        <button class="small-chip" data-action="coach-prompt" data-prompt="Give me the brutal weekly check-in.">Weekly check-in</button>
        <button class="small-chip" data-action="coach-prompt" data-prompt="What is the biggest risk in my data right now?">Biggest risk</button>
        <button class="small-chip" data-action="coach-prompt" data-prompt="What should I do today?">Today</button>
      </div>
      <div class="coach-chat" id="coach-chat-log">
        ${state.coachMessages.map(coachBubble).join("")}
      </div>
      <form id="coach-form" class="coach-form">
        <label class="coach-attach" aria-label="Attach progress photo">
          +
          <input name="photo" type="file" accept="image/*">
        </label>
        <input name="message" placeholder="Ask for the truth..." autocomplete="off" required>
        <button class="button primary" type="submit">Send</button>
      </form>
      <p class="form-help">Photo uploads are saved locally in this browser. Local Coach mode can reference the photo check-in, but true visual analysis needs a vision model/API connection.</p>
    </div>
  `;
  const log = byId("coach-chat-log");
  if (log) log.scrollTop = log.scrollHeight;
}

function coachBriefItem(label, value, detail) {
  return `<div class="coach-brief-item"><b>${value}</b><span>${label}</span><p>${detail}</p></div>`;
}

function coachBubble(message) {
  return `
    <div class="coach-bubble ${message.role === "user" ? "user" : "coach"}">
      ${message.image ? `<img class="coach-photo" src="${message.image}" alt="Coach chat attachment">` : ""}
      <div>${escapeHtml(message.text)}</div>
      <span>${new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>
    </div>
  `;
}

function sendCoachPrompt(prompt) {
  if (!prompt) return;
  sendCoachText(prompt);
}

function sendCoachMessage(formData) {
  const text = String(formData.get("message") || "").trim();
  const photo = formData.get("photo");
  if (photo && photo.size) {
    resizeImageFile(photo)
      .then((image) => sendCoachText(text || "Photo check-in.", image))
      .catch(() => {
        const reader = new FileReader();
        reader.onload = () => sendCoachText(text || "Photo check-in.", String(reader.result || ""));
        reader.readAsDataURL(photo);
      });
    return;
  }
  if (!text) return;
  sendCoachText(text);
}

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxSide = 1800;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

async function sendCoachText(text, image = "") {
  state.coachMessages.push({ role: "user", text, image, createdAt: new Date().toISOString() });
  saveState();
  renderCoach();

  let reply;
  try {
    reply = await requestCoachReply(text, image);
    cloudStatus = "AI coach online";
  } catch (error) {
    reply = `${generateCoachReply(text, Boolean(image))}\n\n(Local fallback: ${error.message || "AI backend unavailable"})`;
    cloudStatus = "AI backend unavailable";
  }

  state.coachMessages.push({ role: "coach", text: reply, createdAt: new Date().toISOString() });
  state.coachMessages = state.coachMessages.slice(-40);
  saveState();
  renderCoach();
}

async function requestCoachReply(text, image) {
  const response = await apiRequest("/api/coach-chat", {
    method: "POST",
    body: JSON.stringify({
      message: text,
      image,
      context: coachContext(),
      messages: state.coachMessages.slice(-16)
    })
  });
  if (!response.reply) throw new Error("Coach returned no reply");
  return response.reply;
}

function clearCoach() {
  state.coachMessages = [defaultState.coachMessages[0]];
  saveState();
  renderCoach();
}

function generateCoachReply(message, hasImage = false) {
  const context = coachContext();
  const lower = message.toLowerCase();
  const lines = [];
  lines.push(coachOpener(context));

  if (hasImage) {
    lines.push(`Photo check-in logged. In this local version, I can see that you attached the image, but I cannot honestly inspect the pixels yet. So I am not going to fake it like a cheap fitness oracle. I am judging the photo against the data: ${fmt(context.latest.waist)}" waist, ${fmt(context.latest.bodyFat)}% body fat, ${fmt(context.latest.shoulders)}" shoulders.`);
    lines.push(photoCheckInRead(context));
  } else if (lower.includes("today")) {
    lines.push(`Today: ${todayWorkout().rest ? "walk, TVA, mobility, and do not turn recovery into couch cosplay." : `train ${todayWorkout().short}, log every set, and beat one meaningful number.`}`);
  } else if (lower.includes("risk")) {
    lines.push(`Biggest risk: ${context.biggestRisk}`);
  } else if (lower.includes("week") || lower.includes("check")) {
    lines.push(`Weekly read: ${context.waistLine} ${context.bodyFatLine} ${context.trainingLine}`);
  } else if (lower.includes("nutrition") || lower.includes("calorie") || lower.includes("macro")) {
    lines.push(`Nutrition read: ${context.nutritionLine}`);
  } else if (lower.includes("habit") || lower.includes("sleep") || lower.includes("water")) {
    lines.push(`Habits read: ${context.habitLine}`);
  } else {
    lines.push(context.primaryInsight);
  }

  lines.push(coachDirective(context));
  return lines.join("\n\n");
}

function photoCheckInRead(context) {
  if (context.latest.waist > 34 || context.waistDelta > 0.4) return "If the photo looks softer through the midsection, believe it. The waist data already put its hand up. Tighten food quality, hold calories, and walk more before you ask for more carbs.";
  if (context.latest.bodyFat > 14) return "Likely read: decent base, not peeled. Your job is to keep building shoulders/back while the waist stops auditioning for a bigger role.";
  if (Number(ratioText(context.latest)) < 1.4) return "Likely read: you need more shoulder width relative to waist. Delts and lats are not optional accessories; they are the architecture.";
  return "Likely read: you are moving toward the look. Do not get cute. Keep logging scans and photos weekly so we can compare honestly.";
}

function coachOpener(context) {
  if (context.waistDelta > 0.4) return "Alright, handsome, the waist is getting a little loud. I am not panicking, but I am absolutely not clapping for it.";
  if (context.waistDelta < -0.2) return "Good. The waist is moving down, which means you are not just performing fitness theater.";
  if (context.latest.bodyFat > 14) return "Truth first: you are not fat, but you are also not at the Adonis finish line. The softness still has a vote.";
  return "You are in striking distance. This is where discipline matters because the mirror starts negotiating with you.";
}

function coachDirective(context) {
  if (context.recentWorkouts < 3) return "Directive: get the training count up before you ask me for exotic optimization. Four sessions is the standard.";
  if (context.habitScore < 70) return "Directive: hit hydration, sleep, and supplements today. Boring? Yes. Effective? Also yes. Do the boring thing.";
  if (context.calorieRemaining < -250) return "Directive: calories are over target. No heroic compensation, just tighten tomorrow and stop feeding the waist like it has a trust fund.";
  if (context.latest.waist > 34) return "Directive: waist is above the guardrail. Hold calories, walk, hit protein, and earn the next increase.";
  return "Directive: stay the course. Add reps in the gym, keep protein high, and protect the waist like it owes you money.";
}

function coachContext() {
  const latest = latestProgress();
  const previous = previousProgress() || latest;
  const foods = state.nutritionLogs[todayIso()] || [];
  const totals = macroTotals(foods);
  const habitToday = habitScore(todayIso());
  const recentWorkouts = state.workoutLogs.filter((log) => daysBetween(log.date.slice(0, 10), todayIso()) < 7).length;
  const waistDelta = Number(latest.waist || 0) - Number(previous.waist || latest.waist || 0);
  const bodyFatDelta = Number(latest.bodyFat || 0) - Number(previous.bodyFat || latest.bodyFat || 0);
  const calorieRemaining = Number(state.settings.calorieTarget) - totals.calories;
  const waistLine = trendLine(waistDelta, "waist", "\"", true);
  const bodyFatLine = trendLine(bodyFatDelta, "body fat", "%", true);
  const trainingLine = recentWorkouts >= 4 ? "Training frequency is on standard." : `Only ${recentWorkouts} logged sessions in 7 days. That is not a transformation pace.`;
  const habitLine = habitToday >= 80 ? "Daily habits are tight." : `${habitToday}% habit score today. Recovery basics are leaking.`;
  const nutritionLine = foods.length ? `${totals.calories} kcal logged, ${Math.max(0, calorieRemaining)} kcal remaining, protein at ${totals.protein}g.` : "No food logged today. I cannot coach invisible meals.";
  const biggestRisk = latest.waist > 34 ? "waist is over the guardrail" : waistDelta > 0.4 ? "waist is climbing faster than your standards should allow" : recentWorkouts < 3 ? "training consistency is too low" : habitToday < 70 ? "recovery habits are sloppy" : "complacency, because the data is decent enough to make you lazy";
  const primaryInsight = `Current data says ${fmt(latest.weight)} lb, ${fmt(latest.waist)}\" waist, ${fmt(latest.shoulders)}\" shoulders, ${fmt(latest.bodyFat)}% body fat. Goal is 180-182 lb with a 33\" waist and 48\"+ shoulders, so we build, but we do not bulk like a man with no mirror.`;
  return { latest, previous, totals, habitScore: habitToday, recentWorkouts, waistDelta, bodyFatDelta, calorieRemaining, waistLine, bodyFatLine, trainingLine, habitLine, nutritionLine, biggestRisk, primaryInsight };
}

function trendLine(delta, label, unit, lowerIsGood) {
  if (Math.abs(delta) < 0.05) return `${label} is stable. Fine. Not sexy, but fine.`;
  const good = lowerIsGood ? delta < 0 : delta > 0;
  const direction = delta > 0 ? "up" : "down";
  return `${label} is ${direction} ${Math.abs(delta).toFixed(1)}${unit}. ${good ? "That is the right direction." : "That needs attention."}`;
}

function renderMore() {
  byId("screen-more").innerHTML = `
    <div class="hero-card">
      <h1>Project Adonis</h1>
      <p>Personal operating system for training, nutrition, measurement, and maintaining the standard.</p>
    </div>
    <div class="section-panel panel coach-entry">
      <div>
        <div class="eyebrow">Coach Valentina</div>
        <h2>Direct, data-aware physique coach.</h2>
        <p class="small">She reads your measurements, workouts, nutrition, and habits. No cheerleading if the waist is moving the wrong way.</p>
      </div>
      <button class="button primary" data-route="coach">Open Coach Chat</button>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Cloud Sync</h2><span class="small">${cloudStatus}</span></div>
      <form id="cloud-form">
        <div class="field"><label>App PIN</label><input name="pin" type="password" value="${escapeAttribute(getCloudPin())}" placeholder="Your private app PIN"></div>
        <p class="form-help">The PIN is stored only on this device and sent to your backend so your app data is not publicly writable.</p>
        <button class="button primary" type="submit">Save PIN</button>
      </form>
      <div class="button-row">
        <button class="button secondary" data-action="cloud-pull">Pull Cloud Data</button>
        <button class="button secondary" data-action="cloud-push">Push This Device</button>
      </div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Settings</h2><span class="small">MVP local data</span></div>
      <form id="settings-form">
        <div class="field-grid one">
          ${field("startDate", "Program Start Date", "date", state.settings.startDate || DEFAULT_PROGRAM_START_DATE)}
        </div>
        <div class="field-grid">
          ${field("calorieTarget", "Calories", "number", state.settings.calorieTarget)}
          ${field("proteinTarget", "Protein", "number", state.settings.proteinTarget)}
          ${field("carbTarget", "Carbs", "number", state.settings.carbTarget)}
          ${field("fatTarget", "Fat", "number", state.settings.fatTarget)}
          ${field("weeklyIncrease", "Weekly Increase", "number", state.settings.weeklyIncrease)}
          ${field("maintenanceGoal", "Maintenance Goal", "number", state.settings.maintenanceGoal)}
          ${field("waistGuardrail", "Waist Guardrail", "number", state.settings.waistGuardrail)}
        </div>
        <button class="button primary" type="submit">Save Settings</button>
      </form>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Habit Streak</h2><span class="small">Last 7 days</span></div>
      <div class="habit-week">${habitWeekTrend()}</div>
    </div>
    <div class="section-panel panel">
      <div class="section-head"><h2>Workout History</h2><span class="small">${state.workoutLogs.length} saved</span></div>
      <div class="workout-list">${state.workoutLogs.length ? state.workoutLogs.slice(0, 8).map(historyRow).join("") : `<div class="empty">No completed workouts yet.</div>`}</div>
    </div>
    <button class="button danger" data-action="reset-data">Reset App Data</button>
  `;
}

function saveSettings(formData) {
  state.settings.startDate = String(formData.get("startDate") || DEFAULT_PROGRAM_START_DATE);
  ["calorieTarget", "proteinTarget", "carbTarget", "fatTarget", "weeklyIncrease", "maintenanceGoal", "waistGuardrail"].forEach((key) => {
    state.settings[key] = Number(formData.get(key));
  });
  saveState();
  showToast("Settings saved.");
  renderMore();
}

function habitPanel(date) {
  const log = getHabitLog(date);
  const numberHabits = habits.filter((habit) => habit.type === "number");
  const checkHabits = habits.filter((habit) => habit.type === "check");
  return `
    <form id="habit-form" class="habit-form">
      <div class="habit-number-grid">
      ${numberHabits.map((habit) => `
        <div class="habit-card">
          <div>
            <strong>${habit.name}</strong>
            <span>${habit.note}</span>
          </div>
          <label class="habit-input">
            <input name="${habit.id}" inputmode="decimal" value="${log[habit.id] ?? ""}" placeholder="${habit.target}">
            <em>${habit.unit}</em>
          </label>
          <small>Target ${habit.target}${habit.unit}</small>
        </div>
      `).join("")}
      </div>
      <div class="section-head compact"><h2>Supplements</h2><span class="small">${checkHabits.filter((habit) => log[habit.id]).length}/${checkHabits.length} done</span></div>
      <div class="habit-check-grid">
        ${checkHabits.map((habit) => {
          const done = Boolean(log[habit.id]);
          return `
            <label class="habit-toggle ${done ? "done" : ""}">
              <input name="${habit.id}" type="checkbox" ${done ? "checked" : ""}>
              <strong>${habit.name}</strong>
              <small>${habit.note}</small>
            </label>
          `;
        }).join("")}
      </div>
      <button class="button secondary habit-save" type="submit">Save Habits</button>
    </form>
  `;
}

function saveHabitNumbers(formData) {
  const date = todayIso();
  const log = getHabitLog(date);
  habits.filter((habit) => habit.type === "number").forEach((habit) => {
    const value = formData.get(habit.id);
    log[habit.id] = value === "" ? "" : Number(value);
  });
  habits.filter((habit) => habit.type === "check").forEach((habit) => {
    log[habit.id] = formData.has(habit.id);
  });
  state.habitLogs[date] = log;
  saveState();
  renderHome();
  showToast("Habits updated.");
}

function getHabitLog(date) {
  state.habitLogs[date] = state.habitLogs[date] || {};
  return state.habitLogs[date];
}

function habitComplete(habit, log) {
  if (habit.type === "check") return Boolean(log[habit.id]);
  return Number(log[habit.id] || 0) >= habit.target;
}

function habitScore(date) {
  const log = getHabitLog(date);
  const done = habits.filter((habit) => habitComplete(habit, log)).length;
  return Math.round((done / habits.length) * 100);
}

function habitWeekTrend() {
  return Array.from({ length: 7 }, (_, index) => {
    const iso = isoDaysAgo(index);
    const date = parseLocalDate(iso);
    const score = habitScore(iso);
    return `<div class="habit-day"><b>${date.toLocaleDateString(undefined, { weekday: "short" })}</b><div class="habit-ring" style="--score:${score}%">${score}</div><span>${iso.slice(5)}</span></div>`;
  }).reverse().join("");
}

function setWeek(week) {
  state.settings.week = week;
  const start = parseLocalDate(todayIso());
  start.setDate(start.getDate() - ((week - 1) * 7));
  state.settings.startDate = toLocalIsoDate(start);
  saveState();
  renderWorkouts();
  renderHome();
}

function resetData() {
  if (!confirm("Reset all Adonis OS data?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(defaultState);
  saveState();
  route("home");
}

function closeModal() {
  byId("set-modal").classList.remove("active");
  byId("set-modal").innerHTML = "";
}

function startActiveTick() {
  stopActiveTick();
  activeTick = setInterval(tickTimers, 1000);
}

function stopActiveTick() {
  if (activeTick) clearInterval(activeTick);
  activeTick = null;
}

function startDateRolloverWatch() {
  if (dateRolloverTimer) clearInterval(dateRolloverTimer);
  dateRolloverTimer = setInterval(handleDateRollover, 30_000);
  window.addEventListener("focus", handleDateRollover);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) handleDateRollover();
  });
}

function handleDateRollover() {
  const nextDate = todayIso();
  if (nextDate === currentLocalDate) return;
  currentLocalDate = nextDate;
  if (currentScreen === "nutrition" || currentScreen === "home" || currentScreen === "progress" || currentScreen === "more") {
    route(currentScreen);
  }
  showToast("New day started. Daily logs reset for today.");
}

function tickTimers() {
  const active = state.activeWorkout;
  if (!active) return;
  const totalEl = byId("total-timer");
  const restEl = byId("rest-timer");
  if (totalEl) totalEl.textContent = secondsToClock(activeWorkoutElapsedSec(active));
  if (restEl) {
    const rem = remainingRestSeconds(active);
    restEl.textContent = rem ? secondsToClock(rem) : isWorkoutPaused(active) ? "paused" : "ready";
  }
}

function isWorkoutPaused(active = state.activeWorkout) {
  return Boolean(active?.pausedAt);
}

function activeWorkoutElapsedSec(active) {
  if (!active?.startedAt) return 0;
  const now = isWorkoutPaused(active) ? new Date(active.pausedAt).getTime() : Date.now();
  const raw = Math.floor((now - new Date(active.startedAt).getTime()) / 1000);
  return Math.max(0, raw - Number(active.totalPausedSec || 0));
}

function remainingRestSeconds(active) {
  if (!active) return 0;
  if (isWorkoutPaused(active)) return Math.max(0, Number(active.restRemainingSec || 0));
  return active.restEndAt ? Math.max(0, Math.ceil((new Date(active.restEndAt).getTime() - Date.now()) / 1000)) : 0;
}

function statCard(label, main, change) {
  return `<div class="stat-card"><div class="stat-main">${main}</div><div class="stat-label">${label}</div><div class="stat-change">${change || ""}</div></div>`;
}

function progressRow(entry) {
  return `<div class="history-row"><strong>${entry.date} ${entry.source ? `<span class="source-tag">${entry.source}</span>` : ""}</strong><div class="meta">${fmt(entry.weight)} lb · ${fmt(entry.waist)}" waist · ${fmt(entry.shoulders)}" shoulders · ${fmt(entry.bodyFat)}% BF</div>${entry.notes ? `<div class="small">${entry.notes}</div>` : ""}</div>`;
}

function morningWeightRow(entry) {
  return `<div class="history-row"><strong>${entry.date}</strong><div class="meta">${fmt(entry.weight)} lb morning weight</div>${entry.notes ? `<div class="small">${escapeHtml(entry.notes)}</div>` : ""}</div>`;
}

function foodRow(food, index) {
  return `<div class="food-row"><div><strong>${food.name}</strong><div class="meta">${food.calories} kcal · P ${food.protein}g · C ${food.carbs}g · F ${food.fat}g</div></div><button class="small-chip" data-remove-food="${index}">Remove</button></div>`;
}

function savedMealCard(meal) {
  return `
    <div class="saved-meal-card">
      <button class="saved-meal-main" data-add-saved-meal="${escapeAttribute(meal.id)}">
        <strong>${escapeHtml(meal.name)}</strong>
        <span>${meal.calories} kcal · P ${meal.protein}g · C ${meal.carbs}g · F ${meal.fat}g</span>
      </button>
      <button class="icon-mini danger" data-remove-saved-meal="${escapeAttribute(meal.id)}" aria-label="Remove ${escapeAttribute(meal.name)}">×</button>
    </div>
  `;
}

function historyRow(log) {
  return `<div class="history-row"><strong>${log.workoutName}</strong><div class="meta">${new Date(log.date).toLocaleDateString()} · ${secondsToClock(log.durationSec)} · ${log.sets.length} sets</div></div>`;
}

function weeklyNutritionTrend() {
  const days = Array.from({ length: 7 }, (_, index) => {
    return isoDaysAgo(index);
  });
  const daily = days.map((date) => macroTotals(state.nutritionLogs[date] || []));
  const loggedDays = daily.filter((day) => day.calories > 0);
  const divisor = loggedDays.length || 1;
  const avg = loggedDays.reduce((totals, day) => ({
    calories: totals.calories + day.calories,
    protein: totals.protein + day.protein,
    carbs: totals.carbs + day.carbs,
    fat: totals.fat + day.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  return [
    statCard("Avg Calories", `${Math.round(avg.calories / divisor)}`, `${loggedDays.length}/7 days logged`),
    statCard("Avg Protein", `${Math.round(avg.protein / divisor)}g`, "Daily average"),
    statCard("Avg Carbs", `${Math.round(avg.carbs / divisor)}g`, "Daily average"),
    statCard("Avg Fat", `${Math.round(avg.fat / divisor)}g`, "Daily average")
  ].join("");
}

function bar(label, current, target, tone) {
  const pct = target ? Math.round((current / target) * 100) : 0;
  return `<div class="bar-row"><div class="bar-label"><span>${label}</span><span>${pct}%</span></div><div class="bar-track"><div class="bar-fill ${tone}" style="--value:${pct}%"></div></div></div>`;
}

function targetText(last) {
  if (!last || !last.length) return "Beat last time: establish baseline";
  const best = last.reduce((top, set) => (Number(set.weight) * Number(set.reps) > Number(top.weight) * Number(top.reps) ? set : top), last[0]);
  return `Beat last time: ${best.weight} lb x ${Number(best.reps) + 1}`;
}

function exerciseHistoryKey(workoutId, exerciseId) {
  return `${workoutId}:${exerciseId}`;
}

function lastExerciseSets(workoutId, exerciseId, options = {}) {
  const history = state.exerciseHistory?.[exerciseHistoryKey(workoutId, exerciseId)];
  if (history?.sets?.length && history.sessionId !== options.excludeSessionId) return history.sets;
  const log = state.workoutLogs.find((item) => item.id !== options.excludeSessionId && item.workoutId === workoutId && item.sets.some((set) => set.exerciseId === exerciseId));
  return log ? log.sets.filter((set) => set.exerciseId === exerciseId) : null;
}

function getWorkout(id) {
  return workouts.find((workout) => workout.id === id) || workouts[0];
}

function baseExerciseById(workout, exerciseId) {
  return workout?.exercises?.find((exercise) => exercise.id === exerciseId) || null;
}

function activeWorkoutExercises(workout, active) {
  const overrides = active?.exerciseOverrides || {};
  return (workout.exercises || []).map((exercise) => ({ ...exercise, ...(overrides[exercise.id] || {}) }));
}

function activeExerciseById(workout, active, exerciseId) {
  return activeWorkoutExercises(workout, active).find((exercise) => exercise.id === exerciseId) || null;
}

function todayWorkout() {
  const map = { 1: "upper-a", 2: "tuesday", 3: "lower-a", 4: "thursday", 5: "upper-b", 6: "lower-b", 0: "sunday" };
  return getWorkout(map[appWeekday()]);
}

function hasWorkoutOnDate(workoutId, date) {
  return state.workoutLogs.some((log) => log.workoutId === workoutId && log.date.slice(0, 10) === date);
}

function latestProgress() {
  return state.progressLogs[0] || defaultState.progressLogs[0];
}

function previousProgress() {
  return state.progressLogs[1] || null;
}

function latestMorningWeight() {
  const latest = latestProgress();
  return (state.morningWeights || [])[0] || { date: latest.date || todayIso(), weight: latest.weight, notes: "" };
}

function previousMorningWeight() {
  return (state.morningWeights || [])[1] || null;
}

function sevenDayAverage() {
  const recent = (state.morningWeights || []).filter((entry) => daysBetween(entry.date, todayIso()) < 7);
  if (recent.length < 7) return null;
  return recent.reduce((sum, entry) => sum + Number(entry.weight), 0) / recent.length;
}

function ratioText(entry) {
  return entry.waist ? (Number(entry.shoulders) / Number(entry.waist)).toFixed(2) : "0.00";
}

function adonisScore(entry) {
  const ratio = Number(ratioText(entry));
  const waistScore = Math.max(0, Math.min(35, ((34.5 - Number(entry.waist)) / 1.5) * 35));
  const shoulderScore = Math.max(0, Math.min(30, ((Number(entry.shoulders) - 45) / 3) * 30));
  const bodyFatScore = Math.max(0, Math.min(20, ((14 - Number(entry.bodyFat)) / 4) * 20));
  const ratioScore = Math.max(0, Math.min(15, ((ratio - 1.35) / 0.1) * 15));
  return Math.round(waistScore + shoulderScore + bodyFatScore + ratioScore);
}

function changeText(current, previous, suffix, lowerIsGood = false) {
  if (previous === undefined || previous === null) return "First entry";
  const diff = Number(current) - Number(previous);
  const good = lowerIsGood ? diff <= 0 : diff >= 0;
  const sign = diff > 0 ? "+" : "";
  return `<span style="color:${good ? "var(--green)" : "var(--danger)"}">${sign}${diff.toFixed(1)}${suffix}</span> vs previous`;
}

function macroTotals(foods) {
  return foods.reduce((totals, food) => ({
    calories: totals.calories + Number(food.calories || 0),
    protein: totals.protein + Number(food.protein || 0),
    carbs: totals.carbs + Number(food.carbs || 0),
    fat: totals.fat + Number(food.fat || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function seedMorningWeights(progressLogs = defaultState.progressLogs) {
  return (progressLogs || [])
    .filter((entry) => entry.date && entry.weight)
    .map((entry) => ({ date: entry.date, weight: Number(entry.weight), notes: entry.source === "ShapeScale" ? "Seeded from ShapeScale import." : "Seeded from progress history." }));
}

function normalizeSavedMeals(meals = []) {
  return (Array.isArray(meals) ? meals : [])
    .map((meal) => {
      const clean = cleanMeal(meal);
      return { ...clean, id: meal.id || mealId(clean), updatedAt: meal.updatedAt || "" };
    })
    .filter((meal) => meal.name);
}

function mergeSavedMeals(localMeals = [], remoteMeals = []) {
  const merged = new Map();
  [...normalizeSavedMeals(remoteMeals), ...normalizeSavedMeals(localMeals)].forEach((meal) => {
    const existing = merged.get(meal.id);
    if (!existing || String(meal.updatedAt || "") >= String(existing.updatedAt || "")) {
      merged.set(meal.id, meal);
    }
  });
  return Array.from(merged.values())
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .slice(0, 40);
}

function normalizeNutritionState(source = {}) {
  const today = todayIso();
  const yesterday = isoDaysAgo(1);
  const logs = { ...(source.nutritionLogs || {}) };
  const activeDay = source.nutritionDay || "";
  const todayMeals = Array.isArray(logs[today]) ? logs[today] : [];
  const legacyTodayMeals = todayMeals.length > 0 && todayMeals.every((meal) => !meal.logDate && !meal.loggedAt);

  if (!activeDay && legacyTodayMeals) {
    logs[yesterday] = [...(logs[yesterday] || []), ...todayMeals.map((meal) => stampMeal(meal, yesterday))];
    logs[today] = [];
  }

  Object.keys(logs).forEach((date) => {
    logs[date] = (Array.isArray(logs[date]) ? logs[date] : [])
      .filter((meal) => meal && meal.name)
      .map((meal) => ({
        ...cleanMeal(meal),
        logDate: meal.logDate || date,
        loggedAt: meal.loggedAt || ""
      }));
  });

  logs[today] = (logs[today] || []).filter((meal) => meal.logDate === today);
  return { nutritionLogs: logs, nutritionDay: today };
}

function ensureNutritionDay() {
  const today = todayIso();
  if (state.nutritionDay === today) return;
  const normalized = normalizeNutritionState(state);
  state.nutritionLogs = normalized.nutritionLogs;
  state.nutritionDay = normalized.nutritionDay;
  saveState();
}

function normalizeActiveWorkout(active) {
  if (!active) return null;
  return {
    ...active,
    pausedAt: active.pausedAt || null,
    totalPausedSec: Number(active.totalPausedSec || 0),
    restRemainingSec: active.restRemainingSec ?? null,
    exerciseOverrides: active.exerciseOverrides || {},
    sets: active.sets || [],
    restEndAt: active.restEndAt || null
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    const nutrition = normalizeNutritionState(saved);
    return {
      ...structuredClone(defaultState),
      ...saved,
      nutritionLogs: nutrition.nutritionLogs,
      nutritionDay: nutrition.nutritionDay,
      settings: { ...defaultState.settings, ...(saved.settings || {}) },
      exerciseHistory: saved.exerciseHistory || {},
      morningWeights: saved.morningWeights || seedMorningWeights(saved.progressLogs),
      activeWorkout: normalizeActiveWorkout(saved.activeWorkout),
      savedMeals: normalizeSavedMeals(saved.savedMeals),
      habitLogs: saved.habitLogs || {},
      coachMessages: saved.coachMessages?.length ? saved.coachMessages : structuredClone(defaultState.coachMessages)
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState(options = {}) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (!options.localOnly) queueCloudSave();
}

function saveCloudSettings(formData) {
  const pin = String(formData.get("pin") || "").trim();
  if (pin) localStorage.setItem(CLOUD_PIN_KEY, pin);
  cloudStatus = pin ? "PIN saved" : "Missing PIN";
  renderMore();
  showToast(cloudStatus);
}

function getCloudPin() {
  return localStorage.getItem(CLOUD_PIN_KEY) || "";
}

function queueCloudSave() {
  if (!getCloudPin()) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => pushCloudState(false), 900);
}

async function pullCloudState(manual = false) {
  if (!getCloudPin()) {
    cloudStatus = "Save PIN first";
    showToast(cloudStatus);
    if (currentScreen === "more") renderMore();
    return;
  }

  try {
    const remote = await apiRequest("/api/state");
    if (remote.state) {
      state = hydrateState(remote.state, state);
      saveState();
      cloudStatus = `Pulled ${remote.updated_at ? new Date(remote.updated_at).toLocaleString() : "cloud state"}`;
      route(currentScreen);
    } else {
      cloudStatus = "No cloud state yet";
      if (manual) await pushCloudState(true);
    }
    showToast(cloudStatus);
  } catch (error) {
    cloudStatus = error.message || "Cloud pull failed";
    showToast(cloudStatus);
    if (currentScreen === "more") renderMore();
  }
}

async function pushCloudState(manual = false) {
  if (!getCloudPin()) {
    if (manual) showToast("Save PIN first");
    return;
  }

  try {
    const saved = await apiRequest("/api/state", {
      method: "POST",
      body: JSON.stringify({ state })
    });
    cloudStatus = `Synced ${saved.updated_at ? new Date(saved.updated_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "now"}`;
    if (manual) showToast(cloudStatus);
    if (currentScreen === "more") renderMore();
  } catch (error) {
    cloudStatus = error.message || "Cloud sync failed";
    if (manual) showToast(cloudStatus);
    if (currentScreen === "more") renderMore();
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-adonis-pin": getCloudPin(),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || `${response.status} ${response.statusText}` };
  }
  if (!response.ok) throw new Error(data.error || `${response.status} ${response.statusText}`);
  return data;
}

function hydrateState(nextState, currentState = null) {
  const nutrition = normalizeNutritionState(nextState);
  return {
    ...structuredClone(defaultState),
    ...nextState,
    nutritionLogs: nutrition.nutritionLogs,
    nutritionDay: nutrition.nutritionDay,
    settings: { ...defaultState.settings, ...(nextState.settings || {}) },
    exerciseHistory: nextState.exerciseHistory || {},
    morningWeights: nextState.morningWeights || seedMorningWeights(nextState.progressLogs),
    activeWorkout: normalizeActiveWorkout(nextState.activeWorkout),
    savedMeals: mergeSavedMeals(currentState?.savedMeals || [], nextState.savedMeals || []),
    habitLogs: nextState.habitLogs || {},
    coachMessages: nextState.coachMessages?.length ? nextState.coachMessages : structuredClone(defaultState.coachMessages)
  };
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeTextarea(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function fmt(value) {
  return Number(value || 0).toFixed(1).replace(".0", "");
}

function formatRest(seconds) {
  return secondsToClock(seconds).replace(/^0/, "");
}

function secondsToClock(total) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function todayIso() {
  return toAppIsoDate(new Date());
}

function entryDaysAgo(days, data) {
  const date = parseLocalDate(todayIso());
  date.setDate(date.getDate() - days);
  return { date: toLocalIsoDate(date), ...data };
}

function isoDaysAgo(days) {
  const date = parseLocalDate(todayIso());
  date.setDate(date.getDate() - days);
  return toLocalIsoDate(date);
}

function appWeekday() {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    weekday: "short"
  }).format(new Date());
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
}

function toAppIsoDate(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function toLocalIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(start, end) {
  return Math.abs((new Date(end) - new Date(start)) / 86400000);
}

function parseLocalDate(date) {
  return new Date(`${date}T00:00:00`);
}

function programElapsedDays() {
  const start = parseLocalDate(state.settings.startDate || DEFAULT_PROGRAM_START_DATE);
  const today = parseLocalDate(todayIso());
  const diff = Math.floor((today - start) / 86400000);
  return Math.max(0, Math.min(83, diff));
}

function programWeek() {
  return Math.floor(programElapsedDays() / 7) + 1;
}

function programDay() {
  return programElapsedDays() + 1;
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
}
