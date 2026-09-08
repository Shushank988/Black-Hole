# 🌌 4D Spacetime Lab — Kerr Black Hole Simulation

An interactive, real-time General Relativity simulation of supermassive black holes (**Sagittarius A\*** and **M87\***) powered by WebGL2, Three.js, and GLSL geodesic raymarching.

![4D Spacetime Lab Preview](./public/og-image.png)

---

## 🚀 Live Demo & Features

- **Kerr Spacetime Geodesics**: Real-time numerical integration of photon trajectories in curved spacetime, featuring gravitational light bending, photon sphere orbit trapping, and asymmetric Kerr shadow silhouettes.
- **Lense-Thirring Frame Dragging**: Swirling of spacetime around rotating black holes ($a^* \le 0.998$).
- **Relativistic Doppler Beaming**: Approaching accretion disk matter beams up to 100× brighter ($I_\nu \propto \delta^{3+\alpha}$) and blue-shifts towards the observer.
- **Gravitational Redshift**: Photons climbing out of the gravitational potential well lose energy ($1+z$).
- **5 Multi-Spectral Observation Regimes**:
  1. 📡 **EHT 1.3 mm Radio (VLBI)**: Synchrotron emission revealing the photon ring and event horizon shadow.
  2. 🌈 **Relativistic Optical**: Real-time Doppler wavelength shifts from approaching cyan to receding deep crimson.
  3. 🔥 **Thermal Heatmap**: Shakura-Sunyaev thin-disk model ($T_{\text{eff}} \propto r^{-3/4}$) with frame-dragged isothermal contours.
  4. ⚡ **High-Energy X-Ray**: Chandra/NuSTAR band highlighting the inner ISCO corona and plasma flares.
  5. 🔭 **Infrared Torus (JWST)**: Dust-penetrating view exposing the extended accretion disk and feeding streams.
- **Relativistic Polar Jet**: Collimated plasma jet powered by the Blandford-Znajek mechanism on M87\*.
- **Interactive HUD & GR Math Lab**: Live mathematical readout with rendered LaTeX equations (via KaTeX), ISCO auto-lock, and orbital telemetry.
- **Zen View & Snapshot Tool**: Fullscreen cinematic mode and instant high-resolution image exporter.

---

## 🎮 Interactive Controls

| Control | Action |
| :--- | :--- |
| **Left Click + Drag** | 360° Orbit camera around the black hole |
| **Scroll Wheel / Pinch** | Zoom in / Zoom out |
| **Right Click + Drag** | Pan camera |
| **Space** | Pause / Resume 4D time evolution |
| **Z** | Toggle Zen View (hide/show HUD overlay) |
| **M** | Open Kerr Spacetime Math equations modal |
| **R** | Reset simulation to scientific defaults |
| **S** | Capture high-resolution viewport snapshot |

---

## 🔬 Scientific Foundations

The simulation numerically evaluates key equations from Kerr metric General Relativity:

1. **Outer Event Horizon ($r_+$)**:
   $$r_+ = M + \sqrt{M^2 - a^2}$$
2. **Ergosurface Radius ($r_E$)**:
   $$r_E(\theta) = M + \sqrt{M^2 - a^2 \cos^2\theta}$$
3. **Innermost Stable Circular Orbit (ISCO)**:
   $$r_{\text{isco}} = M \left( 3 + Z_2 \mp \sqrt{(3 - Z_1)(3 + Z_1 + 2 Z_2)} \right)$$
4. **Relativistic Doppler Factor**:
   $$\delta = \frac{1}{\gamma (1 - \beta \cos\theta)}$$
5. **Gravitational Redshift**:
   $$1 + z = \left( 1 - \frac{r_s}{r} \right)^{-1/2}$$

---

## 🛠️ Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/black-hole-simulation.git
cd black-hole-simulation

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open `http://localhost:5173` in your WebGL2-compatible browser (Chrome, Edge, Firefox, Safari).

### Production Build
```bash
npm run build
```
The optimized bundle will be compiled into the `dist/` directory.

---

## ☁️ Deployment (Cloudflare Pages / Vercel)

This project is a 100% client-side web application with zero backend requirements.

### Cloudflare Pages
1. Push your repository to **GitHub**.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select your repository and configure:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**.

---

## 📦 Tech Stack
- **Engine**: [Three.js](https://threejs.org/) (WebGL2)
- **Shaders**: Custom GLSL Raymarching (Kerr Metric & Radiative Transfer)
- **Math Engine**: [KaTeX](https://katex.org/)
- **UI & Controls**: [lil-gui](https://lil-gui.georgealways.com/) & Glassmorphic CSS3
- **Bundler**: [Vite](https://vitejs.dev/)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
