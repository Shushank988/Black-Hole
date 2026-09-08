/**
 * Real Astronomical Data & Kerr Spacetime General Relativity Physics
 * Event Horizon Telescope (EHT 2019 M87* & 2022 Sgr A* Data Releases)
 */

export const TARGET_PROFILES = {
  sgrA: {
    id: 'sgrA',
    name: 'Sagittarius A* (Milky Way Core)',
    massSolar: 4.15e6,        // 4.15 Million Solar Masses
    distanceKpc: 8.178,       // 8.178 kiloparsecs (26,700 light-years)
    angularDiameterMuAs: 51.8,// 51.8 microarcseconds (EHT 2022)
    rsKm: 1.226e7,             // 12.26 Million km (~0.082 AU)
    spin: 0.90,               // High Kerr spin
    diskSpeed: 1.8,           // Fast orbital period (~30 min at ISCO)
    diskDensity: 0.95,
    diskBrightness: 1.65,
    hasJet: false,            // Quiescent polar jet
    colorPalette: 0,          // EHT Sgr A* Gold/Amber
    targetMode: 0.0,
    cameraPos: [0.0, 3.2, 15.5],
    description: 'Central supermassive black hole of the Milky Way. Surrounded by S-Star cluster (S2) and dense galactic bulge.',
  },
  m87: {
    id: 'm87',
    name: 'M87* (Messier 87 Core)',
    massSolar: 6.5e9,         // 6.5 Billion Solar Masses
    distanceMpc: 16.8,        // 16.8 Megaparsecs (55 Million light-years)
    angularDiameterMuAs: 42.0,// 42.0 microarcseconds (EHT 2019)
    rsKm: 1.92e10,            // 19.2 Billion km (~128.3 AU)
    spin: 0.94,               // Extreme Kerr spin
    diskSpeed: 0.6,           // Immense plasma timescale
    diskDensity: 1.15,
    diskBrightness: 1.95,
    hasJet: true,             // Collimated Relativistic Polar Jet accelerating to >0.99c
    colorPalette: 0,          // EHT M87 Crescent Spectrum
    targetMode: 1.0,
    cameraPos: [-12.5, 3.2, 17.0],
    description: 'Monster supermassive black hole in galaxy M87. Features a 5,000 light-year relativistic polar plasma jet.',
  },
};

export const PHYSICS_DEFAULTS = {
  target: 'm87',
  mass: 1.0,           // Mass scale
  spin: 0.94,          // Kerr dimensionless spin parameter a*
  rs: 2.0,            // Schwarzschild radius r_s = 2GM/c^2
  r_ph: 3.0,          // Photon sphere radius = 1.5 r_s
  r_isco: 6.0,        // ISCO radius
  diskInner: 3.0,     // Accretion disk inner edge
  diskOuter: 14.0,    // Accretion disk outer boundary
  diskDensity: 1.15,  // Disk gas density
  diskBrightness: 1.95,// Radiative flux intensity
  diskSpeed: 0.6,     // Time evolution speed
  enableJet: true,    // Relativistic Polar Jet toggle
  dopplerEnabled: true,
  gravRedshiftEnabled: true,
  lensingStrength: 1.0,
  colorPalette: 0,
  maxSteps: 160,
  stepSize: 0.07,
  autoRotate: true,
  autoRotateSpeed: 0.8,
  timeSpeed: 1.0,
  currentTime4D: 0.0,
  camFOV: 50,
};

export const COLOR_PALETTES = [
  {
    name: 'EHT 1.3mm Radio',
    shortName: 'EHT 1.3mm',
    value: 0,
    wavelength: '1.3 mm (230 GHz)',
    instrument: 'Event Horizon Telescope (VLBI)',
    physics: 'Sub-mm synchrotron emission piercing dust; highlights photon ring & shadow silhouette.',
    beamingLaw: 'I_nu ~ delta^3.6 (Synchrotron beaming)',
  },
  {
    name: 'Relativistic Optical',
    shortName: 'Optical',
    value: 1,
    wavelength: '380 - 750 nm (Visible)',
    instrument: 'Hubble / ELT / Eye (Relativistic Doppler)',
    physics: 'Doppler frequency shift: approaching gas blue-shifts to UV/cyan, receding gas red-shifts to deep crimson.',
    beamingLaw: 'nu_obs = delta * nu_emit (Doppler Color Shift)',
  },
  {
    name: 'Thermal Heatmap',
    shortName: 'Thermal',
    value: 2,
    wavelength: 'Multi-color Blackbody',
    instrument: 'Astrophysical Thermodynamic Model',
    physics: 'Shakura-Sunyaev T(r) effective temperature field with sharp isothermal contours deformed by frame-dragging.',
    beamingLaw: 'T_eff ~ r^(-3/4) & Isothermal Contours',
  },
  {
    name: 'High-Energy X-Ray',
    shortName: 'X-Ray',
    value: 3,
    wavelength: '0.1 - 10 nm (0.5 - 10 keV)',
    instrument: 'Chandra / NuSTAR / XRISM',
    physics: 'Million-Kelvin ISCO rim & corona inverse Compton glow; outer cold disk emits 0 X-rays.',
    beamingLaw: 'I ~ delta^4.5 (Extreme Corona Beaming)',
  },
  {
    name: 'Infrared Dust Penetration',
    shortName: 'Infrared',
    value: 4,
    wavelength: '1 - 10 µm (Near/Mid-IR)',
    instrument: 'JWST NIRCam / VLT GRAVITY',
    physics: 'Penetrates interstellar dust; reveals extended outer accretion torus & spiral density feeding streams.',
    beamingLaw: 'Dust Penetration & Extended Torus (r <= 22M)',
  },
];
export const SPECTRAL_REGIMES = COLOR_PALETTES;

export const CAMERA_PRESETS = {
  interstellar: {
    pos: [-12.5, 3.2, 17.0],
    target: [0, 0, 0],
    fov: 50,
    name: 'Astronomical EHT View (Lensing & Jet)',
  },
  polar: {
    pos: [0.1, 18.0, 0.1],
    target: [0, 0, 0],
    fov: 55,
    name: 'Polar Face-on View (No Humps)',
  },
  photonRing: {
    pos: [0.0, 0.5, 7.5],
    target: [0, 0, 0],
    fov: 55,
    name: 'Photon Sphere Grazing View',
  },
  eclipse: {
    pos: [15.0, 0.1, 0.0],
    target: [0, 0, 0],
    fov: 46,
    name: 'Equatorial Profile View',
  },
};

/**
 * Calculates General Relativity parameters for Sgr A* and M87*
 */
export function calculatePhysicsMetrics(mass, spin = 0.94, targetKey = 'm87') {
  const profile = TARGET_PROFILES[targetKey] || TARGET_PROFILES.m87;
  const G = 6.6743e-11;
  const c = 2.99792458e8;
  const solarMassKg = 1.9884e30;

  const totalMassSolar = mass * profile.massSolar;
  const M_kg = totalMassSolar * solarMassKg;
  const r_s_meters = (2 * G * M_kg) / (c * c);

  // Kerr ISCO radius calculation (Bardeen, Press, Teukolsky 1972)
  const a = Math.min(0.999, Math.max(0.0, spin));
  const Z1 = 1 + Math.cbrt(1 - a * a) * (Math.cbrt(1 + a) + Math.cbrt(1 - a));
  const Z2 = Math.sqrt(3 * a * a + Z1 * Z1);
  const r_isco_factor = 3 + Z2 - Math.sqrt((3 - Z1) * (3 + Z1 + 2 * Z2));
  
  const r_isco = (r_isco_factor / 2) * 2.0 * mass;
  const v_isco_fraction = 1.0 / Math.sqrt(Math.max(1.2, r_isco_factor));
  const b_crit = (3 * Math.sqrt(3) / 2) * 2.0 * mass;

  // Frame Dragging Angular Frequency at Horizon Omega_H = a / (2 * r_H)
  const r_horizon_factor = 1 + Math.sqrt(1 - a * a);
  const omegaFrameDragging = a / (2.0 * r_horizon_factor);

  // Kerr Outer Horizon r_+ = M + sqrt(M^2 - a^2) where M = 0.5 * r_s
  const r_plus_factor = 0.5 * (1 + Math.sqrt(Math.max(0.001, 1 - a * a)));
  const r_plus_meters = r_plus_factor * r_s_meters;
  const r_plus_km = r_plus_meters / 1000;
  const r_plus_sim = r_plus_factor * 2.0 * mass;
  const r_ergo_km = r_s_meters / 1000;

  return {
    targetName: profile.name,
    massSolar: totalMassSolar,
    angularDiameterMuAs: profile.angularDiameterMuAs,
    rs: 2.0 * mass,
    r_plus: r_plus_sim,
    r_plus_km,
    r_ergo_km,
    r_ph: 3.0 * mass,
    r_isco,
    b_crit,
    v_isco_fraction,
    omegaFrameDragging,
    r_s_meters,
    rsKm: (r_s_meters / 1000),
  };
}

// Kerr Spacetime & EHT Astrophysics Formulas
export const LATEX_FORMULAS = {
  kerrMetric: String.raw`\begin{aligned} ds^2 = &-\left(1 - \frac{r_s r}{\rho^2}\right) c^2 dt^2 - \frac{2 r_s r a \sin^2\theta}{\rho^2} c\,dt\,d\phi + \frac{\rho^2}{\Delta} dr^2 \\ &+ \rho^2 d\theta^2 + \left(r^2 + a^2 + \frac{r_s r a^2 \sin^2\theta}{\rho^2}\right)\sin^2\theta\, d\phi^2 \end{aligned}`,
  frameDragging: String.raw`\Omega = -\frac{g_{t\phi}}{g_{\phi\phi}} = \frac{a\, r_s\, r\, c}{(r^2+a^2)^2 - a^2 \Delta \sin^2\theta}, \quad \Omega_H = \frac{a\, c}{2\, r_H}`,
  kerrIsco: String.raw`r_{\text{ISCO}} = M\!\left(3 + Z_2 \mp \sqrt{(3-Z_1)(3+Z_1+2Z_2)}\right), \quad a^* \in [0,\, 0.998]`,
  ergosphere: String.raw`r_E(\theta) = M + \sqrt{M^2 - a^2 \cos^2\theta}, \quad r_+ = M + \sqrt{M^2 - a^2}`,
  gravitationalRedshift: String.raw`1 + z = \frac{1}{\sqrt{1 - \frac{r_s}{r}}}, \quad \nu_{\text{obs}} = \nu_{\text{emit}} \sqrt{1 - \frac{r_s}{r}}`,
  shakuraSunyaev: String.raw`T(r) = \left[ \frac{3 G M \dot{M}}{8 \pi \sigma r^3} \left(1 - \sqrt{\frac{r_{\text{in}}}{r}}\right) \right]^{1/4} \propto r^{-3/4}`,
  lenseThirring: String.raw`\vec{a}_{\text{LT}} = \frac{2\,r_s\,a^*}{r^4}(\hat{y}\times\vec{r})\times\vec{v}_{\text{ray}}`,
  blandfordZnajek: String.raw`P_{\text{jet}} = \frac{1}{128}\,\Omega_H^2\,\Phi_B^2 \approx 10^{37}\;\text{W} \quad (\text{M87* Polar Jet})`,
  dopplerColorShift: String.raw`\nu_{\text{obs}} = \delta \cdot \nu_{\text{emit}} = \frac{\sqrt{1 - \frac{r_s}{r}}}{\gamma \left(1 - \frac{\vec{v} \cdot \hat{n}}{c}\right)} \, \nu_{\text{emit}} \quad (\text{Relativistic Optical Doppler})`,
  synchrotronBeaming: String.raw`I_\nu(\nu) = \delta^{3+\alpha} I_{0,\nu}\left(\frac{\nu}{\delta}\right) \quad (\text{EHT 1.3mm \& X-Ray Corona Beaming})`,
  ehtAngularDiameter: String.raw`\theta_{\text{EHT}} = \frac{2\, b_{\text{crit}}}{D} = \frac{3\sqrt{3}\, G M}{c^2 D} \approx \begin{cases} 51.8\;\mu\text{as} & \text{Sgr A*} \\ 42.0\;\mu\text{as} & \text{M87*} \end{cases}`,
};
