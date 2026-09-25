/**
 * print.js — High-performance, client-side direct printing for PDFTool4You
 * Supports direct in-browser printing for processed PDF documents and converted images.
 * Operates flawlessly across mobile, tablet, and desktop without popup blockers or iframe issues.
 */

(function () {
    'use strict';

    // Inject required CSS for print media hiding
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

    window.printProcessedDocument = async function (source, mimeType = 'application/pdf', title = 'Document') {
        if (!source) {
            console.warn('printProcessedDocument called with empty source');
            return;
        }

        ensurePrintStyles();
        const area = getOrCreatePrintArea();

        const isPdf = mimeType.includes('pdf') || 
                      (typeof source === 'string' && (source.includes('pdf') || source.endsWith('.pdf'))) ||
                      (source instanceof Blob && source.type.includes('pdf'));

        if (isPdf) {
            const pdfjs = await ensurePdfJs();
            let data;

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
                        const viewport = page.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;
                        const ctx = canvas.getContext('2d', { alpha: false });
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);

                        await page.render({ canvasContext: ctx, viewport }).promise;

                        const img = document.createElement('img');
                        img.className = 'print-page';
                        img.src = canvas.toDataURL('image/jpeg', 0.95);
                        area.appendChild(img);
                    }
                }
            } catch (err) {
                console.warn('PDF page rendering for print warning:', err);
            }
        } else {
            // Image print
            let imgUrl = typeof source === 'string' ? source : (source instanceof Blob ? URL.createObjectURL(source) : '');
            if (imgUrl) {
                const img = document.createElement('img');
                img.className = 'print-page';
                img.src = imgUrl;
                area.appendChild(img);

                if (!img.complete) {
                    await new Promise((res) => {
                        img.onload = res;
                        img.onerror = res;
                    });
                }
            }
        }

        // Trigger native print dialog
        setTimeout(() => {
            try {
                window.focus();
                window.print();
            } catch (e) {
                console.error('Print call failed:', e);
            } finally {
                setTimeout(() => {
                    area.innerHTML = '';
                }, 1000);
            }
        }, 150);
    };

    window.attachPrintAction = function (buttonElement, getSourceCallback, mimeType = 'application/pdf') {
        if (!buttonElement) return;

        buttonElement.setAttribute('data-print-bound', 'true');

        buttonElement.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const source = getSourceCallback ? getSourceCallback() : (window.currentDownloadUrl || window.currentPdfUrl);
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
                await window.printProcessedDocument(source, mimeType, document.title || 'Print Document');
            } catch (err) {
                console.error('Print action error:', err);
            } finally {
                setTimeout(() => {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('opacity-75', 'cursor-wait');
                    buttonElement.innerHTML = originalContent;
                }, 800);
            }
        });
    };

    // Auto-delegate print buttons when clicked
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('#print-doc-btn, #print-pdf-btn, [data-action="print"], .btn-print-doc');
        if (!btn) return;

        if (btn.hasAttribute('data-print-bound')) return;

        let source = window.currentDownloadUrl || window.currentPdfUrl || window.currentWatermarkedUrl || window.currentMergedPdfUrl || window.currentSplitPdfUrl || window.currentDecryptedPdfUrl || window.currentOutputBlob || window.currentOutputFile;
        
        if (source) {
            e.preventDefault();
            e.stopPropagation();
            window.printProcessedDocument(source, 'application/pdf', document.title);
        }
    }, true);

})();
