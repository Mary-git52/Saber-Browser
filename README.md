# ⚔️ Saber Browser
Saber Browser is a lightweight, minimalist web browser built with Electron. Designed for speed and distraction-free surfing, it strips away the unnecessary clutter of traditional browsers to provide a clean, focused, and high-performance experience.

# 🚀 Features
Minimalist UI: No redundant menus or toolbars—just pure content.

Optimized Performance: Built on Electron to ensure speed and stability.

Cross-Platform: Native support for Linux (perfect for Hyprland/Arch) and Windows.

Portable: No complex installation required; just run the executable and start browsing.

# 🛠️ Installation
For Linux (Arch/Hyprland):
- Clone the repository
git clone https://github.com/YOUR_USERNAME/saber-bw.git
cd saber-bw

- Install dependencies and build
npm install
npm run dist


# For Windows:

Grab the .exe file from the dist/ folder. It is a portable build, so you can place it anywhere and launch it instantly.

# 📦 Usage
Hyprland Users: Integrate it into your workflow by adding this line to your hyprland.lua to launch it via SUPER + B:
hl.bind(mainMod .. " + B", hl.dsp.exec_cmd("cd /path/to/saber-bw && npm start"))
