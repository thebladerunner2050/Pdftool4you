/**
 * print.js — High-performance, client-side direct printing for PDFTool4You
 * Supports direct in-browser printing for processed PDF documents and converted images.
 * Operates without opening new windows or violating iframe sandbox policies.
 */

(function () {
    let printFrame = null;

    function getOrCreatePrintFrame() {
        if (!printFrame || !document.body.contains(printFrame)) {
            printFrame = document.createElement('iframe');
            printFrame.id = 'pdftool-print-frame';
            printFrame.setAttribute('aria-hidden', 'true');
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = '0';
            printFrame.style.opacity = '0';
            printFrame.style.pointerEvents = 'none';
            document.body.appendChild(printFrame);
        }
        return printFrame;
    }

    /**
     * Prints an image blob or URL directly via an iframe print template.
     */
    function printImage(url, title = 'Document') {
        return new Promise((resolve) => {
            const frame = getOrCreatePrintFrame();
            const frameDoc = frame.contentDocument || frame.contentWindow.document;

            frameDoc.open();
            frameDoc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @page {
            size: auto;
            margin: 8mm;
        }
        * {
            box-sizing: border-box;
        }
        html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        img {
            max-width: 100%;
            max-height: 98vh;
            object-fit: contain;
            display: block;
            margin: auto;
        }
    </style>
</head>
<body>
    <img id="print-img" src="${url}" alt="Print Preview" />
</body>
</html>`);
            frameDoc.close();

            const img = frameDoc.getElementById('print-img');
            const triggerPrint = () => {
                setTimeout(() => {
                    try {
                        frame.contentWindow.focus();
                        frame.contentWindow.print();
                    } catch (e) {
                        console.warn('Frame print notice:', e);
                    }
                    resolve();
                }, 250);
            };

            if (img.complete) {
                triggerPrint();
            } else {
                img.onload = triggerPrint;
                img.onerror = () => {
                    console.error('Failed to load image into print frame');
                    resolve();
                };
            }
        });
    }

    /**
     * Ensures pdfjsLib is loaded for rendering fallback
     */
    async function ensurePdfJs() {
        if (window.pdfjsLib) return window.pdfjsLib;
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'pdf.min.js';
            script.onload = () => resolve(window.pdfjsLib);
            script.onerror = () => {
                const cdnScript = document.createElement('script');
                cdnScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                cdnScript.onload = () => resolve(window.pdfjsLib);
                cdnScript.onerror = () => resolve(null);
                document.head.appendChild(cdnScript);
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Fallback PDF printer using pdf.js to render pages into printable HTML
     * in case the browser blocks direct PDF plugin printing in sandboxed iframes.
     */
    async function printPdfViaRenderer(pdfSource, title = 'PDF Document') {
        const pdfjs = await ensurePdfJs();
        if (!pdfjs) {
            console.warn('PDF renderer library could not be loaded, using standard print');
            window.print();
            return;
        }

        const frame = getOrCreatePrintFrame();
        const frameDoc = frame.contentDocument || frame.contentWindow.document;

        frameDoc.open();
        frameDoc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
        @page {
            size: auto;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            background: #fff;
        }
        .pdf-page {
            display: block;
            width: 100%;
            page-break-after: always;
            break-after: page;
        }
        .pdf-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }
        img {
            width: 100%;
            height: auto;
            display: block;
        }
    </style>
</head>
<body><div id="pages-container"></div></body>
</html>`);
        frameDoc.close();

        const container = frameDoc.getElementById('pages-container');

        try {
            let data;
            if (typeof pdfSource === 'string') {
                const resp = await fetch(pdfSource);
                data = await resp.arrayBuffer();
            } else if (pdfSource instanceof Blob) {
                data = await pdfSource.arrayBuffer();
            } else {
                data = pdfSource;
            }

            const pdf = await window.pdfjsLib.getDocument({ data }).promise;
            const total = pdf.numPages;

            for (let i = 1; i <= total; i++) {
                const page = await pdf.getPage(i);
                // Render at high DPI for crisp print output (1.8 scale)
                const viewport = page.getViewport({ scale: 1.8 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                const ctx = canvas.getContext('2d', { alpha: false });
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                await page.render({ canvasContext: ctx, viewport }).promise;

                const img = document.createElement('img');
                img.className = 'pdf-page';
                img.src = canvas.toDataURL('image/jpeg', 0.95);
                container.appendChild(img);
            }

            setTimeout(() => {
                frame.contentWindow.focus();
                frame.contentWindow.print();
            }, 300);
        } catch (err) {
            console.error('PDF rendering print fallback error:', err);
            // Ultimate fallback to standard print
            window.print();
        }
    }

    /**
     * Primary print entry point for any processed document (PDF or Image).
     * @param {string|Blob} source - The blob URL or Blob object
     * @param {string} mimeType - 'application/pdf', 'image/jpeg', 'image/png'
     * @param {string} [title] - Optional document title for print header
     */
    window.printProcessedDocument = async function (source, mimeType = 'application/pdf', title = 'Document') {
        if (!source) {
            console.warn('printProcessedDocument called with empty source');
            return;
        }

        const isPdf = mimeType.includes('pdf') || (typeof source === 'string' && source.endsWith('.pdf'));

        if (isPdf) {
            let url = typeof source === 'string' ? source : URL.createObjectURL(source);
            const frame = getOrCreatePrintFrame();

            let directPrintSucceeded = false;

            // Attempt direct PDF iframe print
            const tryDirectPrint = new Promise((resolve) => {
                frame.onload = () => {
                    setTimeout(() => {
                        try {
                            frame.contentWindow.focus();
                            frame.contentWindow.print();
                            directPrintSucceeded = true;
                            resolve(true);
                        } catch (e) {
                            console.warn('Direct PDF iframe print blocked or failed, switching to high-res renderer:', e);
                            resolve(false);
                        }
                    }, 400);
                };

                // Guard timeout
                setTimeout(() => {
                    if (!directPrintSucceeded) resolve(false);
                }, 2000);

                frame.src = url;
            });

            const success = await tryDirectPrint;
            if (!success) {
                await printPdfViaRenderer(source, title);
            }
        } else {
            // Images (PNG/JPG)
            const url = typeof source === 'string' ? source : URL.createObjectURL(source);
            await printImage(url, title);
        }
    };

    /**
     * Helper to wire up a print button with loading state feedback
     */
    window.attachPrintAction = function (buttonElement, getSourceCallback, mimeType = 'application/pdf') {
        if (!buttonElement) return;

        buttonElement.addEventListener('click', async (e) => {
            e.preventDefault();
            const source = getSourceCallback();
            if (!source) return;

            const originalHtml = buttonElement.innerHTML;
            buttonElement.disabled = true;
            buttonElement.classList.add('opacity-75', 'cursor-wait');
            
            // Set temporary printing label
            const labelEl = buttonElement.querySelector('.print-btn-label');
            if (labelEl) {
                labelEl.textContent = window.i18n ? window.i18n.t('btn_printing') || 'Preparing...' : 'Preparing...';
            }

            try {
                await window.printProcessedDocument(source, mimeType, document.title || 'Document');
            } catch (err) {
                console.error('Print action error:', err);
            } finally {
                setTimeout(() => {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('opacity-75', 'cursor-wait');
                    buttonElement.innerHTML = originalHtml;
                }, 1000);
            }
        });
    };
})();
