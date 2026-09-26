/**
 * print.js — Direct System Printing for PDFTool4You
 * When the user clicks Print, directly triggers the native system print dialog
 * without any intermediate preview modals or popups.
 */

(function () {
    'use strict';

    let isPrintingActive = false;

    // Injected print stylesheet for direct document/image printing
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
                    #pdftool-print-area img,
                    #pdftool-print-area .print-page {
                        display: block !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        page-break-after: always !important;
                        break-after: page !important;
                        margin: 0 auto !important;
                    }
                    #pdftool-print-area img:last-child,
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

    function getSourceUrl(source, mimeType = 'application/pdf') {
        if (!source) return '';
        if (typeof source === 'string') return source;
        if (source instanceof Blob) return URL.createObjectURL(source);
        if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
            const blob = new Blob([source], { type: mimeType || 'application/pdf' });
            return URL.createObjectURL(blob);
        }
        return '';
    }

    /**
     * Directly triggers native browser / system print dialog without extra UI or popups.
     */
    window.printProcessedDocument = async function (source, mimeType = 'application/pdf', title = 'Document') {
        if (!source) {
            console.warn('printProcessedDocument called with empty source');
            return;
        }

        if (isPrintingActive) return;
        isPrintingActive = true;

        const sourceUrl = getSourceUrl(source, mimeType);
        const isPdf = (mimeType && mimeType.includes('pdf')) ||
                      (source instanceof Blob && source.type.includes('pdf')) ||
                      (typeof sourceUrl === 'string' && (sourceUrl.includes('.pdf') || sourceUrl.startsWith('blob:') || sourceUrl.includes('application/pdf')));

        try {
            if (isPdf && sourceUrl) {
                // Method 1: Hidden iframe pointing directly to the PDF Blob URL
                // This triggers the browser's built-in PDF viewer direct print system dialog
                const iframe = createHiddenPrintIframe();
                let triggered = false;

                const doPrint = () => {
                    if (triggered) return;
                    triggered = true;
                    try {
                        iframe.contentWindow.focus();
                        iframe.contentWindow.print();
                    } catch (err) {
                        console.warn('Direct PDF iframe print fallback:', err);
                        // Method 2: Direct window print fallback
                        window.focus();
                        window.print();
                    } finally {
                        setTimeout(() => {
                            isPrintingActive = false;
                        }, 1000);
                    }
                };

                iframe.onload = () => {
                    setTimeout(doPrint, 200);
                };

                iframe.src = sourceUrl;

                // Safety timeout in case onload doesn't fire immediately
                setTimeout(() => {
                    if (!triggered) doPrint();
                }, 800);

            } else if (sourceUrl) {
                // Direct Image Print (e.g. PAN Card / Cropped Image)
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
                                @page { size: auto; margin: 0; }
                                html, body { margin: 0; padding: 0; background: #fff; width: 100%; }
                                img { width: 100%; max-width: 100%; height: auto; display: block; margin: 0 auto; page-break-after: avoid; }
                            </style>
                        </head>
                        <body>
                            <img src="${sourceUrl}" alt="Print Document" />
                            <script>
                                window.onload = function() {
                                    setTimeout(function() {
                                        window.focus();
                                        window.print();
                                    }, 100);
                                };
                            </script>
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
                    }, 400);
                } else {
                    ensurePrintStyles();
                    const area = getOrCreatePrintArea();
                    area.innerHTML = `<img src="${sourceUrl}" alt="Print Document" />`;
                    window.focus();
                    window.print();
                    isPrintingActive = false;
                }
            }
        } catch (err) {
            console.error('Direct print failed:', err);
            isPrintingActive = false;
        }
    };

    /**
     * Binds a print trigger button to execute system print directly.
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
