/**
 * MarkSnap Markdown Parser Engine
 * Handles Marked, Highlight.js, Mermaid, KaTeX, and RTL Auto-Detection
 */

class MarkSnapRenderer {
  constructor() {
    this.initMermaid();
    this.initMarked();
  }

  initMermaid() {
    if (window.mermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        fontFamily: 'Vazirmatn, Inter, sans-serif'
      });
    }
  }

  initMarked() {
    const renderer = new marked.Renderer();
    const self = this;

    // Custom code block renderer for Mermaid and Syntax Highlighting
    renderer.code = function(tokenOrCode, infostring, escaped) {
      const code = typeof tokenOrCode === 'object' ? tokenOrCode.text : tokenOrCode;
      const lang = ((typeof tokenOrCode === 'object' ? tokenOrCode.lang : infostring) || '').trim().toLowerCase();

      if (lang === 'mermaid') {
        const id = 'mermaid-' + Math.random().toString(36).substring(2, 9);
        return `<div class="mermaid-container"><div id="${id}" class="mermaid">${self.escapeHtml(code)}</div></div>`;
      }

      let highlighted = '';
      if (window.hljs && lang && hljs.getLanguage(lang)) {
        try {
          highlighted = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        } catch (e) {
          highlighted = self.escapeHtml(code);
        }
      } else if (window.hljs) {
        try {
          highlighted = hljs.highlightAuto(code).value;
        } catch (e) {
          highlighted = self.escapeHtml(code);
        }
      } else {
        highlighted = self.escapeHtml(code);
      }

      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    };

    // Custom link renderer
    renderer.link = function(tokenOrHref, title, text) {
      const href = typeof tokenOrHref === 'object' ? tokenOrHref.href : tokenOrHref;
      const t = typeof tokenOrHref === 'object' ? tokenOrHref.title : title;
      const txt = typeof tokenOrHref === 'object' ? tokenOrHref.text : text;
      const titleAttr = t ? ` title="${t}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${txt}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true
    });
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Detects whether text has predominantly Persian/Arabic characters
   */
  detectDirection(text) {
    if (!text) return 'ltr';
    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const matches = text.match(rtlRegex);
    const rtlCount = matches ? matches.length : 0;
    const latinCount = (text.match(/[A-Za-z]/g) || []).length;
    return rtlCount > latinCount * 0.4 ? 'rtl' : 'ltr';
  }

  /**
   * Transforms GitHub alert callouts: > [!NOTE], > [!TIP], etc.
   */
  processCallouts(text) {
    const alertTypes = {
      NOTE: { class: 'alert-note', icon: 'info', label: 'Note' },
      TIP: { class: 'alert-tip', icon: 'lightbulb', label: 'Tip' },
      IMPORTANT: { class: 'alert-important', icon: 'alert-circle', label: 'Important' },
      WARNING: { class: 'alert-warning', icon: 'alert-triangle', label: 'Warning' },
      CAUTION: { class: 'alert-caution', icon: 'octagon-alert', label: 'Caution' }
    };

    return text.replace(
      />\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n)([\s\S]*?)(?=(?:\r?\n\s*\r?\n)|$)/gi,
      (match, type, content) => {
        const t = type.toUpperCase();
        const conf = alertTypes[t] || alertTypes.NOTE;
        const cleanContent = content.split('\n').map(line => line.replace(/^>\s?/, '')).join('\n');
        return `<div class="alert-callout ${conf.class}">
          <div class="alert-icon"><i data-lucide="${conf.icon}"></i></div>
          <div class="alert-body">
            <strong>${conf.label}</strong>
            <div>${cleanContent}</div>
          </div>
        </div>`;
      }
    );
  }

  /**
   * Protect and process LaTeX formulas with KaTeX
   */
  processMath(text) {
    if (!window.katex) return text;

    // Display math: $$...$$
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        return `<div class="katex-display">${katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</div>`;
      } catch (e) {
        return match;
      }
    });

    // Inline math: $...$
    text = text.replace(/\$([^\$\n]+?)\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });

    return text;
  }

  /**
   * Main render function that outputs HTML string
   */
  async render(markdownText, containerEl) {
    if (!markdownText || !containerEl) return;

    let processed = this.processCallouts(markdownText);
    processed = this.processMath(processed);

    const parsedHtml = marked.parse(processed);
    containerEl.innerHTML = parsedHtml;

    // Trigger Lucide icons
    if (window.lucide) {
      lucide.createIcons({ root: containerEl });
    }

    // Trigger Mermaid rendering
    if (window.mermaid) {
      try {
        await mermaid.run({
          querySelector: '.mermaid'
        });
      } catch (e) {
        console.warn('Mermaid rendering notice:', e);
      }
    }
  }
}

window.markSnapRenderer = new MarkSnapRenderer();
