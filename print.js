/**
 * print.js — High-performance, client-side direct printing for PDFTool4You
 * Supports direct in-browser printing for processed PDF documents and converted images.
 * Operates flawlessly across mobile, tablet, and desktop, with isolated print iframes
 * and graceful fallbacks for sandboxed environments.
 */

(function () {
    'use strict';

    // Global print lock
    let isPrintingActive = false;

    // Inject fallback CSS for main-window print
    function ensurePrintStyles() {
        if (!document.getElementById('pdftool-print-styles')) {
            const style = document.createElement('style');
            style.id = 'pdftool-print-styles';
            style.textContent = `
                @media print {
                    body > *:not(#pdftool-print-area) {
                        display: none !important;
                    }
                    #pdftool-print-area {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        z-index: 999999 !important;
                    }
                    #pdftool-print-area .print-page {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 auto !important;
                    }
                    #pdftool-print-area .print-page:last-child {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }
                }
                @media screen {
                    #pdftool-print-area {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    ensurePrintStyles();

    function getOrCreatePrintArea() {
        let area = document.getElementById('pdftool-print-area');
        if (!area) {
            area = document.createElement('div');
            area.id = 'pdftool-print-area';
            document.body.appendChild(area);
        } else {
            area.innerHTML = '';
        }
        return area;
    }

    function getOrCreatePrintIframe() {
        let iframe = document.getElementById('pdftool-print-iframe');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'pdftool-print-iframe';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '1px';
            iframe.style.height = '1px';
            iframe.style.opacity = '0.01';
            iframe.style.border = 'none';
            iframe.style.pointerEvents = 'none';
            iframe.style.zIndex = '-9999';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.setAttribute('title', 'Print Preview Frame');
            document.body.appendChild(iframe);
        }
        return iframe;
    }

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

    /**
     * Converts a document source into an array of rendered image data URLs.
     */
    async function extractPrintPageImages(source, mimeType = 'application/pdf') {
        const pageImages = [];
        const isPdf = (mimeType && mimeType.includes('pdf')) ||
                      (source instanceof Blob && source.type.includes('pdf')) ||
                      (typeof source === 'string' && (source.includes('pdf') || source.startsWith('blob:') || source.endsWith('.pdf')));

        if (isPdf) {
            const pdfjs = await ensurePdfJs();
            let data = null;

            try {
                if (typeof source === 'string') {
                    const resp = await fetch(source);
                    data = await resp.arrayBuffer();
                } else if (source instanceof Blob) {
                    data = await source.arrayBuffer();
                } else if (source instanceof ArrayBuffer) {
                    data = source;
                } else if (ArrayBuffer.isView(source)) {
                    data = source.buffer;
                }

                if (pdfjs && data) {
                    const pdfDoc = await pdfjs.getDocument({ data: data.slice(0) }).promise;
                    const numPages = pdfDoc.numPages;

                    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                        const page = await pdfDoc.getPage(pageNum);
                        // Scale 2.0 provides ~150-200 DPI crisp print output
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = Math.round(viewport.width);
                        canvas.height = Math.round(viewport.height);
                        const ctx = canvas.getContext('2d', { alpha: false });
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        await page.render({ canvasContext: ctx, viewport }).promise;
                        pageImages.push(canvas.toDataURL('image/jpeg', 0.95));
                    }
                }
            } catch (err) {
                console.warn('PDF page rendering for print warning:', err);
            }
        } else {
            // Direct image source
            let imgUrl = typeof source === 'string' ? source : (source instanceof Blob ? URL.createObjectURL(source) : '');
            if (imgUrl) {
                pageImages.push(imgUrl);
            }
        }

        return pageImages;
    }

    /**
     * Executes the print action using an isolated hidden iframe,
     * falling back to the main document print area if iframe printing is restricted.
     */
    window.printProcessedDocument = async function (source, mimeType = 'application/pdf', title = 'Document') {
        if (!source) {
            console.warn('printProcessedDocument called with empty source');
            return;
        }

        if (isPrintingActive) {
            console.warn('Print job already in progress, please wait.');
            return;
        }
        isPrintingActive = true;

        try {
            const images = await extractPrintPageImages(source, mimeType);
            if (!images || images.length === 0) {
                console.warn('No printable pages rendered.');
                return;
            }

            // Strategy 1: Isolated Hidden Iframe Print (Cleanest & no main window style distortion)
            let printedSuccessfully = false;
            try {
                const iframe = getOrCreatePrintIframe();
                const iDoc = iframe.contentDocument || iframe.contentWindow?.document;
                if (iDoc) {
                    iDoc.open();
                    iDoc.write(`
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <title>${title || 'Print Document'}</title>
                            <style>
                                @page {
                                    size: auto;
                                    margin: 0mm;
                                }
                                html, body {
                                    margin: 0;
                                    padding: 0;
                                    background: #ffffff;
                                    width: 100%;
                                }
                                .print-page {
                                    display: block;
                                    width: 100%;
                                    max-width: 100%;
                                    height: auto;
                                    margin: 0 auto;
                                    page-break-after: always;
                                    break-after: page;
                                }
                                .print-page:last-child {
                                    page-break-after: avoid;
                                    break-after: avoid;
                                }
                            </style>
                        </head>
                        <body>
                            ${images.map(src => `<img class="print-page" src="${src}" alt="Print Page" />`).join('')}
                        </body>
                        </html>
                    `);
                    iDoc.close();

                    // Wait for all iframe images to finish decoding/loading
                    const frameImages = Array.from(iDoc.querySelectorAll('img'));
                    await Promise.all(frameImages.map(img => {
                        if (img.decode) return img.decode().catch(() => {});
                        if (img.complete) return Promise.resolve();
                        return new Promise(res => { img.onload = res; img.onerror = res; });
                    }));

                    // Give browser layout a moment, then print
                    await new Promise(r => setTimeout(r, 150));
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                    printedSuccessfully = true;
                }
            } catch (iframeErr) {
                console.warn('Iframe print failed or blocked, attempting fallback print area:', iframeErr);
            }

            // Strategy 2: Fallback to main document print area if iframe printing was blocked
            if (!printedSuccessfully) {
                ensurePrintStyles();
                const area = getOrCreatePrintArea();
                area.innerHTML = images.map(src => `<img class="print-page" src="${src}" alt="Print Page" />`).join('');

                const areaImages = Array.from(area.querySelectorAll('img'));
                await Promise.all(areaImages.map(img => {
                    if (img.decode) return img.decode().catch(() => {});
                    if (img.complete) return Promise.resolve();
                    return new Promise(res => { img.onload = res; img.onerror = res; });
                }));

                await new Promise(r => setTimeout(r, 200));

                try {
                    window.focus();
                    window.print();
                    printedSuccessfully = true;
                } catch (winErr) {
                    console.error('Main window print failed:', winErr);
                }

                // Cleanup fallback area only after user dismisses print dialog or after 60s
                const cleanupArea = () => {
                    if (area) area.innerHTML = '';
                    window.removeEventListener('afterprint', cleanupArea);
                };
                window.addEventListener('afterprint', cleanupArea, { once: true });
                setTimeout(cleanupArea, 60000);
            }

        } catch (err) {
            console.error('PrintProcessedDocument error:', err);
        } finally {
            isPrintingActive = false;
        }
    };

    /**
     * Binds a print trigger button without stacking duplicate event listeners.
     */
    window.attachPrintAction = function (buttonElement, getSourceCallback, mimeType = 'application/pdf') {
        if (!buttonElement) return;

        // Store the callback dynamically so re-invoking attachPrintAction updates the source
        buttonElement._printGetSource = getSourceCallback;
        buttonElement._printMimeType = mimeType;

        if (buttonElement.hasAttribute('data-print-bound')) {
            // Already bound, just updated source reference
            return;
        }
        buttonElement.setAttribute('data-print-bound', 'true');

        buttonElement.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (buttonElement.disabled) return;

            const source = buttonElement._printGetSource 
                ? buttonElement._printGetSource() 
                : (window.currentDownloadUrl || window.currentPdfUrl);

            if (!source) {
                console.warn('No document available to print yet.');
                return;
            }

            const originalContent = buttonElement.innerHTML;
            buttonElement.disabled = true;
            buttonElement.classList.add('opacity-75', 'cursor-wait');

            const labelEl = buttonElement.querySelector('.print-btn-label') || buttonElement;
            const originalText = labelEl.textContent;
            labelEl.textContent = 'Preparing print...';

            try {
                await window.printProcessedDocument(
                    source, 
                    buttonElement._printMimeType || mimeType, 
                    document.title || 'Print Document'
                );
            } catch (err) {
                console.error('Print action error:', err);
            } finally {
                setTimeout(() => {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('opacity-75', 'cursor-wait');
                    buttonElement.innerHTML = originalContent;
                }, 500);
            }
        });
    };

    // Auto-delegate print buttons when clicked across tools
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#print-doc-btn, #print-pdf-btn, [data-action="print"], .btn-print-doc');
        if (!btn) return;

        if (btn.hasAttribute('data-print-bound')) return;

        const source = window.currentDownloadUrl || 
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
