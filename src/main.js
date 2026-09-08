import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './style.css';

import vertexShader from './shaders/blackhole.vert.glsl?raw';
import fragmentShader from './shaders/blackhole.frag.glsl?raw';
import { PHYSICS_DEFAULTS, TARGET_PROFILES, COLOR_PALETTES, CAMERA_PRESETS, calculatePhysicsMetrics, LATEX_FORMULAS } from './physics/math.js';

// --- State ---
const state = {
  ...PHYSICS_DEFAULTS,
  isPaused: false,
  isTimePaused: false,
  autoTrackIsco: true,
  targetCamPos: new THREE.Vector3(),
  targetCamLookAt: new THREE.Vector3(),
  isTransitioningCam: false,
  transitionProgress: 0,
  startCamPos: new THREE.Vector3(),
  startCamLookAt: new THREE.Vector3(),
};

let gui;

// --- DOM ---
const container = document.getElementById('canvas-container');
const guiContainer = document.getElementById('gui-container');
const mathModal = document.getElementById('math-modal');
const btnMath = document.getElementById('btn-math');
const btnCloseModal = document.getElementById('modal-close');
const btnReset = document.getElementById('btn-reset');
const btnSnapshot = document.getElementById('btn-snapshot');
const btnPause = document.getElementById('btn-pause');
const pauseLabel = document.getElementById('pause-label');
const btnOrbitToggle = document.getElementById('btn-orbit-toggle');
const orbitLabel = document.getElementById('orbit-label');
const btnZen = document.getElementById('btn-zen');
const btnZenRestore = document.getElementById('btn-zen-restore');
const uiOverlay = document.getElementById('ui-overlay');
const touchHint = document.getElementById('touch-hint');
const fpsCounter = document.getElementById('fps-counter');
const targetTitleDesc = document.getElementById('target-title-desc');
const valMassSolar = document.getElementById('val-mass-solar');
const valTargetName = document.getElementById('val-target-name');
const valRsKm = document.getElementById('val-rs-km');
const valErgoKm = document.getElementById('val-ergo-km');
const valAngularSize = document.getElementById('val-angular-size');
const valSpin = document.getElementById('val-spin');
const valFrameDrag = document.getElementById('val-frame-drag');
const valVisco = document.getElementById('val-visco');
const valIscoRadius = document.getElementById('val-isco-radius');
const badgeTarget = document.getElementById('badge-target');
const badgeSpectral = document.getElementById('badge-spectral');
const badgeJet = document.getElementById('badge-jet');
const badgeDoppler = document.getElementById('badge-doppler');
const valSpectralLambda = document.getElementById('val-spectral-lambda');
const valSpectralDesc = document.getElementById('val-spectral-desc');
const timeSlider = document.getElementById('time-slider');
const valTimeDisplay = document.getElementById('val-time-display');
const btnTimePlay = document.getElementById('btn-time-play');
const valActiveEqCount = document.getElementById('val-active-eq-count');
const countModalActive = document.getElementById('count-modal-active');
const valFeaturedEqName = document.getElementById('val-featured-eq-name');
const btnInspectMath = document.getElementById('btn-inspect-math');
const liveEquationStrip = document.getElementById('live-equation-strip');
const filterEqActive = document.getElementById('filter-eq-active');
const filterEqAll = document.getElementById('filter-eq-all');
let currentMathFilter = 'all';

// --- Three.js ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(state.camFOV, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(...CAMERA_PRESETS.interstellar.pos);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- Orbit Controls ---
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableRotate = true;
controls.rotateSpeed = 0.9;
controls.enableZoom = true;
controls.zoomSpeed = 1.2;
controls.minDistance = 2.0;
controls.maxDistance = 75.0;
controls.target.set(0, 0, 0);
controls.minPolarAngle = 0.001;
controls.maxPolarAngle = Math.PI - 0.001;
controls.autoRotate = state.autoRotate;
controls.autoRotateSpeed = state.autoRotateSpeed;
// Touch Hand Gestures: 1 finger rotate 360°, 2 finger pinch zoom & pan
controls.touches = {
  ONE: THREE.TOUCH.ROTATE,
  TWO: THREE.TOUCH.DOLLY_PAN,
};

// --- Uniforms ---
const uniforms = {
  uCamPos: { value: camera.position },
  uCamInvProjection: { value: new THREE.Matrix4() },
  uCamInvView: { value: new THREE.Matrix4() },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  uTime: { value: 0 },
  uMass: { value: state.mass },
  uRs: { value: state.rs },
  uSpin: { value: state.spin },
  uDiskInner: { value: state.diskInner },
  uDiskOuter: { value: state.diskOuter },
  uDiskDensity: { value: state.diskDensity },
  uDiskBrightness: { value: state.diskBrightness },
  uDiskSpeed: { value: state.diskSpeed },
  uEnableJet: { value: state.enableJet },
  uDopplerEnabled: { value: state.dopplerEnabled },
  uGravRedshiftEnabled: { value: state.gravRedshiftEnabled },
  uLensingStrength: { value: state.lensingStrength },
  uTargetMode: { value: 1.0 },
  uColorPalette: { value: 0 },
  uMaxSteps: { value: state.maxSteps },
  uStepSize: { value: state.stepSize },
};

const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms, depthWrite: false, depthTest: false });
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(quad);

// --- Matrix Update ---
function updateMatrices() {
  camera.updateMatrixWorld();
  uniforms.uCamPos.value.copy(camera.position);
  uniforms.uCamInvProjection.value.copy(camera.projectionMatrixInverse);
  uniforms.uCamInvView.value.copy(camera.matrixWorld);
}

// --- Sync All Uniforms & Telemetry ---
function syncUniforms() {
  const m = calculatePhysicsMetrics(state.mass, state.spin, state.target);

  if (valTargetName) valTargetName.textContent = m.targetName;
  if (valMassSolar) valMassSolar.textContent = m.massSolar.toExponential(2);
  if (valRsKm) valRsKm.textContent = `${m.r_plus_km.toExponential(2)} km`;
  if (valErgoKm) valErgoKm.textContent = `Ergo r_E: ${m.r_ergo_km.toExponential(2)} km`;
  if (valAngularSize) valAngularSize.textContent = `${m.angularDiameterMuAs.toFixed(1)} μas (EHT)`;
  if (valSpin) valSpin.textContent = state.spin.toFixed(2);
  if (valFrameDrag) valFrameDrag.textContent = `Ω_H: ${(m.omegaFrameDragging * 100).toFixed(1)}%`;
  if (valVisco) valVisco.textContent = `${(m.v_isco_fraction * 100).toFixed(1)}% c`;
  if (valIscoRadius) valIscoRadius.textContent = `r_ISCO: ${(m.r_isco / (0.5 * m.rs)).toFixed(2)} M`;
  if (badgeTarget) badgeTarget.textContent = `Target: ${state.target === 'sgrA' ? 'Sgr A*' : 'M87*'}`;
  if (badgeJet) {
    badgeJet.className = `badge ${state.enableJet ? 'on' : 'off'}`;
    badgeJet.textContent = `Jet: ${state.enableJet ? 'ON' : 'OFF'}`;
  }
  if (badgeDoppler) {
    badgeDoppler.className = `badge ${state.dopplerEnabled ? 'on' : 'off'}`;
    badgeDoppler.textContent = `Doppler: ${state.dopplerEnabled ? 'ON' : 'OFF'}`;
  }

  const curPalette = COLOR_PALETTES[state.colorPalette] || COLOR_PALETTES[0];
  if (badgeSpectral) badgeSpectral.textContent = `Band: ${curPalette.shortName}`;
  if (valSpectralLambda) valSpectralLambda.textContent = `${curPalette.wavelength} — ${curPalette.instrument}`;
  if (valSpectralDesc) valSpectralDesc.textContent = curPalette.physics;

  if (targetTitleDesc) {
    targetTitleDesc.textContent = state.target === 'sgrA'
      ? 'Sagittarius A* (Milky Way Center)'
      : 'M87* (Messier 87 Monster BH)';
  }

  controls.autoRotate = state.autoRotate;
  controls.autoRotateSpeed = state.autoRotateSpeed;
  if (btnOrbitToggle) {
    btnOrbitToggle.classList.toggle('active', state.autoRotate);
    if (orbitLabel) orbitLabel.textContent = '360° Orbit';
  }

  state.rs = m.rs;
  if (state.autoTrackIsco) {
    state.diskInner = m.r_isco;
  }
  // Clamp inner rim so it cannot penetrate inside the outer event horizon r_+
  state.diskInner = Math.max(m.r_plus * 1.02, state.diskInner);

  uniforms.uMass.value = state.mass;
  uniforms.uRs.value = state.rs;
  uniforms.uSpin.value = state.spin;
  uniforms.uDiskInner.value = state.diskInner;
  uniforms.uDiskOuter.value = state.diskOuter;
  uniforms.uDiskDensity.value = state.diskDensity;
  uniforms.uDiskBrightness.value = state.diskBrightness;
  uniforms.uDiskSpeed.value = state.diskSpeed;
  uniforms.uEnableJet.value = state.enableJet;
  uniforms.uDopplerEnabled.value = state.dopplerEnabled;
  uniforms.uGravRedshiftEnabled.value = state.gravRedshiftEnabled;
  uniforms.uLensingStrength.value = state.lensingStrength;
  uniforms.uTargetMode.value = state.target === 'm87' ? 1.0 : 0.0;
  uniforms.uColorPalette.value = Number(state.colorPalette);
  uniforms.uMaxSteps.value = Number(state.maxSteps);
  uniforms.uStepSize.value = state.stepSize;

  updateActiveEquations();
}

// --- Active Equations Inspector ---
function updateActiveEquations() {
  const activeKeys = new Set();

  // 1. Kerr Metric: Always active (spacetime geometry)
  activeKeys.add('kerrMetric');
  // 2. Frame Dragging: Active when spin > 0
  if (state.spin > 0.001) activeKeys.add('frameDragging');
  // 3. Kerr ISCO: Always active (inner boundary)
  activeKeys.add('kerrIsco');
  // 4. Ergosphere: Active when spin > 0
  if (state.spin > 0.001) activeKeys.add('ergosphere');
  // 5. Lense-Thirring Deflection: Always active (light ray geodesic deflection)
  activeKeys.add('lenseThirring');
  // 6. Gravitational Redshift: Active when enabled
  if (state.gravRedshiftEnabled) activeKeys.add('gravitationalRedshift');
  // 7. Shakura-Sunyaev Disk: Always active (accretion disk profile)
  activeKeys.add('shakuraSunyaev');
  // 8. Blandford-Znajek Jet: Active when jet is enabled
  if (state.enableJet) activeKeys.add('blandfordZnajek');
  // 9. EHT Angular Diameter: Always active (astrometric shadow scale)
  activeKeys.add('ehtAngularDiameter');
  // 10. Relativistic Doppler Color Shift: Active in optical band or when Doppler is enabled
  if (state.colorPalette === 1 || state.dopplerEnabled) activeKeys.add('dopplerColorShift');
  // 11. Synchrotron Beaming: Active in EHT or X-Ray mode
  if (state.colorPalette === 0 || state.colorPalette === 3) activeKeys.add('synchrotronBeaming');

  const count = activeKeys.size;
  if (valActiveEqCount) valActiveEqCount.textContent = `${count}`;
  if (countModalActive) countModalActive.textContent = `${count}`;

  // Update formula cards in GR Math modal
  document.querySelectorAll('.formula-card').forEach((card) => {
    const eqKey = card.dataset.eq;
    if (!eqKey) return;
    const isRunning = activeKeys.has(eqKey);
    card.classList.toggle('is-running', isRunning);

    const badge = card.querySelector('.eq-status-badge');
    if (badge) {
      if (isRunning) {
        badge.className = 'eq-status-badge running';
        badge.textContent = '● RUNNING';
      } else {
        badge.className = 'eq-status-badge idle';
        badge.textContent = 'IDLE (Condition inactive)';
      }
    }

    if (currentMathFilter === 'active') {
      card.classList.toggle('is-hidden', !isRunning);
    } else {
      card.classList.remove('is-hidden');
    }
  });

  // Featured Equation in on-screen HUD strip
  let featuredKey = 'shakuraSunyaev';
  let featuredName = 'Shakura-Sunyaev Temperature Field';

  if (state.colorPalette === 1) {
    featuredKey = 'dopplerColorShift';
    featuredName = 'Relativistic Doppler Color Shift';
  } else if (state.colorPalette === 0) {
    featuredKey = 'synchrotronBeaming';
    featuredName = 'EHT 1.3mm Synchrotron Beaming Law';
  } else if (state.colorPalette === 3) {
    featuredKey = 'synchrotronBeaming';
    featuredName = 'X-Ray Corona Relativistic Beaming';
  } else if (state.colorPalette === 2) {
    featuredKey = 'shakuraSunyaev';
    featuredName = 'Shakura-Sunyaev T(r) Isothermal Contours';
  } else if (state.colorPalette === 4) {
    featuredKey = 'shakuraSunyaev';
    featuredName = 'Extended Dusty Torus T(r) Profile';
  }

  if (valFeaturedEqName) valFeaturedEqName.textContent = featuredName;
}

// --- Palette Sync (pills + GUI dropdown) ---
function switchPalette(val, toast = true) {
  const v = Number(val);
  state.colorPalette = v;
  uniforms.uColorPalette.value = v;

  document.querySelectorAll('.palette-pill').forEach((p) => {
    p.classList.toggle('active', Number(p.dataset.palette) === v);
  });

  if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());

  syncUniforms();
  if (toast) showToast(`Band: ${COLOR_PALETTES[v]?.name || v}`);
}

// --- Target Switch ---
function switchTarget(key) {
  const p = TARGET_PROFILES[key];
  if (!p) return;

  state.target = key;
  state.spin = p.spin;
  state.diskSpeed = p.diskSpeed;
  state.diskDensity = p.diskDensity;
  state.diskBrightness = p.diskBrightness;
  state.enableJet = p.hasJet;
  state.autoTrackIsco = true;
  const m = calculatePhysicsMetrics(state.mass, state.spin, key);
  state.diskInner = m.r_isco;

  document.querySelectorAll('.target-pill').forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.target === key);
  });

  switchPalette(p.colorPalette, false);

  if (p.cameraPos) {
    CAMERA_PRESETS.interstellar.pos = p.cameraPos;
    switchCameraPreset('interstellar');
  }

  if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
  syncUniforms();
  showToast(`Target: ${p.name}`);
}

// --- Camera Preset ---
function switchCameraPreset(key) {
  const preset = CAMERA_PRESETS[key];
  if (!preset) return;

  state.startCamPos.copy(camera.position);
  state.startCamLookAt.copy(controls.target);
  state.targetCamPos.set(...preset.pos);
  state.targetCamLookAt.set(...preset.target);
  state.transitionProgress = 0;
  state.isTransitioningCam = true;

  if (preset.fov) {
    state.camFOV = preset.fov;
    camera.fov = preset.fov;
    camera.updateProjectionMatrix();
  }

  document.querySelectorAll('.preset-pill').forEach((p) => {
    p.classList.toggle('active', p.dataset.preset === key);
  });
  showToast(`View: ${preset.name}`);
}

// --- Reset ---
function resetToDefaults() {
  Object.assign(state, PHYSICS_DEFAULTS);
  state.autoTrackIsco = true;
  switchTarget('m87');
  switchPalette(0, false);
  if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
  showToast('Reset to scientific defaults');
}

// --- Toast ---
function showToast(msg) {
  const c = document.getElementById('toast-container');
  if (!c) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// --- GUI Setup ---
function setupGUI() {
  gui = new GUI({ container: guiContainer, title: '4D Spacetime Lab' });
  gui.add({ reset: resetToDefaults }, 'reset').name('🔄 Reset Defaults');

  const tf = gui.addFolder('Astronomical Target');
  tf.add(state, 'target', { 'Sgr A* (Milky Way)': 'sgrA', 'M87* (Monster BH)': 'm87' })
    .name('Black Hole').onChange((v) => switchTarget(v));
  tf.add(state, 'enableJet').name('Polar Jet').onChange(syncUniforms);

  const df = gui.addFolder('Accretion Disk & Sensor');
  df.add(state, 'colorPalette', {
    'EHT 1.3mm Radio (VLBI)': 0,
    'Relativistic Optical': 1,
    'Thermal Heatmap': 2,
    'X-Ray 0.5-10 keV': 3,
    'Infrared Torus (JWST)': 4,
  }).name('Spectral Band').onChange((v) => switchPalette(v));
  df.add(state, 'diskDensity', 0.2, 3.0, 0.05).name('Gas Density').onChange(syncUniforms);
  df.add(state, 'diskBrightness', 0.5, 5.0, 0.1).name('Radiance').onChange(syncUniforms);
  df.add(state, 'diskInner', 1.0, 8.0, 0.1)
    .name('Inner Rim Radius')
    .listen()
    .onChange((v) => {
      state.autoTrackIsco = false;
      syncUniforms();
      if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
    });

  df.add(state, 'autoTrackIsco')
    .name('Auto-ISCO Lock')
    .listen()
    .onChange((v) => {
      if (v) {
        const m = calculatePhysicsMetrics(state.mass, state.spin, state.target);
        state.diskInner = m.r_isco;
        showToast(`Inner rim locked to ISCO: ${m.r_isco.toFixed(2)} M`);
      } else {
        showToast('Manual inner rim unlocked');
      }
      syncUniforms();
      if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
    });

  df.add(state, 'diskOuter', 8.0, 22.0, 0.5).name('Outer Edge').onChange(syncUniforms);
  df.add(state, 'diskSpeed', 0.0, 3.0, 0.1).name('Rotation').onChange(syncUniforms);

  const rf = gui.addFolder('General Relativity');
  rf.add(state, 'mass', 0.5, 2.5, 0.1).name('Mass (M)').onChange(() => {
    syncUniforms();
    if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
  });
  rf.add(state, 'spin', 0.0, 0.99, 0.05).name('Kerr Spin (a*)').onChange(() => {
    syncUniforms();
    if (gui) gui.controllersRecursive().forEach((c) => c.updateDisplay());
  });
  rf.add(state, 'lensingStrength', 0.0, 2.0, 0.1).name('Light Deflection').onChange(syncUniforms);
  rf.add(state, 'dopplerEnabled').name('Doppler Beaming').onChange(syncUniforms);
  rf.add(state, 'gravRedshiftEnabled').name('Grav. Redshift').onChange(syncUniforms);

  const cf = gui.addFolder('360° Orbit & Time');
  cf.add(state, 'autoRotate').name('Auto Orbit').onChange(syncUniforms);
  cf.add(state, 'autoRotateSpeed', 0.1, 4.0, 0.1).name('Speed').onChange(syncUniforms);
  cf.add(state, 'timeSpeed', 0.1, 5.0, 0.1).name('4D Time Speed').onChange(syncUniforms);
  cf.add(state, 'camFOV', 30, 85, 1).name('FOV').onChange((v) => { camera.fov = v; camera.updateProjectionMatrix(); });
  cf.close();

  const gf = gui.addFolder('GPU Engine');
  gf.add(state, 'maxSteps', 60, 240, 10).name('Max Steps').onChange(syncUniforms);
  gf.add(state, 'stepSize', 0.04, 0.18, 0.01).name('Step Size').onChange(syncUniforms);
  gf.close();

  gui.open();
}

// --- KaTeX ---
function renderLatex() {
  const pairs = [
    ['formula-kerr', 'kerrMetric'],
    ['formula-framedrag', 'frameDragging'],
    ['formula-kerr-isco', 'kerrIsco'],
    ['formula-ergosphere', 'ergosphere'],
    ['formula-lensethirring', 'lenseThirring'],
    ['formula-redshift', 'gravitationalRedshift'],
    ['formula-shakura', 'shakuraSunyaev'],
    ['formula-blandford', 'blandfordZnajek'],
    ['formula-eht', 'ehtAngularDiameter'],
    ['formula-doppler-shift', 'dopplerColorShift'],
    ['formula-synchrotron', 'synchrotronBeaming'],
  ];
  for (const [elId, key] of pairs) {
    const el = document.getElementById(elId);
    if (el && LATEX_FORMULAS[key]) {
      try { katex.render(LATEX_FORMULAS[key], el, { displayMode: true, throwOnError: false }); }
      catch (e) { console.warn('KaTeX error:', key, e); }
    }
  }
}

// --- Events ---
function setupEvents() {
  // Target pills
  document.querySelectorAll('.target-pill').forEach((p) => {
    p.addEventListener('click', () => switchTarget(p.dataset.target));
  });

  // Palette pills
  document.querySelectorAll('.palette-pill').forEach((p) => {
    p.addEventListener('click', () => switchPalette(p.dataset.palette));
  });

  // Preset pills
  document.querySelectorAll('.preset-pill').forEach((p) => {
    p.addEventListener('click', () => switchCameraPreset(p.dataset.preset));
  });

  // Time slider
  if (timeSlider) {
    timeSlider.addEventListener('input', (e) => {
      state.currentTime4D = Number(e.target.value);
      uniforms.uTime.value = state.currentTime4D;
      if (valTimeDisplay) valTimeDisplay.textContent = `t: ${state.currentTime4D.toFixed(1)}s / 120s`;
    });
  }

  // Time play/pause
  if (btnTimePlay) {
    btnTimePlay.addEventListener('click', () => {
      state.isTimePaused = !state.isTimePaused;
      btnTimePlay.innerHTML = state.isTimePaused
        ? '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M8,5.14V19.14L19,12.14L8,5.14Z"/></svg>'
        : '<svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><path d="M14,19H18V5H14M6,19H10V5H6V19Z"/></svg>';
      showToast(state.isTimePaused ? 'Time paused' : 'Time playing');
    });
  }

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.timeSpeed = Number(btn.dataset.speed);
      showToast(`Speed: ${state.timeSpeed}x`);
    });
  });

  // 360° Auto-Orbit toggle button
  if (btnOrbitToggle) {
    btnOrbitToggle.addEventListener('click', () => {
      state.autoRotate = !state.autoRotate;
      controls.autoRotate = state.autoRotate;
      btnOrbitToggle.classList.toggle('active', state.autoRotate);
      if (orbitLabel) orbitLabel.textContent = '360° Orbit';
      showToast(state.autoRotate ? '360° Auto-Orbit started' : '360° Auto-Orbit paused');
    });
  }

  // Zen Mode (Hide HUD for clean 360° touch / mouse view)
  function toggleZenMode() {
    if (!uiOverlay) return;
    const isZen = uiOverlay.classList.toggle('zen-mode');
    if (btnZenRestore) btnZenRestore.classList.toggle('hidden', !isZen);
    showToast(isZen ? 'Zen View: 360° Touch/Mouse active (Double-tap to restore)' : 'Controls restored');
  }

  if (btnZen) btnZen.addEventListener('click', toggleZenMode);
  if (btnZenRestore) btnZenRestore.addEventListener('click', toggleZenMode);

  // Canvas interaction & double-tap to toggle Zen Mode
  let lastTap = 0;
  renderer.domElement.addEventListener('pointerdown', () => {
    if (touchHint) touchHint.style.display = 'none';
    const now = Date.now();
    if (now - lastTap < 320) {
      toggleZenMode();
    }
    lastTap = now;
  });

  // Math Modal & Live Equation Inspector
  function openMathModal(filter = 'all') {
    if (!mathModal) return;
    currentMathFilter = filter;
    if (filterEqActive && filterEqAll) {
      filterEqActive.classList.toggle('active', filter === 'active');
      filterEqAll.classList.toggle('active', filter === 'all');
    }
    updateActiveEquations();
    renderLatex();
    mathModal.classList.add('open');
  }

  if (btnInspectMath) {
    btnInspectMath.addEventListener('click', (e) => {
      e.stopPropagation();
      openMathModal('all');
    });
  }

  if (liveEquationStrip) {
    liveEquationStrip.addEventListener('click', () => openMathModal('all'));
  }

  if (btnMath && mathModal && btnCloseModal) {
    btnMath.addEventListener('click', () => openMathModal('all'));
    btnCloseModal.addEventListener('click', () => mathModal.classList.remove('open'));
    mathModal.addEventListener('click', (e) => { if (e.target === mathModal) mathModal.classList.remove('open'); });
  }

  if (filterEqActive) {
    filterEqActive.addEventListener('click', () => {
      currentMathFilter = 'active';
      filterEqActive.classList.add('active');
      filterEqAll.classList.remove('active');
      updateActiveEquations();
    });
  }

  if (filterEqAll) {
    filterEqAll.addEventListener('click', () => {
      currentMathFilter = 'all';
      filterEqAll.classList.add('active');
      filterEqActive.classList.remove('active');
      updateActiveEquations();
    });
  }

  // Reset
  if (btnReset) btnReset.addEventListener('click', resetToDefaults);

  // Pause
  if (btnPause) {
    btnPause.addEventListener('click', () => {
      state.isPaused = !state.isPaused;
      btnPause.classList.toggle('active', state.isPaused);
      if (pauseLabel) pauseLabel.textContent = state.isPaused ? 'Resume' : 'Pause';
      showToast(state.isPaused ? 'Paused' : 'Resumed');
    });
  }

  // Snapshot
  if (btnSnapshot) {
    btnSnapshot.addEventListener('click', () => {
      updateMatrices();
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `blackhole-${state.target}-${Date.now()}.png`;
      a.href = url;
      a.click();
      showToast('Screenshot saved!');
    });
  }

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });
}

// --- Animation ---
let lastT = performance.now(), frameCnt = 0, fpsT = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = (now - lastT) * 0.001;
  lastT = now;

  if (!state.isPaused && !state.isTimePaused) {
    state.currentTime4D = (state.currentTime4D + dt * state.timeSpeed) % 120.0;
    uniforms.uTime.value = state.currentTime4D;
    if (timeSlider) timeSlider.value = state.currentTime4D.toFixed(1);
    if (valTimeDisplay) valTimeDisplay.textContent = `t: ${state.currentTime4D.toFixed(1)}s / 120s`;
  }

  if (state.isTransitioningCam) {
    state.transitionProgress += dt * 1.5;
    if (state.transitionProgress >= 1.0) { state.transitionProgress = 1.0; state.isTransitioningCam = false; }
    const t = 1 - Math.pow(1 - state.transitionProgress, 3);
    camera.position.lerpVectors(state.startCamPos, state.targetCamPos, t);
    controls.target.lerpVectors(state.startCamLookAt, state.targetCamLookAt, t);
  }

  controls.update();
  updateMatrices();
  renderer.render(scene, camera);

  frameCnt++;
  if (now - fpsT >= 1000) {
    if (fpsCounter) fpsCounter.textContent = `${Math.round(frameCnt * 1000 / (now - fpsT))} FPS`;
    frameCnt = 0;
    fpsT = now;
  }
}

// --- Init ---
function init() {
  setupGUI();
  switchTarget('m87');
  renderLatex();
  setupEvents();
  updateMatrices();
  requestAnimationFrame(animate);
  showToast('4D Black Hole Simulator — Sgr A* & M87*');
}

init()
