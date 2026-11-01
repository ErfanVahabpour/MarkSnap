/**
 * MarkSnap Main Application Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const editor = document.getElementById('markdown-editor');
  const previewCard = document.getElementById('export-card');
  const markdownContainer = document.getElementById('markdown-container');
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const themeSelect = document.getElementById('theme-select');
  const fontSelect = document.getElementById('font-select');
  const dirSelect = document.getElementById('direction-select');
  const widthSlider = document.getElementById('width-slider');
  const widthValue = document.getElementById('width-value');
  const paddingSlider = document.getElementById('padding-slider');
  const paddingValue = document.getElementById('padding-value');
  const watermarkToggle = document.getElementById('watermark-toggle');
  const watermarkText = document.getElementById('watermark-text');
  const watermarkElement = document.getElementById('watermark-element');
  const watermarkAuthor = document.getElementById('watermark-author');
  const exportScaleSelect = document.getElementById('export-scale');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');

  // Buttons
  const btnExportPng = document.getElementById('btn-export-png');
  const btnExportJpg = document.getElementById('btn-export-jpg');
  const btnExportPdf = document.getElementById('btn-export-pdf');
  const btnExportSvg = document.getElementById('btn-export-svg');
  const btnCopyClipboard = document.getElementById('btn-copy-clipboard');

  // Sample buttons
  const btnSamplePersian = document.getElementById('btn-sample-persian');
  const btnSampleArch = document.getElementById('btn-sample-arch');
  const btnSampleMath = document.getElementById('btn-sample-math');

  let currentFilename = 'marksnap-doc';
  let renderDebounceTimer = null;

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Toast notification helper
  function showToast(msg, isSuccess = true) {
    toastMessage.textContent = msg;
    toast.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${
      isSuccess ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
    }`;
    setTimeout(() => {
      toast.className += ' translate-y-10 opacity-0 pointer-events-none';
    }, 3200);
  }

  // Update Direction
  function applyDirection(text) {
    const mode = dirSelect.value;
    let computedDir = 'ltr';

    if (mode === 'auto') {
      computedDir = window.markSnapRenderer.detectDirection(text);
    } else {
      computedDir = mode;
    }

    previewCard.setAttribute('dir', computedDir);
    document.documentElement.setAttribute('dir', computedDir);

    // Auto switch font to Persian font if RTL is detected
    if (computedDir === 'rtl' && fontSelect.value === 'font-inter') {
      fontSelect.value = 'font-vazir';
      applyFont();
    }
  }

  // Apply Theme
  function applyTheme() {
    const theme = themeSelect.value;
    const body = document.getElementById('render-canvas-container');
    
    // Clear old theme classes
    body.className = body.className.replace(/theme-[a-z\-]+/g, '').trim();
    previewCard.className = previewCard.className.replace(/theme-[a-z\-]+/g, '').trim();

    body.classList.add(theme);
    previewCard.classList.add(theme);

    // Update mermaid theme
    if (window.mermaid) {
      const isDark = !['theme-github-light', 'theme-notion', 'theme-academic'].includes(theme);
      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: 'Vazirmatn, Inter, sans-serif'
      });
    }
  }

  // Apply Font
  function applyFont() {
    const font = fontSelect.value;
    previewCard.className = previewCard.className.replace(/font-[a-z\-]+/g, '').trim();
    previewCard.classList.add(font);
  }

  // Render Document
  async function renderDocument() {
    const text = editor.value;
    applyDirection(text);
    
    // Extract first H1 as document title
    const titleMatch = text.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      currentFilename = titleMatch[1].trim();
    }

    await window.markSnapRenderer.render(text, markdownContainer);
  }

  function debouncedRender() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(renderDocument, 250);
  }

  // Event Listeners for Controls
  editor.addEventListener('input', debouncedRender);

  themeSelect.addEventListener('change', () => {
    applyTheme();
    renderDocument();
  });

  fontSelect.addEventListener('change', applyFont);

  dirSelect.addEventListener('change', () => {
    applyDirection(editor.value);
  });

  widthSlider.addEventListener('input', (e) => {
    const w = e.target.value;
    widthValue.textContent = `${w}px`;
    previewCard.style.maxWidth = `${w}px`;
    previewCard.style.width = '100%';
  });

  paddingSlider.addEventListener('input', (e) => {
    const p = e.target.value;
    paddingValue.textContent = `${p}px`;
    previewCard.style.padding = `${p}px`;
  });

  watermarkToggle.addEventListener('change', (e) => {
    watermarkElement.style.display = e.target.checked ? 'flex' : 'none';
  });

  watermarkText.addEventListener('input', (e) => {
    watermarkAuthor.textContent = e.target.value || 'MarkSnap Visual';
  });

  // File Upload Handlers
  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.value = e.target.result;
      currentFilename = file.name.replace(/\.[^/.]+$/, "");
      renderDocument();
      showToast(`Loaded ${file.name}`);
    };
    reader.readAsText(file, 'UTF-8');
  }

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag and Drop
  dropZone.addEventListener('click', () => fileInput.click());

  ['dragenter', 'dragover'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.add('border-indigo-500', 'bg-indigo-50/10');
    });
  });

  ['dragleave', 'drop'].forEach(name => {
    dropZone.addEventListener(name, (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-indigo-500', 'bg-indigo-50/10');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt.files.length) {
      handleFile(dt.files[0]);
    }
  });

  // Sample Buttons
  btnSamplePersian.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.persian;
    dirSelect.value = 'rtl';
    fontSelect.value = 'font-vazir';
    themeSelect.value = 'theme-persian-classic';
    applyTheme();
    applyFont();
    renderDocument();
    showToast('Loaded Persian Sample with Vazirmatn');
  });

  btnSampleArch.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.architecture;
    dirSelect.value = 'ltr';
    fontSelect.value = 'font-inter';
    themeSelect.value = 'theme-github-dark';
    applyTheme();
    applyFont();
    renderDocument();
    showToast('Loaded Architecture Spec Sample');
  });

  btnSampleMath.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.scientific;
    dirSelect.value = 'ltr';
    fontSelect.value = 'font-inter';
    themeSelect.value = 'theme-notion';
    applyTheme();
    applyFont();
    renderDocument();
    showToast('Loaded KaTeX Math Sample');
  });

  // Export Handlers
  async function runExport(action, successMessage) {
    const scale = parseInt(exportScaleSelect.value, 10) || 2;
    showToast('Preparing high-res export...');
    try {
      await action(scale);
      showToast(successMessage);
    } catch (err) {
      showToast('Export failed. Check console for details.', false);
    }
  }

  btnExportPng.addEventListener('click', () => {
    runExport((scale) => window.markSnapExporter.toPng(previewCard, currentFilename, scale), 'Exported PNG successfully!');
  });

  btnExportJpg.addEventListener('click', () => {
    runExport((scale) => window.markSnapExporter.toJpg(previewCard, currentFilename, 0.95, scale), 'Exported JPG successfully!');
  });

  btnExportPdf.addEventListener('click', () => {
    runExport(() => window.markSnapExporter.toPdf(previewCard, currentFilename, 'continuous'), 'Exported PDF successfully!');
  });

  btnExportSvg.addEventListener('click', () => {
    runExport(() => window.markSnapExporter.toSvg(previewCard, currentFilename), 'Exported SVG successfully!');
  });

  btnCopyClipboard.addEventListener('click', async () => {
    showToast('Rendering image to clipboard...');
    try {
      await window.markSnapExporter.copyToClipboard(previewCard);
      showToast('Copied high-res image to clipboard!');
    } catch (e) {
      showToast('Failed to copy to clipboard.', false);
    }
  });

  // Initial Boot
  editor.value = window.MarkSnapSamples.persian;
  applyTheme();
  applyFont();
  renderDocument();
});
