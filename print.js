/**
 * print.js — Exact Default Size System Printing for PDFTool4You
 * Directly triggers the native system print dialog formatted to the document's
 * exact default/cropped dimensions without forcing standard A4/Letter scaling,
 * with zero intermediate preview modals or popups.
 */

(function () {
    'use strict';

    let isPrintingActive = false;

    async function ensurePdfJs() {
        if (window.pdfjsLib) {
            if (!window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
            }
            return window.pdfjsLib;
        }

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'pdf.min.js';
            script.onload = () => {
                if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
                }
                resolve(window.pdfjsLib);
            };
            script.onerror = () => {
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                cdnScript.onload = () => {
                    if (window.pdfjsLib) {
                        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    }
                    resolve(window.pdfjsLib);
                };
                cdnScript.onerror = () => resolve(null);
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(script);
        });
    }

    function createHiddenPrintIframe() {
        const existing = document.getElementById('pdftool-print-iframe');
        if (existing) existing.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'pdftool-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.opacity = '0.01';
        iframe.style.border = 'none';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.setAttribute('tabindex', '-1');
        document.body.appendChild(iframe);
        return iframe;
    }

    async function getSourceArrayBuffer(source) {
        if (source instanceof ArrayBuffer) return source;
        if (ArrayBuffer.isView(source)) return source.buffer;
        if (source instanceof Blob) return await source.arrayBuffer();
        if (typeof source === 'string') {
            const res = await fetch(source);
            return await res.arrayBuffer();
        }
        return null;
    }

    /**
     * Directly triggers native browser / system print dialog formatted
     * to the exact native dimensions of the PDF or image.
     */
    window.printProcessedDocument = async function (source, mimeType = 'application/pdf', title = 'Document') {
        if (!source) {
            console.warn('printProcessedDocument called with empty source');
            return;
        }

        if (isPrintingActive) return;
        isPrintingActive = true;

        const isPdf = (mimeType && mimeType.includes('pdf')) ||
                      (source instanceof Blob && source.type.includes('pdf')) ||
                      (typeof source === 'string' && (source.includes('.pdf') || source.startsWith('blob:') || source.includes('application/pdf')));

        try {
            if (isPdf) {
                const pdfjs = await ensurePdfJs();
                const buffer = await getSourceArrayBuffer(source);

                if (pdfjs && buffer) {
                    const pdfDoc = await pdfjs.getDocument({ data: buffer.slice(0) }).promise;
                    const numPages = pdfDoc.numPages;

                    // Get dimensions of first page to set exact @page size
                    const firstPage = await pdfDoc.getPage(1);
                    const firstVp = firstPage.getViewport({ scale: 1.0 });
                    const pageWidthPt = Math.round(firstVp.width * 100) / 100;
                    const pageHeightPt = Math.round(firstVp.height * 100) / 100;

                    // Render pages to high-resolution crisp image data
                    // Uses scale 2.0 (approx 150-200 DPI crisp print quality)
                    const renderedPages = [];
                    for (let p = 1; p <= numPages; p++) {
                        const page = (p === 1) ? firstPage : await pdfDoc.getPage(p);
                        const vp = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(vp.width);
                        canvas.height = Math.round(vp.height);
                        const ctx = canvas.getContext('2d', { alpha: false });
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        await page.render({ canvasContext: ctx, viewport: vp }).promise;
                        renderedPages.push({
                            src: canvas.toDataURL('image/jpeg', 0.95),
                            widthPt: Math.round(page.getViewport({ scale: 1.0 }).width * 100) / 100,
                            heightPt: Math.round(page.getViewport({ scale: 1.0 }).height * 100) / 100
                        });
                    }

                    // Build print document with exact @page dimensions matching the PDF's own size
                    const iframe = createHiddenPrintIframe();
                    const doc = iframe.contentDocument || iframe.contentWindow?.document;
                    if (doc) {
                        doc.open();
                        doc.write(`
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <title>${title || 'Print Document'}</title>
                                <style>
                                    @page {
                                        size: ${pageWidthPt}pt ${pageHeightPt}pt;
                                        margin: 0mm !important;
                                    }
                                    html, body {
                                        margin: 0 !important;
                                        padding: 0 !important;
                                        width: 100% !important;
                                        background: #ffffff !important;
                                    }
                                    .print-page-box {
                                        width: ${pageWidthPt}pt !important;
                                        height: ${pageHeightPt}pt !important;
                                        max-width: ${pageWidthPt}pt !important;
                                        max-height: ${pageHeightPt}pt !important;
                                        margin: 0 auto !important;
                                        padding: 0 !important;
                                        display: block !important;
                                        page-break-after: always !important;
                                        break-after: page !important;
                                        overflow: hidden !important;
                                    }
                                    .print-page-box:last-child {
                                        page-break-after: avoid !important;
                                        break-after: avoid !important;
                                    }
                                    .print-page-box img {
                                        width: 100% !important;
                                        height: 100% !important;
                                        display: block !important;
                                        object-fit: contain !important;
                                    }
                                </style>
                            </head>
                            <body>
                                ${renderedPages.map((pg, i) => `
                                    <div class="print-page-box" style="width:${pg.widthPt}pt; height:${pg.heightPt}pt;">
                                        <img src="${pg.src}" alt="Page ${i + 1}" />
                                    </div>
                                `).join('')}
                            </body>
                            </html>
                        `);
                        doc.close();

                        // Wait for images to load, then trigger system print
                        const imgs = Array.from(doc.querySelectorAll('img'));
                        await Promise.all(imgs.map(img => {
                            if (img.complete) return Promise.resolve();
                            return new Promise(res => { img.onload = res; img.onerror = res; });
                        }));

                        setTimeout(() => {
                            try {
                                iframe.contentWindow.focus();
                                iframe.contentWindow.print();
                            } catch (e) {
                                console.warn('Iframe print error:', e);
                            } finally {
                                isPrintingActive = false;
                            }
                        }, 150);
                        return;
                    }
                }

                // Fallback: direct blob URL if PDF.js is unavailable
                const sourceUrl = (typeof source === 'string') ? source : URL.createObjectURL(source);
                const iframe = createHiddenPrintIframe();
                iframe.onload = () => {
                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        } catch (_) {}
                        isPrintingActive = false;
                    }, 200);
                };
                iframe.src = sourceUrl;

            } else {
                // Image Print (PNG / JPG / PAN Card)
                const imgUrl = (typeof source === 'string') ? source : URL.createObjectURL(source);
                const img = new Image();
                img.src = imgUrl;

                await new Promise((res) => {
                    if (img.complete) return res();
                    img.onload = res;
                    img.onerror = res;
                });

                const naturalW = img.naturalWidth || 800;
                const naturalH = img.naturalHeight || 600;
                // Convert 96 DPI CSS pixels to PDF points (1px = 0.75pt)
                const widthPt = Math.round(naturalW * 0.75 * 100) / 100;
                const heightPt = Math.round(naturalH * 0.75 * 100) / 100;

                const iframe = createHiddenPrintIframe();
                const doc = iframe.contentDocument || iframe.contentWindow?.document;
                if (doc) {
                    doc.open();
                    doc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <title>${title || 'Print Image'}</title>
                            <style>
                                @page {
                                    size: ${widthPt}pt ${heightPt}pt;
                                    margin: 0mm !important;
                                }
                                html, body {
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    width: 100% !important;
                                    background: #ffffff !important;
                                }
                                .image-container {
                                    width: ${widthPt}pt !important;
                                    height: ${heightPt}pt !important;
                                    margin: 0 auto !important;
                                    display: block !important;
                                }
                                img {
                                    width: 100% !important;
                                    height: 100% !important;
                                    display: block !important;
                                    object-fit: contain !important;
                                }
                            </style>
                        </head>
                        <body>
                            <div class="image-container">
                                <img src="${imgUrl}" alt="Print Document" />
                            </div>
                        </body>
                        </html>
                    `);
                    doc.close();

                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        } catch (_) {}
                        isPrintingActive = false;
                    }, 200);
                }
            }
        } catch (err) {
            console.error('Direct print execution failed:', err);
            isPrintingActive = false;
        }
    };

    /**
     * Binds a print trigger button to execute system print directly in its exact size.
     */
    window.attachPrintAction = function (buttonElement, getSourceCallback, mimeType = 'application/pdf') {
        if (!buttonElement) return;

        buttonElement._printGetSource = getSourceCallback;
        buttonElement._printMimeType = mimeType;

        if (buttonElement.hasAttribute('data-print-bound')) return;
        buttonElement.setAttribute('data-print-bound', 'true');

        buttonElement.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (buttonElement.disabled) return;

            const source = buttonElement._printGetSource 
                ? buttonElement._printGetSource() 
                : (window.currentCroppedUrl || window.currentDownloadUrl || window.currentPdfUrl);

            if (!source) {
                console.warn('No document available to print yet.');
                return;
            }

            try {
                await window.printProcessedDocument(
                    source, 
                    buttonElement._printMimeType || mimeType, 
                    document.title || 'Print Document'
                );
            } catch (err) {
                console.error('Print button error:', err);
            }
        });
    };

    // Auto-delegate print buttons when clicked across all tools
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#print-doc-btn, #print-pdf-btn, #btn-print-pan, [data-action="print"], .btn-print-doc');
        if (!btn) return;

        if (btn.hasAttribute('data-print-bound')) return;

        const source = window.currentCroppedUrl ||
                       window.currentDownloadUrl || 
                       window.currentPdfUrl || 
                       window.currentWatermarkedUrl || 
                       window.currentMergedPdfUrl || 
                       window.currentSplitPdfUrl || 
                       window.currentDecryptedPdfUrl || 
                       window.currentOutputBlob || 
                       window.currentOutputFile;
        
        if (source) {
            e.preventDefault();
            e.stopPropagation();
            window.printProcessedDocument(source, 'application/pdf', document.title);
        }
    }, true);
})();
