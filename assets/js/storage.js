/**
 * MarkSnap Local Storage Manager
 * Handles auto-saving active documents, recent document history, and user preferences
 */

class MarkSnapStorage {
  constructor() {
    this.KEY_CURRENT = 'marksnap_current_doc';
    this.KEY_RECENTS = 'marksnap_recent_docs_v1';
    this.KEY_SETTINGS = 'marksnap_user_settings';
    this.MAX_RECENTS = 15;
  }

  // --- Current Active Document ---
  saveCurrent(content, filename = '') {
    if (!content) return;
    try {
      const data = {
        content: content,
        filename: filename,
        updatedAt: Date.now()
      };
      localStorage.setItem(this.KEY_CURRENT, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage saveCurrent failed (quota exceeded?):', e);
    }
  }

  getCurrent() {
    try {
      const raw = localStorage.getItem(this.KEY_CURRENT);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // --- User Settings ---
  saveSettings(settings) {
    try {
      localStorage.setItem(this.KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage saveSettings failed:', e);
    }
  }

  getSettings() {
    try {
      const raw = localStorage.getItem(this.KEY_SETTINGS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  // --- Recent Documents History ---
  getRecents() {
    try {
      const raw = localStorage.getItem(this.KEY_RECENTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Add or update document in recent history
   */
  saveRecent(title, content, filename = '') {
    if (!content || !content.trim()) return null;
    try {
      let recents = this.getRecents();
      const cleanTitle = (title || filename || 'Untitled Document').trim();

      // Check if document already exists by exact content or title
      const existingIdx = recents.findIndex(
        doc => doc.content.trim() === content.trim() || (doc.title === cleanTitle && Math.abs(doc.updatedAt - Date.now()) < 60000)
      );

      const entry = {
        id: existingIdx >= 0 ? recents[existingIdx].id : 'doc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        title: cleanTitle,
        filename: filename || (cleanTitle + '.md'),
        content: content,
        preview: content.replace(/^[#\s\-*`>]+/gm, '').slice(0, 120).trim(),
        charCount: content.length,
        wordCount: (content.match(/\S+/g) || []).length,
        updatedAt: Date.now()
      };

      if (existingIdx >= 0) {
        recents.splice(existingIdx, 1);
      }

      // Add to beginning of array
      recents.unshift(entry);

      // Keep within MAX_RECENTS
      if (recents.length > this.MAX_RECENTS) {
        recents = recents.slice(0, this.MAX_RECENTS);
      }

      localStorage.setItem(this.KEY_RECENTS, JSON.stringify(recents));
      return entry;
    } catch (e) {
      console.warn('Storage saveRecent failed:', e);
      return null;
    }
  }

  deleteRecent(id) {
    try {
      let recents = this.getRecents();
      recents = recents.filter(d => d.id !== id);
      localStorage.setItem(this.KEY_RECENTS, JSON.stringify(recents));
      return recents;
    } catch (e) {
      return [];
    }
  }

  clearRecents() {
    try {
      localStorage.removeItem(this.KEY_RECENTS);
    } catch (e) {}
  }

  /**
   * Relative time formatting (e.g., 'Just now', '5 mins ago')
   */
  formatTimeAgo(timestamp) {
    if (!timestamp) return '';
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 30) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }
}

window.markSnapStorage = new MarkSnapStorage();
