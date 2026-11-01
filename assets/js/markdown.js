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
        return `<div class="mermaid-container"><pre id="${id}" class="mermaid">${code}</pre></div>`;
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
    // Strip code blocks and inline code before detecting direction
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`\n]+?`/g, '');

    const rtlRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;
    const matches = cleanText.match(rtlRegex);
    const rtlCount = matches ? matches.length : 0;
    const latinCount = (cleanText.match(/[A-Za-z]/g) || []).length;
    return rtlCount > latinCount * 0.3 ? 'rtl' : 'ltr';
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
   * Main render function that outputs HTML string
   */
  async render(markdownText, containerEl) {
    if (!markdownText || !containerEl) return;

    // Step 1: Stash fenced code blocks and inline code spans so they are NEVER mangled by math or callout regexes
    const codeStash = [];
    const stashCode = (match) => {
      const token = `%%MARKSNAP_CODE_${codeStash.length}%%`;
      codeStash.push(match);
      return token;
    };

    // Stash fenced code blocks (```...```)
    let text = markdownText.replace(/```[\s\S]*?```/g, stashCode);
    // Stash inline code (`...`)
    text = text.replace(/`[^`\n]+?`/g, stashCode);

    // Step 2: Process GitHub callouts on the prose text
    text = this.processCallouts(text);

    // Step 3: Process LaTeX math expressions with KaTeX, stashing rendered HTML into placeholders
    const mathStash = [];
    const stashMath = (renderedHtml) => {
      const token = `MARKSNAPMATH${mathStash.length}TOKEN`;
      mathStash.push(renderedHtml);
      return token;
    };

    if (window.katex) {
      // Display math: $$...$$
      text = text.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
        try {
          const rendered = `<div class="katex-display">${katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</div>`;
          return stashMath(rendered);
        } catch (e) {
          return match;
        }
      });

      // Inline math: $formula$
      // Strict matching:
      // - Not preceded by word character, backslash, or dollar
      // - Not followed by word character, digit, or dollar
      // - Inside formula: cannot start or end with space or newline
      text = text.replace(/(?<![\w\\\$])\$([^\$\s\n](?:[^\$\n]*?[^\$\s\n])?)\$(?![\w\$])/g, (match, formula) => {
        try {
          const rendered = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
          return stashMath(rendered);
        } catch (e) {
          return match;
        }
      });
    }

    // Step 4: Restore stashed code blocks & inline code spans intact
    for (let i = 0; i < codeStash.length; i++) {
      text = text.replace(`%%MARKSNAP_CODE_${i}%%`, codeStash[i]);
    }

    // Step 5: Parse with Marked
    let parsedHtml = marked.parse(text);

    // Step 6: Restore rendered KaTeX math HTML into the final output
    for (let i = 0; i < mathStash.length; i++) {
      parsedHtml = parsedHtml.replace(`MARKSNAPMATH${i}TOKEN`, mathStash[i]);
    }

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
