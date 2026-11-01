/**
 * MarkSnap Main Application Controller
 * Includes LocalStorage Persistence & Recent Documents History
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

  // Stats & Save Indicators
  const docStats = document.getElementById('doc-stats');
  const saveStatusIndicator = document.getElementById('save-status-indicator');
  const btnNewDoc = document.getElementById('btn-new-doc');

  // Recent Documents Modal Elements
  const btnOpenRecents = document.getElementById('btn-open-recents');
  const btnCloseRecents = document.getElementById('btn-close-recents');
  const btnClearAllRecents = document.getElementById('btn-clear-all-recents');
  const recentModal = document.getElementById('recent-modal');
  const recentsListContainer = document.getElementById('recents-list-container');
  const recentCountBadge = document.getElementById('recent-count-badge');

  // Export Buttons
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
  let saveDebounceTimer = null;

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
    persistUserSettings();
  }

  // Apply Font
  function applyFont() {
    const font = fontSelect.value;
    previewCard.className = previewCard.className.replace(/font-[a-z\-]+/g, '').trim();
    previewCard.classList.add(font);
    persistUserSettings();
  }

  // Persist User Customization Settings
  function persistUserSettings() {
    if (!window.markSnapStorage) return;
    markSnapStorage.saveSettings({
      theme: themeSelect.value,
      font: fontSelect.value,
      direction: dirSelect.value,
      width: widthSlider.value,
      padding: paddingSlider.value,
      watermark: watermarkToggle.checked,
      watermarkText: watermarkText.value,
      exportScale: exportScaleSelect.value
    });
  }

  // Restore User Customization Settings
  function restoreUserSettings() {
    if (!window.markSnapStorage) return;
    const s = markSnapStorage.getSettings();
    if (!s) return;

    if (s.theme) themeSelect.value = s.theme;
    if (s.font) fontSelect.value = s.font;
    if (s.direction) dirSelect.value = s.direction;
    if (s.width) {
      widthSlider.value = s.width;
      widthValue.textContent = `${s.width}px`;
      previewCard.style.maxWidth = `${s.width}px`;
    }
    if (s.padding) {
      paddingSlider.value = s.padding;
      paddingValue.textContent = `${s.padding}px`;
      previewCard.style.padding = `${s.padding}px`;
    }
    if (s.watermark !== undefined) {
      watermarkToggle.checked = s.watermark;
      watermarkElement.style.display = s.watermark ? 'flex' : 'none';
    }
    if (s.watermarkText) {
      watermarkText.value = s.watermarkText;
      watermarkAuthor.textContent = s.watermarkText;
    }
    if (s.exportScale) {
      exportScaleSelect.value = s.exportScale;
    }
  }

  // Update Stats & Document Header
  function updateStats(text) {
    const chars = text.length;
    const words = (text.match(/\S+/g) || []).length;
    docStats.textContent = `${chars} chars • ${words} words`;
  }

  // Render Document
  async function renderDocument() {
    const text = editor.value;
    applyDirection(text);
    updateStats(text);
    
    // Extract first H1 as document title
    const titleMatch = text.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      currentFilename = titleMatch[1].trim();
    }

    await window.markSnapRenderer.render(text, markdownContainer);
  }

  // Save to LocalStorage Debounced
  function debouncedSave() {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = setTimeout(() => {
      const text = editor.value;
      if (text.trim()) {
        markSnapStorage.saveCurrent(text, currentFilename);
        markSnapStorage.saveRecent(currentFilename, text, currentFilename);
        updateRecentBadge();
        
        // Visual indicator pulse
        saveStatusIndicator.style.opacity = '1';
        setTimeout(() => {
          saveStatusIndicator.style.opacity = '0.75';
        }, 1200);
      }
    }, 600);
  }

  function handleEditorInput() {
    clearTimeout(renderDebounceTimer);
    renderDebounceTimer = setTimeout(renderDocument, 200);
    debouncedSave();
  }

  // Event Listeners for Controls
  editor.addEventListener('input', handleEditorInput);

  themeSelect.addEventListener('change', () => {
    applyTheme();
    renderDocument();
  });

  fontSelect.addEventListener('change', applyFont);

  dirSelect.addEventListener('change', () => {
    applyDirection(editor.value);
    persistUserSettings();
  });

  widthSlider.addEventListener('input', (e) => {
    const w = e.target.value;
    widthValue.textContent = `${w}px`;
    previewCard.style.maxWidth = `${w}px`;
    previewCard.style.width = '100%';
    persistUserSettings();
  });

  paddingSlider.addEventListener('input', (e) => {
    const p = e.target.value;
    paddingValue.textContent = `${p}px`;
    previewCard.style.padding = `${p}px`;
    persistUserSettings();
  });

  watermarkToggle.addEventListener('change', (e) => {
    watermarkElement.style.display = e.target.checked ? 'flex' : 'none';
    persistUserSettings();
  });

  watermarkText.addEventListener('input', (e) => {
    watermarkAuthor.textContent = e.target.value || 'MarkSnap Visual';
    persistUserSettings();
  });

  exportScaleSelect.addEventListener('change', persistUserSettings);

  // New Blank Document
  btnNewDoc.addEventListener('click', () => {
    if (editor.value.trim() && !confirm('Create a new blank document? Your current document is saved in Recent Files.')) {
      return;
    }
    editor.value = '# Untitled Document\n\nStart writing in Markdown...';
    currentFilename = 'untitled';
    renderDocument();
    debouncedSave();
    showToast('Created new blank document');
  });

  // File Upload Handlers
  function handleFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      editor.value = e.target.result;
      currentFilename = file.name.replace(/\.[^/.]+$/, "");
      renderDocument();
      
      // Save directly to recents
      markSnapStorage.saveCurrent(editor.value, currentFilename);
      markSnapStorage.saveRecent(currentFilename, editor.value, file.name);
      updateRecentBadge();
      showToast(`Loaded and saved: ${file.name}`);
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

  // Recent Documents Modal Logic
  function updateRecentBadge() {
    const count = markSnapStorage.getRecents().length;
    recentCountBadge.textContent = count;
  }

  function renderRecentsList() {
    const recents = markSnapStorage.getRecents();
    recentsListContainer.innerHTML = '';

    if (recents.length === 0) {
      recentsListContainer.innerHTML = `
        <div class="text-center py-10 text-slate-500">
          <i data-lucide="inbox" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
          <p class="text-xs font-medium">No saved documents yet</p>
          <p class="text-[10px] text-slate-600 mt-1">Uploaded files and your writing will automatically appear here.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons({ root: recentsListContainer });
      return;
    }

    recents.forEach(doc => {
      const isRtl = window.markSnapRenderer.detectDirection(doc.title + ' ' + doc.preview) === 'rtl';
      const itemEl = document.createElement('div');
      itemEl.className = 'pt-2.5 pb-2.5 first:pt-0 flex items-start justify-between gap-3 group hover:bg-slate-800/40 p-2.5 rounded-xl transition cursor-pointer';

      itemEl.innerHTML = `
        <div class="flex-1 min-w-0" data-action="load" data-id="${doc.id}">
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-bold text-slate-200 group-hover:text-indigo-400 truncate transition ${isRtl ? 'font-vazir' : ''}" dir="${isRtl ? 'rtl' : 'ltr'}">${markSnapRenderer.escapeHtml(doc.title)}</span>
          </div>
          <p class="text-[11px] text-slate-400 line-clamp-1 mb-1.5 ${isRtl ? 'font-vazir' : ''}" dir="${isRtl ? 'rtl' : 'ltr'}">${markSnapRenderer.escapeHtml(doc.preview || 'No preview available')}</p>
          <div class="flex items-center gap-3 text-[10px] text-slate-500">
            <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${markSnapStorage.formatTimeAgo(doc.updatedAt)}</span>
            <span>•</span>
            <span>${doc.charCount || 0} chars</span>
            <span>•</span>
            <span>${doc.wordCount || 0} words</span>
          </div>
        </div>
        <div class="flex items-center gap-1 shrink-0 pt-0.5">
          <button data-action="delete" data-id="${doc.id}" title="Delete document" class="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i>
          </button>
        </div>
      `;

      // Event listener on item
      itemEl.addEventListener('click', (e) => {
        const delBtn = e.target.closest('[data-action="delete"]');
        if (delBtn) {
          e.stopPropagation();
          const docId = delBtn.dataset.id;
          markSnapStorage.deleteRecent(docId);
          renderRecentsList();
          updateRecentBadge();
          showToast('Document deleted from history');
          return;
        }

        // Load document
        editor.value = doc.content;
        currentFilename = doc.title || doc.filename;
        renderDocument();
        markSnapStorage.saveCurrent(doc.content, currentFilename);
        recentModal.classList.add('hidden');
        showToast(`Loaded: ${doc.title}`);
      });

      recentsListContainer.appendChild(itemEl);
    });

    if (window.lucide) {
      lucide.createIcons({ root: recentsListContainer });
    }
  }

  btnOpenRecents.addEventListener('click', () => {
    renderRecentsList();
    recentModal.classList.remove('hidden');
  });

  btnCloseRecents.addEventListener('click', () => {
    recentModal.classList.add('hidden');
  });

  recentModal.addEventListener('click', (e) => {
    if (e.target === recentModal) {
      recentModal.classList.add('hidden');
    }
  });

  btnClearAllRecents.addEventListener('click', () => {
    if (confirm('Clear all recent documents history?')) {
      markSnapStorage.clearRecents();
      renderRecentsList();
      updateRecentBadge();
      showToast('Recent history cleared');
    }
  });

  // Sample Buttons
  btnSamplePersian.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.persian;
    dirSelect.value = 'rtl';
    fontSelect.value = 'font-vazir';
    themeSelect.value = 'theme-persian-classic';
    currentFilename = 'معماری و استانداردهای نرم‌افزار';
    applyTheme();
    applyFont();
    renderDocument();
    debouncedSave();
    showToast('Loaded Persian Sample with Vazirmatn');
  });

  btnSampleArch.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.architecture;
    dirSelect.value = 'ltr';
    fontSelect.value = 'font-inter';
    themeSelect.value = 'theme-github-dark';
    currentFilename = 'System Architecture Guidelines';
    applyTheme();
    applyFont();
    renderDocument();
    debouncedSave();
    showToast('Loaded Architecture Spec Sample');
  });

  btnSampleMath.addEventListener('click', () => {
    editor.value = window.MarkSnapSamples.scientific;
    dirSelect.value = 'ltr';
    fontSelect.value = 'font-inter';
    themeSelect.value = 'theme-notion';
    currentFilename = 'Mathematical Foundations';
    applyTheme();
    applyFont();
    renderDocument();
    debouncedSave();
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

  // Initial Boot Sequence
  restoreUserSettings();
  applyTheme();
  applyFont();

  // Check LocalStorage for existing session
  const savedDoc = markSnapStorage.getCurrent();
  if (savedDoc && savedDoc.content && savedDoc.content.trim()) {
    editor.value = savedDoc.content;
    currentFilename = savedDoc.filename || 'marksnap-doc';
  } else {
    // Default to Persian sample on first launch
    editor.value = window.MarkSnapSamples.persian;
    currentFilename = 'معماری و استانداردهای نرم‌افزار';
    markSnapStorage.saveRecent(currentFilename, editor.value, currentFilename);
  }

  updateRecentBadge();
  renderDocument();
});
