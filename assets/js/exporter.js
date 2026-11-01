/**
 * MarkSnap Exporter Engine
 * Client-side High-Resolution Image (PNG, JPG), PDF & SVG Exporting
 */

class MarkSnapExporter {
  constructor() {
    this.isExporting = false;
  }

  getFilename(baseName, extension) {
    const clean = (baseName || 'marksnap-document').trim().toLowerCase().replace(/[^a-z0-9_\-\u0600-\u06FF]+/g, '-');
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${clean}-${timestamp}.${extension}`;
  }

  async getRenderOptions(node, scale = 2) {
    // Clone or read computed background
    const computedStyle = window.getComputedStyle(node);
    return {
      pixelRatio: scale,
      quality: 0.98,
      backgroundColor: computedStyle.backgroundColor || '#0d1117',
      style: {
        transform: 'none',
        borderRadius: window.getComputedStyle(node).borderRadius || '16px'
      },
      filter: (childNode) => {
        // Exclude UI controls if any inside
        if (childNode.classList && childNode.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    };
  }

  /**
   * Export to high-resolution PNG
   */
  async toPng(node, baseName, scale = 2) {
    if (this.isExporting) return;
    this.isExporting = true;
    try {
      const options = await this.getRenderOptions(node, scale);
      const dataUrl = await htmlToImage.toPng(node, options);
      this.triggerDownload(dataUrl, this.getFilename(baseName, 'png'));
      return true;
    } catch (err) {
      console.error('PNG export error:', err);
      throw err;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export to JPG
   */
  async toJpg(node, baseName, quality = 0.95, scale = 2) {
    if (this.isExporting) return;
    this.isExporting = true;
    try {
      const options = await this.getRenderOptions(node, scale);
      options.quality = quality;
      const dataUrl = await htmlToImage.toJpeg(node, options);
      this.triggerDownload(dataUrl, this.getFilename(baseName, 'jpg'));
      return true;
    } catch (err) {
      console.error('JPG export error:', err);
      throw err;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export to PDF (Continuous Roll or A4 Paged)
   */
  async toPdf(node, baseName, mode = 'continuous') {
    if (this.isExporting) return;
    this.isExporting = true;
    try {
      const options = await this.getRenderOptions(node, 2);
      const dataUrl = await htmlToImage.toPng(node, options);

      const { jsPDF } = window.jspdf;
      const rect = node.getBoundingClientRect();
      const widthMm = (rect.width * 25.4) / 96;
      const heightMm = (rect.height * 25.4) / 96;

      if (mode === 'continuous') {
        // Continuous roll PDF
        const pdf = new jsPDF({
          orientation: widthMm > heightMm ? 'l' : 'p',
          unit: 'mm',
          format: [widthMm + 20, heightMm + 20]
        });
        pdf.addImage(dataUrl, 'PNG', 10, 10, widthMm, heightMm);
        pdf.save(this.getFilename(baseName, 'pdf'));
      } else {
        // Multi-page standard A4 PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const printWidth = pageWidth - (margin * 2);
        const printHeight = (rect.height * printWidth) / rect.width;

        let heightLeft = printHeight;
        let position = margin;

        pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, printHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - printHeight + margin;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', margin, position, printWidth, printHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(this.getFilename(baseName, 'pdf'));
      }
      return true;
    } catch (err) {
      console.error('PDF export error:', err);
      throw err;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export to SVG
   */
  async toSvg(node, baseName) {
    if (this.isExporting) return;
    this.isExporting = true;
    try {
      const dataUrl = await htmlToImage.toSvg(node);
      this.triggerDownload(dataUrl, this.getFilename(baseName, 'svg'));
      return true;
    } catch (err) {
      console.error('SVG export error:', err);
      throw err;
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Copy image directly to Clipboard
   */
  async copyToClipboard(node) {
    if (this.isExporting) return;
    this.isExporting = true;
    try {
      const options = await this.getRenderOptions(node, 2);
      const blob = await htmlToImage.toBlob(node, options);
      if (!blob) throw new Error('Blob conversion failed');
      
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return true;
    } catch (err) {
      console.error('Clipboard copy error:', err);
      throw err;
    } finally {
      this.isExporting = false;
    }
  }

  triggerDownload(dataUrl, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

window.markSnapExporter = new MarkSnapExporter();
