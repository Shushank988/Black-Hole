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
- **📡 EHT 20 μas Telescope Beam Blur Toggle**: Switch between **Near-Field Infinite Resolution (Ground Truth General Relativity)** and **Earth-based VLBI Instrumental Resolution (20 μas)** to witness how Earth's telescope array turns the razor-sharp photon ring into the famous blurry orange donut seen in NASA & EHT press releases!
- **Interactive HUD & GR Math Lab**: Live mathematical readout with 12 rendered LaTeX equations (via KaTeX), ISCO auto-lock, and orbital telemetry.
- **Zen View & Snapshot Tool**: Fullscreen cinematic mode and instant high-resolution image exporter.

---

## 🔭 Why Doesn't This Look Like the Blurry Orange Donut on Google?

When you search for **M87\*** or **Sagittarius A\*** on Google, the famous images released in 2019 and 2022 look like a **fuzzy orange donut**. Many people ask: *Is this simulation different from reality?*

**The Answer:** This simulation models the **physical ground truth** that astronomers are actually observing!

1. **Earth's Finite Telescope Resolution**: The Event Horizon Telescope (EHT) synthesized a virtual radio dish the diameter of Earth ($D \approx 10,000\text{ km}$) operating at $\lambda = 1.3\text{ mm}$. By the fundamental diffraction limit:
   $$\theta_{\text{beam}} \approx 1.22 \frac{\lambda}{D} \approx 20\text{ to }25\ \mu\text{as}$$
2. **The Ring is Tiny**: The black hole shadow is only $\sim 42\text{ to }52\ \mu\text{as}$ wide on Earth's sky. This means the entire ring is only **2 to 3 telescope resolution elements across**!
3. **Official Proof**: In the EHT Collaboration's peer-reviewed papers (*The Astrophysical Journal Letters*, 2019 & 2022), the scientists published the **unblurred numerical GRMHD simulations** side-by-side with the convolved telescope images. The unblurred simulations feature the **exact thin photon ring, Doppler-beamed crescents, and Einstein rings rendered in this project**.
4. **Try It in the Simulator**: Click the **`📡 EHT Blur (20μas)`** button in the header bar. It applies the exact 20 μas synthesized Gaussian beam convolution, transforming our sharp simulation into the authentic, blurry orange donut seen in real radio observations!

---

## 🎮 Interactive Controls

| Control | Action |
| :--- | :--- |
| **Left Click + Drag** | 360° Orbit camera around the black hole |
| **Scroll Wheel / Pinch** | Zoom in / Zoom out |
| **Right Click + Drag** | Pan camera |
| **📡 EHT Blur Button** | Toggle 20 μas Earth telescope resolution limit blur vs Ground Truth |
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
6. **Earth VLBI Beam Convolution**:
   $$I_{\text{observed}}(\alpha, \beta) = [I_{\text{GR}} * \mathcal{G}_{\text{beam}}](\alpha, \beta)$$

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
