# MarkSnap — Visual Markdown to Image & PDF Studio 📸✨

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-success.svg)](#-live-demo--github-pages)
[![Docker Support](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](#-docker-quickstart)
[![RTL Support](https://img.shields.io/badge/RTL-Persian%20%2F%20Arabic%20Supported-purple.svg)](#-persian--rtl-first-class-support)

**Convert your Markdown files into high-resolution visual documents, images (PNG/JPG), PDFs, and SVGs with live preview, multi-theme aesthetics, and first-class Persian RTL typography.**

[English Documentation](#-features) • [راهنمای فارسی](#-راهنمای-فارسی) • [Live Demo](#-live-demo--github-pages)

</div>

---

## 🌟 Features

- 📤 **Drag & Drop / Upload:** Load `.md` and `.markdown` files instantly or type/paste live in the dual-pane editor.
- 🖼️ **Multi-Format Export Suite:**
  - **PNG:** Ultra-sharp 1x, 2x (Retina), and 3x print-grade resolution.
  - **JPG:** Compressed high-quality images with custom background rendering.
  - **PDF:** Continuous roll format or paged A4 documents ready for distribution.
  - **SVG:** Scalable vector format.
  - **Direct Clipboard Copy:** Copy crisp PNG images straight to your clipboard to paste in Telegram, Slack, Notion, or Twitter/X.
- 🇮🇷 **First-Class Persian & RTL Support:**
  - Auto-detection of Persian / Arabic text direction.
  - Native Persian web typography featuring **Vazirmatn (وزیرمتن)**, **Sahel (ساحل)**, and **Samim (صمیم)**.
  - Mirrored table alignments, blockquote accents, callout borders, and list numbering.
- 🎨 **Multi-Theme Presets:**
  - **Persian Classic:** Elegant slate & Persian cyan styling.
  - **GitHub Dark:** Developer-favorite dark mode.
  - **GitHub Light:** Clean and crisp documentation look.
  - **Notion Clean:** Warm minimalist paper style.
  - **Dracula:** High-contrast purple aesthetic.
  - **Cyberpunk Neon:** Vibrant futuristic neon palette.
  - **Academic Paper:** Formal serif research style.
- ⚡ **Rich Markdown Capabilities:**
  - GFM Tables & Checkboxes.
  - Syntax Highlighting for 50+ languages with Highlight.js.
  - **Mermaid.js Diagrams:** Flowcharts, sequence diagrams, state machines, ERDs.
  - **KaTeX LaTeX Equations:** Inline `$E = mc^2$` and display `$$\sum_{i=1}^n i$$`.
  - GitHub-style Alert Callouts (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
- 🎛️ **Full Canvas Customization:**
  - Custom width (700px – 1400px) and padding sliders.
  - Customizable watermark & author branding badge.
- 🔒 **100% Client-Side & Private:** No file is ever sent to any remote server. Everything is processed directly in your browser.

---

## 🚀 Live Demo & GitHub Pages

MarkSnap is designed to run seamlessly on GitHub Pages without requiring any build step:

**Live URL:** [https://erfanvahabpour.github.io/MarkSnap/](https://erfanvahabpour.github.io/MarkSnap/)

Every push to the `main` branch automatically deploys to GitHub Pages via the included GitHub Actions workflow (`.github/workflows/deploy.yml`).

---

## 🐳 Docker Quickstart

To run MarkSnap locally using Docker:

```bash
# Clone the repository
git clone https://github.com/ErfanVahabpour/MarkSnap.git
cd MarkSnap

# Start the container
docker compose up -d
```

Open your browser at **[http://localhost:8080](http://localhost:8080)**.

---

## 💻 Local Run Without Docker

Since MarkSnap is a pure client-side web application, you can simply open `index.html` in any modern web browser or serve it with Python / Node:

```bash
# Using Python
python -m http.server 3000

# Using Node npx
npx serve .
```

---

## 🇮🇷 راهنمای فارسی

**MarkSnap** یک ابزار تحت وب مدرن و سریع برای تبدیل فایل‌های مارک‌داون (`.md`) به تصاویر باکیفیت و اسناد بصری است. این پروژه به طور ویژه با پشتیبانی کامل از زبان فارسی و چینش راست‌به‌چپ (RTL) طراحی شده است.

### امکانات کلیدی برای کاربران فارسی‌زبان:
۱. **فونت‌های استاندارد فارسی:** استفاده پیش‌فرض از فونت‌های محبوب **وزیرمتن**، **ساحل** و **صمیم**.
۲. **تشخیص خودکار راست‌به‌چپ:** نیازی به تنظیم دستی جهت متن نیست؛ به محض تایپ متن فارسی، کل سند به صورت استاندارد راست‌به‌چپ تنظیم می‌شود.
۳. **خروجی‌های متنوع:** دریافت تصویر PNG با وضوح بسیار بالا (2x Retina و 3x)، خروجی JPG، سند PDF یکپارچه و کپی مستقیم در کلیپ‌بورد.
۴. **پشتیبانی از کدهای برنامه‌نویسی و فرمول‌های ریاضی:** حتی در متون فارسی، قطعه‌کدهای برنامه‌نویسی چپ‌به‌راست و به همراه رنگ‌آمیزی استاندارد نمایش داده می‌شوند.
۵. **حفظ کامل حریم خصوصی:** تمام فرآیند تبدیل به صورت ۱۰۰٪ در مرورگر کاربر انجام می‌شود و هیچ اطلاعاتی به سرور ارسال نمی‌گردد.

---

## 🛠️ Tech Stack

- **UI & Styling:** Tailwind CSS, CSS Custom Properties (Theme Engine)
- **Typography:** Google Fonts (Vazirmatn, Inter, JetBrains Mono, Sahel, Samim)
- **Icons:** Lucide Icons
- **Markdown Engine:** Marked.js + Highlight.js
- **Diagrams & Math:** Mermaid.js + KaTeX
- **Image & PDF Export:** `html-to-image`, `jsPDF`
- **Containerization:** Docker & Nginx Alpine

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) © 2026 Erfan Vahabpour.
