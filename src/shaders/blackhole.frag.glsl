precision highp float;

varying vec2 vUv;
varying vec3 vRayDir;

uniform vec3 uCamPos;
uniform vec2 uResolution;
uniform float uTime;

// Physics & Target Uniforms
uniform float uMass;
uniform float uRs;
uniform float uDiskInner;
uniform float uDiskOuter;
uniform float uDiskDensity;
uniform float uDiskBrightness;
uniform float uDiskSpeed;
uniform bool uEnableJet;
uniform bool uDopplerEnabled;
uniform bool uGravRedshiftEnabled;
uniform float uLensingStrength;
uniform float uSpin;
uniform float uTargetMode;
uniform int uColorPalette;
uniform int uMaxSteps;
uniform float uStepSize;

#define PI 3.14159265359
#define TWO_PI 6.28318530718

// --- Procedural Noise ---
float hash13(vec3 p3) {
    p3 = fract(p3 * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x),
            mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
        mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
            mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
        f.z);
}

float fbm(vec2 p) {
    float val = 0.0, amp = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
        val += noise3D(vec3(p, 0.0)) * amp;
        p = rot * p * 2.05 + vec2(0.13, 0.27);
        amp *= 0.48;
    }
    return val;
}

// --- Celestial Background ---
vec3 getCelestialBackground(vec3 dir) {
    vec3 n = normalize(dir);
    vec3 col = vec3(0.001, 0.0015, 0.004);

    if (uTargetMode < 0.5) {
        // Sgr A*: Dense Milky Way galactic center
        float band = exp(-pow((n.y - 0.03 * sin(n.x * 2.5)) * 3.2, 2.0));
        vec3 bulge = mix(vec3(0.008, 0.01, 0.02), vec3(0.10, 0.075, 0.035), band);
        bulge *= 0.35 + 0.65 * fbm(n.xz * 3.0 + vec2(1.5, 3.0));
        col += bulge;

        // Dense star field near galactic center
        vec3 g = n * 280.0;
        vec3 id = floor(g);
        float h = hash13(id);
        if (h > 0.92) {
            float d = length(g - id - 0.5);
            float si = smoothstep(0.42, 0.0, d) * pow((h - 0.92) / 0.08, 2.5);
            col += mix(vec3(0.7, 0.85, 1.0), vec3(1.0, 0.8, 0.5), hash13(id + 1.0)) * si * 3.0;
        }

        // S2 star (bright blue massive star in S-cluster)
        float s2a = dot(n, normalize(vec3(-0.55, 0.3, -0.72)));
        if (s2a > 0.999) col += vec3(0.4, 0.8, 1.0) * pow((s2a - 0.999) / 0.001, 3.0) * 7.0;
    } else if (uTargetMode < 1.5) {
        // M87*: Giant elliptical galaxy halo
        float halo = exp(-pow((1.0 - dot(n, vec3(0.0, 0.0, -1.0))) * 2.2, 1.4));
        col += vec3(0.07, 0.06, 0.04) * halo;

        // Sparse old-population stars
        vec3 g = n * 160.0;
        vec3 id = floor(g);
        float h = hash13(id);
        if (h > 0.955) {
            float d = length(g - id - 0.5);
            float si = smoothstep(0.38, 0.0, d) * pow((h - 0.955) / 0.045, 2.0);
            col += vec3(1.0, 0.92, 0.78) * si * 2.2;
        }
    } else if (uTargetMode < 2.5) {
        // Cygnus X-1: Cygnus OB3 association + massive Blue Supergiant companion HDE 226868
        float arm = exp(-pow((n.y - 0.12) * 3.8, 2.0));
        col += vec3(0.015, 0.02, 0.04) * arm;

        // HDE 226868 (O9.7 Iab Blue Supergiant companion star)
        vec3 starDir = normalize(vec3(0.65, 0.15, -0.74));
        float starDot = dot(n, starDir);
        if (starDot > 0.9975) {
            float core = pow((starDot - 0.9975) / 0.0025, 3.0);
            col += vec3(0.6, 0.85, 1.0) * core * 14.0;
        }
        float windHaze = exp(-pow((1.0 - max(0.0, starDot)) * 12.0, 1.2));
        col += vec3(0.12, 0.25, 0.5) * windHaze * 0.65;

        vec3 g = n * 240.0;
        vec3 id = floor(g);
        float h = hash13(id);
        if (h > 0.93) {
            float d = length(g - id - 0.5);
            col += mix(vec3(0.75, 0.9, 1.0), vec3(1.0, 0.75, 0.45), hash13(id + 2.0)) * smoothstep(0.4, 0.0, d) * 2.6;
        }
    } else if (uTargetMode < 3.5) {
        // TON 618: Distant high-redshift hyper-luminous quasar host galaxy & ionization nebula
        float quasarHalo = exp(-pow(length(n.xy) * 1.6, 1.5));
        col += vec3(0.09, 0.045, 0.14) * quasarHalo;
        col += vec3(0.16, 0.09, 0.04) * exp(-pow(length(n.yz) * 2.0, 1.8));

        vec3 g = n * 320.0;
        vec3 id = floor(g);
        float h = hash13(id);
        if (h > 0.965) {
            float d = length(g - id - 0.5);
            col += vec3(0.9, 0.95, 1.0) * smoothstep(0.4, 0.0, d) * 2.2;
        }
    } else {
        // Gargantua: Interstellar cosmic void with distant galactic clusters and faint nebulae
        float neb = fbm(n.xy * 2.2 + vec2(0.5, -0.8));
        col += vec3(0.02, 0.025, 0.045) * neb;
        col += vec3(0.035, 0.02, 0.01) * exp(-pow(n.y * 3.5, 2.0));

        vec3 g = n * 220.0;
        vec3 id = floor(g);
        float h = hash13(id);
        if (h > 0.94) {
            float d = length(g - id - 0.5);
            col += mix(vec3(0.85, 0.95, 1.0), vec3(1.0, 0.9, 0.7), hash13(id + 2.0)) * smoothstep(0.38, 0.0, d) * 2.4;
        }
    }

    // Faint secondary star layer (shared)
    vec3 g2 = n * 500.0;
    vec3 id2 = floor(g2);
    float h2 = hash13(id2);
    if (h2 > 0.97) {
        col += vec3(0.7, 0.8, 1.0) * pow((h2 - 0.97) / 0.03, 2.0) * 0.8;
    }

    return col;
}

// --- Multi-Spectral Observational Regimes ---
// 0: EHT 1.3mm Radio (Sub-mm Synchrotron & Photon Ring)
// 1: Relativistic Optical (Visible Doppler Wavelength Shift)
// 2: Thermal Heatmap (Shakura-Sunyaev T_eff with Isothermal Contours)
// 3: High-Energy X-Ray (Chandra/NuSTAR Inner ISCO & Corona)
// 4: Infrared Dust Penetration (JWST Extended Torus)

vec3 getSpectralColor(float temp, float shift, float r, float rNorm, float iscoGlow, out float spectralAlphaMod) {
    spectralAlphaMod = 1.0;
    float t = temp * shift;

    if (uColorPalette == 0) {
        // --- Mode 0: EHT 1.3mm Sub-mm Radio (VLBI Interferometry) ---
        // Millimeter synchrotron brightness temperature: sharp dark silhouette & bright gold ring
        vec3 c0 = vec3(0.18, 0.03, 0.0);
        vec3 c1 = vec3(0.92, 0.42, 0.08);
        vec3 c2 = vec3(1.0, 0.85, 0.45);
        vec3 c3 = vec3(1.0, 0.98, 0.92);
        vec3 col = mix(c0, c1, smoothstep(0.0, 0.35, t));
        col = mix(col, c2, smoothstep(0.35, 0.8, t));
        col = mix(col, c3, smoothstep(0.8, 1.4, t));
        return col;
    } else if (uColorPalette == 1) {
        // --- Mode 1: Relativistic Optical Spectrum (Visible Doppler Shift) ---
        // Direct physical wavelength shift: Approaching = blue/violet, Receding = deep red
        vec3 col;
        if (shift > 1.05) {
            // Blue-shifted approaching side (high frequency / UV-optical)
            float b = clamp((shift - 1.05) * 1.8, 0.0, 1.0);
            vec3 neutral = vec3(1.0, 0.90, 0.70);
            vec3 blueShifted = vec3(0.40, 0.75, 1.0);
            vec3 uvWhite = vec3(0.85, 0.95, 1.0);
            col = mix(neutral, blueShifted, b);
            col = mix(col, uvWhite, smoothstep(0.4, 1.0, b));
            col *= (1.0 + b * 0.8);
        } else {
            // Red-shifted receding side (low frequency / infrared-optical) + gravitational redshift
            float rShift = clamp((1.05 - shift) * 1.6, 0.0, 1.0);
            vec3 neutral = vec3(1.0, 0.80, 0.45);
            vec3 deepRed = vec3(0.65, 0.08, 0.02);
            vec3 infraDim = vec3(0.15, 0.01, 0.0);
            col = mix(neutral, deepRed, rShift);
            col = mix(col, infraDim, smoothstep(0.5, 1.0, rShift));
        }
        return col * smoothstep(0.0, 0.25, temp);
    } else if (uColorPalette == 2) {
        // --- Mode 2: Thermal Heatmap (Quantitative T_eff with Isothermal Contours) ---
        // Quantitative color scale: Red (10^4 K) -> Yellow (10^5 K) -> Cyan -> White (>10^7 K)
        vec3 col = vec3(0.0);
        col.r = smoothstep(0.0, 0.45, t);
        col.g = smoothstep(0.25, 0.75, t);
        col.b = smoothstep(0.65, 1.15, t);

        // Overlay sharp isothermal contours: deformed into teardrops by Kerr frame-dragging & Doppler shift
        float logT = log(max(0.005, t * 2.5));
        float isotherm = abs(fract(logT * 1.8) - 0.5) * 2.0;
        float line = smoothstep(0.82, 0.96, isotherm);
        col = mix(col, vec3(1.0, 1.0, 0.9), line * 0.75);
        return col;
    } else if (uColorPalette == 3) {
        // --- Mode 3: High-Energy X-Ray (Chandra / NuSTAR 0.5-10 keV) ---
        // Inverse Compton scattering off corona; cold outer gas emits 0 X-rays
        vec3 c0 = vec3(0.02, 0.0, 0.08);
        vec3 c1 = vec3(0.25, 0.10, 0.85);
        vec3 c2 = vec3(0.10, 0.80, 1.0);
        vec3 c3 = vec3(0.95, 0.98, 1.0);
        vec3 col = mix(c0, c1, smoothstep(0.0, 0.35, t));
        col = mix(col, c2, smoothstep(0.35, 0.75, t));
        col = mix(col, c3, smoothstep(0.75, 1.2, t));
        return col;
    } else if (uColorPalette == 4) {
        // --- Mode 4: Infrared Dust Penetration (JWST NIRCam / VLT GRAVITY) ---
        // Pierces dust clouds; warm dust emission across wide accretion torus
        vec3 c0 = vec3(0.12, 0.01, 0.08);
        vec3 c1 = vec3(0.70, 0.08, 0.38);
        vec3 c2 = vec3(1.0, 0.45, 0.30);
        vec3 c3 = vec3(1.0, 0.92, 0.75);
        vec3 col = mix(c0, c1, smoothstep(0.0, 0.35, t));
        col = mix(col, c2, smoothstep(0.35, 0.7, t));
        col = mix(col, c3, smoothstep(0.7, 1.25, t));
        return col;
    } else if (uColorPalette == 5) {
        // --- Mode 5: ngEHT 0.87mm (345 GHz High-Frequency Sub-mm) ---
        // Deep electric sapphire transitioning to sharp golden amber synchrotron photon ring
        vec3 c0 = vec3(0.01, 0.04, 0.16);
        vec3 c1 = vec3(0.12, 0.45, 0.88);
        vec3 c2 = vec3(1.0, 0.70, 0.18);
        vec3 c3 = vec3(1.0, 0.98, 0.92);
        vec3 col = mix(c0, c1, smoothstep(0.0, 0.30, t));
        col = mix(col, c2, smoothstep(0.30, 0.65, t));
        col = mix(col, c3, smoothstep(0.65, 1.15, t));
        col += vec3(1.0, 0.85, 0.4) * iscoGlow * 1.6;
        return col;
    } else if (uColorPalette == 6) {
        // --- Mode 6: Space VLBI (Lunar Baseline Sub-Microarcsecond Synthesis) ---
        // Extreme dynamic range: platinum white interference fringes against deep obsidian
        float fringe = 0.88 + 0.12 * sin(r * 42.0 + shift * 5.0);
        vec3 c0 = vec3(0.01, 0.012, 0.025);
        vec3 c1 = vec3(0.35, 0.45, 0.65);
        vec3 c2 = vec3(0.95, 0.90, 0.82);
        vec3 c3 = vec3(1.0, 1.0, 1.0);
        vec3 col = mix(c0, c1, smoothstep(0.0, 0.28, t));
        col = mix(col, c2, smoothstep(0.28, 0.60, t));
        col = mix(col, c3, smoothstep(0.60, 1.05, t));
        return col * fringe;
    } else {
        // --- Mode 7: IXPE Magnetic Field Polarimetry ---
        // Fluorescent EVPA streamlines tracing toroidal and poloidal B-field loops
        float bFieldLoops = abs(sin(r * 18.0 + shift * 8.0));
        float evpaStriae = smoothstep(0.25, 0.85, bFieldLoops);

        vec3 bNeonCyan = vec3(0.0, 0.95, 1.0);
        vec3 bNeonMagenta = vec3(1.0, 0.05, 0.75);
        vec3 bGoldCore = vec3(1.0, 0.95, 0.85);

        vec3 col = mix(bNeonCyan, bNeonMagenta, smoothstep(0.1, 0.65, t));
        col = mix(col, bGoldCore, smoothstep(0.65, 1.2, t));
        col *= (0.45 + 0.55 * evpaStriae);
        return col;
    }
}

// --- Exact General Relativity Geodesic Acceleration (Schwarzschild + Kerr Gravitomagnetism) ---
vec3 getGeodesicAcceleration(vec3 pos, vec3 vel, float rs, float aSpin, float lensingStrength) {
    float r = length(pos);
    float r2 = r * r;
    float r5 = r2 * r2 * r;
    if (r5 < 1e-4) return vec3(0.0);

    // Light ray velocity is a unit vector (|vHat| = 1)
    vec3 vHat = normalize(vel);

    // Component of pos perpendicular to ray velocity
    vec3 rPerp = pos - dot(pos, vHat) * vHat;
    float b2 = dot(rPerp, rPerp); // impact parameter squared

    // Exact Schwarzschild null geodesic spatial curvature:
    // a_Schw = -1.5 * rs * (b^2 / r^5) * rPerp
    // Strictly perpendicular to velocity, so dot(aSchw, vHat) == 0 (speed of light is preserved)
    vec3 aSchw = -1.5 * rs * (b2 / r5) * rPerp;

    // Exact Kerr gravitomagnetic spin-orbit coupling (Lense-Thirring effect)
    // Black hole spin axis is aligned with Y (poloidal axis): s = (0, 1, 0)
    // Dipole gravitomagnetic field: B_g = (a* / r^5) * [3 (s · r) r - r^2 s]
    // Lorentz-like gravitomagnetic acceleration: a_spin = 2 * (vHat x B_g)
    // Strictly perpendicular to velocity, so dot(a_spin, vHat) == 0
    vec3 spinAxis = vec3(0.0, 1.0, 0.0);
    float sDotR = dot(spinAxis, pos);
    vec3 Bg = (aSpin / r5) * (3.0 * sDotR * pos - r2 * spinAxis);
    vec3 aSpinForce = 2.0 * cross(vHat, Bg);

    return (aSchw + aSpinForce) * lensingStrength;
}

// --- Sample Accretion Disk at Equatorial Plane Crossing ---
vec4 sampleDisk(vec3 pos, vec3 dir, float rs) {
    float r = length(pos);

    // Multi-spectral radial boundaries
    float effectiveOuter = uDiskOuter;
    if (uColorPalette == 0 || uColorPalette == 5) {
        // EHT & ngEHT Radio: Synchrotron drops fast outside inner relativistic flow
        effectiveOuter = min(uDiskOuter, uDiskInner * 2.8);
    } else if (uColorPalette == 6) {
        // Space VLBI: sharp photon ring focus
        effectiveOuter = min(uDiskOuter, uDiskInner * 2.4);
    } else if (uColorPalette == 3) {
        // X-Ray: Thermal Bremsstrahlung & Compton requires T > 10^6 K; outer disk emits 0 X-rays
        effectiveOuter = min(uDiskOuter, uDiskInner * 1.95);
    } else if (uColorPalette == 4) {
        // Infrared: Pierces dust, revealing massive extended outer torus
        effectiveOuter = max(uDiskOuter, 21.0);
    }

    if (r < uDiskInner || r > effectiveOuter) return vec4(0.0);

    float rNorm = r / uDiskInner;

    // Shakura-Sunyaev temperature profile: T ~ r^(-3/4) * (1 - sqrt(r_in/r))^(1/4)
    float tempBase = pow(rNorm, -0.75) * pow(max(0.001, 1.0 - sqrt(1.0 / rNorm)), 0.25) * 3.2;

    // Kerr circular geodesic orbital velocity: Omega = 1 / (r^(3/2) + a)
    float rM = r / (0.5 * rs);
    float aSpin = clamp(uSpin, 0.0, 0.998);
    // Exact Keplerian circular angular velocity: Omega_K = 1 / (rM^(3/2) + a*)
    // Relativistic orbital speed in c units: v_K = rM * Omega_K = rM / (rM^(3/2) + a*)
    float vK = clamp(rM / (pow(rM, 1.5) + aSpin), 0.0, 0.995);
    vec3 vDir = normalize(vec3(-pos.z, 0.0, pos.x));
    vec3 vel = vDir * vK;

    // Relativistic Doppler beaming: delta = 1 / (gamma * (1 - v·n))
    float v2 = dot(vel, vel);
    float gamma = 1.0 / sqrt(max(0.001, 1.0 - v2));
    float cosA = dot(normalize(-dir), vDir);
    float doppler = uDopplerEnabled ? 1.0 / (gamma * max(0.001, 1.0 - vK * cosA)) : 1.0;

    // Spectral beaming exponent: I_nu ~ delta^(3 + alpha)
    float beamingPower = 3.0;
    if (uColorPalette == 0 || uColorPalette == 5) {
        beamingPower = 3.6; // Radio synchrotron spectral index alpha ~ 0.6
    } else if (uColorPalette == 6) {
        beamingPower = 3.8; // Space VLBI high dynamic range
    } else if (uColorPalette == 3) {
        beamingPower = 4.5; // X-ray hard corona extreme relativistic boosting
    } else if (uColorPalette == 7) {
        beamingPower = 2.8; // IXPE polarization
    } else if (uColorPalette == 4) {
        beamingPower = 2.0; // Infrared dust scattering moderates beaming
    } else if (uColorPalette == 2) {
        beamingPower = 2.2; // Thermal heatmap keeps isothermal lines visible across both sides
    }
    float beaming = pow(doppler, beamingPower);

    // Exact Kerr gravitational time dilation for circular equatorial disk:
    // u^t = 1 / sqrt(1 - 3/rM + 2*a*/rM^(3/2)) => g_grav = sqrt(1 - 3/rM + 2*a*/rM^(3/2))
    float gRedshift = uGravRedshiftEnabled ? sqrt(max(0.001, 1.0 - 3.0 / rM + 2.0 * aSpin / pow(rM, 1.5))) : 1.0;
    float netShift = doppler * gRedshift;

    // Multi-scale turbulent gas structure
    float angle = atan(pos.z, pos.x);
    vec2 uv1 = vec2(r * 0.8 - uTime * uDiskSpeed * 0.18, angle * 3.2);
    float turb = fbm(uv1 * 2.0);
    float dust = smoothstep(0.22, 0.7, fbm(uv1 * 3.8 + vec2(2.1, 0.9)));

    // Concentric ring striations
    float rings = 0.6 + 0.28 * sin(r * 20.0 - uTime * uDiskSpeed * 0.6)
                      + 0.12 * sin(r * 45.0 + uTime * uDiskSpeed * 1.1);

    // Radial density falloff
    float falloff = smoothstep(effectiveOuter, effectiveOuter - 2.5, r)
                  * smoothstep(uDiskInner, uDiskInner + 0.35, r);

    // ISCO edge glow (matter piling up at innermost orbit)
    float iscoGlow = exp(-pow((r - uDiskInner) * 2.8, 2.0)) * 2.0;
    if (uColorPalette == 0) {
        // EHT Radio: Sharp photon ring peak
        iscoGlow *= 1.8;
    } else if (uColorPalette == 3) {
        // X-Ray: Blazing ISCO corona hot spot
        iscoGlow *= 2.5;
    } else if (uColorPalette == 4) {
        // Infrared: Inner glare dimmed, outer dust enhanced
        iscoGlow *= 0.5;
    }

    float gasStructure = turb * 0.5 + rings * 0.3 + (1.0 - dust) * 0.2;
    if (uColorPalette == 4) {
        // Infrared highlights dense clumpiness and outer spiral arms
        gasStructure = turb * 0.7 + dust * 0.4 + rings * 0.2;
    }

    float density = gasStructure * falloff * uDiskDensity + iscoGlow;

    float alphaMod = 1.0;
    vec3 color = getSpectralColor(tempBase, netShift, r, rNorm, iscoGlow, alphaMod);

    // Radiative brightness modulation
    float brightMult = uDiskBrightness;
    if (uColorPalette == 3) {
        brightMult *= 1.4; // High-energy X-ray contrast
    } else if (uColorPalette == 4) {
        brightMult *= 0.85; // Soft infrared dust glow
    }

    vec3 emission = color * tempBase * brightMult * beaming * (1.0 + iscoGlow * 0.4);

    float alpha = clamp(density * 0.7 * alphaMod, 0.0, 0.92);
    return vec4(emission * alpha, alpha);
}

// --- Relativistic Polar Jet (M87*) ---
vec4 sampleJet(vec3 pos, float rs) {
    if (uColorPalette == 2) {
        // Thermal disk mode suppresses non-thermal synchrotron jet
        return vec4(0.0);
    }

    float absY = abs(pos.y);
    if (absY < rs * 1.2 || absY > 28.0) return vec4(0.0);

    float rho = length(pos.xz);
    // Collimated jet opening angle widens with distance
    float jetR = 0.10 * pow(absY, 0.82);
    if (rho > jetR) return vec4(0.0);

    float normRho = rho / jetR;
    float radial = exp(-pow(normRho * 2.5, 2.0));

    // Pulsed plasma blobs moving along the jet (Blandford-Znajek process)
    float pulse = 0.55 + 0.45 * sin(absY * 2.5 - uTime * 5.5 * uDiskSpeed);
    float fade = exp(-absY * 0.07);

    float jetD = radial * pulse * fade * 0.8;

    vec3 jetCol;
    if (uColorPalette == 0) {
        // EHT 1.3mm Radio: Synchrotron radio jet (amber-gold core)
        vec3 core = vec3(1.0, 0.85, 0.55);
        vec3 sheath = vec3(0.85, 0.35, 0.05);
        jetCol = mix(sheath, core, radial) * 3.2;
    } else if (uColorPalette == 3) {
        // X-Ray (Chandra): Blazing hard X-ray jet core (M87* jet is bright in X-rays!)
        vec3 core = vec3(0.9, 0.95, 1.0);
        vec3 sheath = vec3(0.3, 0.1, 0.9);
        jetCol = mix(sheath, core, radial) * 4.2;
    } else if (uColorPalette == 4) {
        // Infrared: Faint warm dust/plasma sheath
        vec3 core = vec3(1.0, 0.6, 0.4);
        vec3 sheath = vec3(0.5, 0.1, 0.3);
        jetCol = mix(sheath, core, radial) * 1.5;
    } else if (uColorPalette == 5) {
        // ngEHT 0.87mm: High frequency synchrotron jet (electric blue core + golden sheath)
        vec3 core = vec3(0.3, 0.7, 1.0);
        vec3 sheath = vec3(1.0, 0.65, 0.15);
        jetCol = mix(sheath, core, radial) * 3.6;
    } else if (uColorPalette == 6) {
        // Space VLBI: High-coherence platinum core
        vec3 core = vec3(1.0, 1.0, 1.0);
        vec3 sheath = vec3(0.4, 0.5, 0.75);
        jetCol = mix(sheath, core, radial) * 3.4;
    } else if (uColorPalette == 7) {
        // IXPE: Magnetic polarization dual-helicity jet
        vec3 core = vec3(0.0, 0.95, 1.0);
        vec3 sheath = vec3(1.0, 0.05, 0.75);
        jetCol = mix(sheath, core, radial) * 3.8;
    } else {
        // Optical: Synchrotron blue-violet core
        vec3 core = mix(vec3(0.5, 0.85, 1.0), vec3(0.92, 0.96, 1.0), radial);
        vec3 sheath = vec3(0.65, 0.18, 0.85);
        jetCol = mix(sheath, core, radial) * 3.0;
    }

    return vec4(jetCol * jetD, clamp(jetD * 0.35, 0.0, 0.8));
}

// --- ACES Filmic Tone Mapping ---
vec3 toneMapACES(vec3 x) {
    return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}

void main() {
    vec3 rayPos = uCamPos;
    vec3 rayDir = normalize(vRayDir);

    vec3 diskAccum = vec3(0.0);
    float diskAlpha = 0.0;

    float rs = uRs;
    float aSpin = clamp(uSpin, 0.0, 0.998);
    // Kerr outer event horizon radius r_+ = M + sqrt(M^2 - a^2) where M = 0.5 * rs
    float rPlus = 0.5 * rs * (1.0 + sqrt(max(0.001, 1.0 - aSpin * aSpin)));
    float rPh = 1.5 * rs;
    float bCrit = 2.598076 * rs;

    int maxSteps = uMaxSteps;
    float dtBase = uStepSize;

    bool hitHorizon = false;
    float minR = 1e6;
    vec3 prevPos = rayPos;

    const float R_BOUND = 35.0;
    float camDist = length(rayPos);

    // Fast Leap: If camera is outside the active region, leap straight to the bounding sphere
    if (camDist > R_BOUND) {
        float b = dot(rayPos, rayDir);
        float c = camDist * camDist - R_BOUND * R_BOUND;
        float d = b * b - c;

        // If the ray points away from the black hole or misses the bounding sphere entirely
        if (d < 0.0 || b >= 0.0) {
            vec3 sky = getCelestialBackground(rayDir);
            vec3 finalColor = toneMapACES(sky);
            vec2 uv = vUv * 2.0 - 1.0;
            finalColor *= 1.0 - dot(uv, uv) * 0.10;
            gl_FragColor = vec4(finalColor, 1.0);
            return;
        }

        // Ray intersects the bounding volume: leap to entry point without wasting steps
        float tEntry = -b - sqrt(d);
        if (tEntry > 0.0) {
            rayPos += rayDir * max(0.0, tEntry - 0.02);
            prevPos = rayPos;
        }
    }

    // --- Geodesic Ray Marching ---
    vec3 rayVel = rayDir;
    vec3 accel = getGeodesicAcceleration(rayPos, rayVel, rs, aSpin, uLensingStrength);

    for (int step = 0; step < 260; step++) {
        if (step >= maxSteps) break;

        float r = length(rayPos);
        minR = min(minR, r);

        // Strict General Relativity Outer Event Horizon: r <= r_+ = M + sqrt(M^2 - a^2)
        if (r <= rPlus * 1.002) {
            hitHorizon = true;
            break;
        }

        // Sample jet
        if (uEnableJet) {
            vec4 js = sampleJet(rayPos, rs);
            if (js.a > 0.001) {
                diskAccum += js.rgb * (1.0 - diskAlpha);
                diskAlpha += js.a * (1.0 - diskAlpha);
            }
        }

        // Adaptive step size based on local spacetime curvature
        // Fine sub-steps near the photon sphere and horizon, larger steps in asymptotic flat spacetime
        float dt = dtBase * max(0.28, (r - rPlus * 0.85) * 0.35);

        // Direction-preserving Velocity Verlet Integration
        vec3 vHalf = normalize(rayVel + 0.5 * accel * dt);
        vec3 nextPos = rayPos + vHalf * dt;

        // Check if nextPos has crossed the event horizon
        float nextR = length(nextPos);
        if (nextR <= rPlus * 1.005) {
            hitHorizon = true;
            break;
        }

        // Disk plane crossing detection (y = 0) between rayPos and nextPos
        if (rayPos.y * nextPos.y <= 0.0 && abs(rayPos.y - nextPos.y) > 1e-5) {
            float tP = rayPos.y / (rayPos.y - nextPos.y);
            vec3 hitP = mix(rayPos, nextPos, tP);
            float rHit = length(hitP);

            // Only sample disk if the crossing is outside the event horizon
            if (rHit > rPlus * 1.01) {
                vec4 ds = sampleDisk(hitP, vHalf, rs);
                if (ds.a > 0.001) {
                    diskAccum += ds.rgb * (1.0 - diskAlpha);
                    diskAlpha += ds.a * (1.0 - diskAlpha);
                    if (diskAlpha >= 0.95) break;
                }
            }
        }

        // Thin volumetric disk haze near equatorial plane
        float diskH = 0.035 * r;
        if (abs(rayPos.y) < diskH && r >= uDiskInner && r <= uDiskOuter) {
            vec4 dv = sampleDisk(rayPos, vHalf, rs);
            float sa = clamp(dv.a * 0.12, 0.0, 0.4);
            diskAccum += dv.rgb * sa * (1.0 - diskAlpha);
            diskAlpha += sa * (1.0 - diskAlpha);
        }

        // Compute acceleration at next position
        vec3 nextAccel = getGeodesicAcceleration(nextPos, vHalf, rs, aSpin, uLensingStrength);

        // Complete Velocity Verlet step
        rayVel = normalize(vHalf + 0.5 * nextAccel * dt);
        prevPos = rayPos;
        rayPos = nextPos;
        accel = nextAccel;

        // Terminate only if ray has exited the active region and is moving outward
        if (r > R_BOUND && dot(rayPos, rayVel) > 0.0) break;
    }

    // Compositing
    vec3 finalColor;
    if (hitHorizon) {
        finalColor = diskAccum;
    } else {
        vec3 sky = getCelestialBackground(normalize(rayVel));
        finalColor = diskAccum + sky * (1.0 - diskAlpha);
    }

    // ACES tone mapping
    finalColor = toneMapACES(finalColor * 1.0);

    // Subtle cinematic vignette
    vec2 uv = vUv * 2.0 - 1.0;
    finalColor *= 1.0 - dot(uv, uv) * 0.10;

    gl_FragColor = vec4(finalColor, 1.0);
}
