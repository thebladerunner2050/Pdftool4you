/**
 * share.js — Share Controller for PDFTool4You (.in)
 * Allows users to quickly copy the site or tool URL to clipboard
 * or share directly via Web Share API, WhatsApp, X (Twitter), LinkedIn, and Email.
 */

(function () {
    'use strict';

    // Clipboard Copy Helper with resilient fallback
    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (err) {
                // Fallback below
            }
        }

        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-999999px';
            textarea.style.top = '-999999px';
            textarea.setAttribute('readonly', '');
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            console.error('Clipboard copy failed:', err);
            return false;
        }
    }

    // Modern floating toast notification
    function showToast(message, isError = false) {
        let toast = document.getElementById('share-global-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'share-global-toast';
            toast.className = 'fixed bottom-5 right-5 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-2xl text-xs font-semibold transform transition-all duration-300 translate-y-10 opacity-0 pointer-events-none border border-zinc-800 dark:border-zinc-200';
            toast.innerHTML = `
                <div class="toast-icon-wrap shrink-0">
                    <svg class="toast-icon-success w-4 h-4 text-emerald-400 dark:text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    <svg class="toast-icon-error hidden w-4 h-4 text-rose-400 dark:text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </div>
                <span class="toast-message"></span>
            `;
            document.body.appendChild(toast);
        }

        const msgSpan = toast.querySelector('.toast-message');
        const iconSuccess = toast.querySelector('.toast-icon-success');
        const iconError = toast.querySelector('.toast-icon-error');

        if (msgSpan) msgSpan.textContent = message;
        if (iconSuccess && iconError) {
            if (isError) {
                iconSuccess.classList.add('hidden');
                iconError.classList.remove('hidden');
            } else {
                iconSuccess.classList.remove('hidden');
                iconError.classList.add('hidden');
            }
        }

        toast.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
        toast.classList.add('translate-y-0', 'opacity-100');

        if (window._shareToastTimer) clearTimeout(window._shareToastTimer);
        window._shareToastTimer = setTimeout(() => {
            toast.classList.remove('translate-y-0', 'opacity-100');
            toast.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
        }, 2600);
    }

    // Get current shareable URL & title
    function getShareData() {
        let url = window.location.href;
        // In local file testing, fallback to clean domain
        if (window.location.protocol === 'file:') {
            url = 'https://pdftool4you.in';
        }
        
        let title = document.title || 'PDFTool4You — Free On-Device PDF & Image Tools';
        // Clean up title for concise sharing
        if (title.includes('—')) {
            title = title.split('—')[0].trim() + ' | PDFTool4You';
        }

        const text = 'Process PDF & images 100% privately on your device with PDFTool4You. Zero server uploads!';
        return { url, title, text };
    }

    // Trigger visual "Copied!" feedback on buttons
    function setButtonCopiedState(container) {
        if (!container) return;
        const defaultIcon = container.querySelector('.share-icon-default');
        const copiedIcon = container.querySelector('.share-icon-copied');
        const label = container.querySelector('.share-btn-text');
        const copiedBadge = container.querySelector('.share-copied-badge');

        const originalText = label ? label.textContent : '';
        const copiedText = (window.I18nManager && window.I18nManager.t) 
            ? window.I18nManager.t('share_copied') 
            : 'Copied!';

        if (defaultIcon) defaultIcon.classList.add('hidden');
        if (copiedIcon) copiedIcon.classList.remove('hidden');
        if (label) {
            label.textContent = copiedText;
            label.classList.add('text-emerald-600', 'dark:text-emerald-400');
        }
        if (copiedBadge) copiedBadge.classList.remove('hidden');

        setTimeout(() => {
            if (defaultIcon) defaultIcon.classList.remove('hidden');
            if (copiedIcon) copiedIcon.classList.add('hidden');
            if (label) {
                label.textContent = originalText;
                label.classList.remove('text-emerald-600', 'dark:text-emerald-400');
            }
            if (copiedBadge) copiedBadge.classList.add('hidden');
        }, 2200);
    }

    // Execute direct Copy Link action
    async function executeCopy(container) {
        const { url } = getShareData();
        const success = await copyTextToClipboard(url);
        
        const successMsg = (window.I18nManager && window.I18nManager.t)
            ? window.I18nManager.t('share_toast_copied')
            : 'Link copied to clipboard!';
            
        const errorMsg = (window.I18nManager && window.I18nManager.t)
            ? window.I18nManager.t('share_toast_error')
            : 'Could not copy link to clipboard.';

        if (success) {
            setButtonCopiedState(container);
            showToast(successMsg, false);
        } else {
            showToast(errorMsg, true);
        }
    }

    // Execute Native Share action
    async function executeNativeShare(container) {
        const { url, title, text } = getShareData();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: text,
                    url: url
                });
            } catch (err) {
                // Ignore AbortError when user dismisses native sheet
                if (err.name !== 'AbortError') {
                    console.warn('Native share failed, falling back to copy:', err);
                    executeCopy(container);
                }
            }
        } else {
            // Fallback directly to clipboard copy if Web Share API isn't supported
            executeCopy(container);
        }
    }

    // Initialize Share Menus and Controls
    function initShareDOM() {
        const containers = document.querySelectorAll('[data-share-container]');
        if (!containers.length) return;

        const { url, title, text } = getShareData();

        containers.forEach(container => {
            const trigger = container.querySelector('[data-share-trigger]');
            const menu = container.querySelector('[data-share-menu]');
            const urlPreviewInput = container.querySelector('[data-share-url-input]');
            const urlPreviewText = container.querySelector('[data-share-url-preview]');
            const copyBtns = container.querySelectorAll('[data-share-action="copy"]');
            const nativeBtns = container.querySelectorAll('[data-share-action="native"]');
            const waLinks = container.querySelectorAll('[data-share-action="whatsapp"]');
            const twitterLinks = container.querySelectorAll('[data-share-action="twitter"]');
            const linkedinLinks = container.querySelectorAll('[data-share-action="linkedin"]');
            const emailLinks = container.querySelectorAll('[data-share-action="email"]');

            // Update URL preview text/input
            if (urlPreviewInput) urlPreviewInput.value = url;
            if (urlPreviewText) urlPreviewText.textContent = url;

            // Update Social Share links dynamically
            const encodedUrl = encodeURIComponent(url);
            const encodedTitle = encodeURIComponent(title);
            const encodedText = encodeURIComponent(text + ' ' + url);

            waLinks.forEach(link => {
                link.href = `https://api.whatsapp.com/send?text=${encodedText}`;
            });

            twitterLinks.forEach(link => {
                link.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
            });

            linkedinLinks.forEach(link => {
                link.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            });

            emailLinks.forEach(link => {
                link.href = `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(text + '\n\n' + url)}`;
            });

            // Adjust native button visibility/label based on browser capability
            nativeBtns.forEach(btn => {
                if (!navigator.share) {
                    // Hide device share option if browser has no native share sheet
                    btn.classList.add('hidden');
                }
            });

            // Toggle Dropdown Menu
            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isHidden = menu.classList.contains('hidden');

                    // Close any other open menus (e.g. language or theme)
                    document.querySelectorAll('[data-lang-menu], [data-theme-menu], [data-share-menu]').forEach(m => {
                        if (m !== menu) m.classList.add('hidden');
                    });

                    if (isHidden) {
                        menu.classList.remove('hidden');
                        if (urlPreviewInput) {
                            setTimeout(() => {
                                urlPreviewInput.focus();
                                urlPreviewInput.select();
                            }, 50);
                        }
                    } else {
                        menu.classList.add('hidden');
                    }
                });

                // Copy buttons inside menu
                copyBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        executeCopy(container);
                    });
                });

                // Native share button
                nativeBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        executeNativeShare(container);
                        menu.classList.add('hidden');
                    });
                });

                // Auto-select text when clicking input
                if (urlPreviewInput) {
                    urlPreviewInput.addEventListener('click', (e) => {
                        e.stopPropagation();
                        urlPreviewInput.select();
                    });
                }
            }
        });

        // Close on outside click
        document.addEventListener('click', () => {
            document.querySelectorAll('[data-share-menu]').forEach(m => m.classList.add('hidden'));
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('[data-share-menu]').forEach(m => m.classList.add('hidden'));
            }
        });
    }

    // Expose global controller
    window.ShareManager = {
        copy: function (text) {
            return executeCopy(document.querySelector('[data-share-container]'));
        },
        share: function () {
            return executeNativeShare(document.querySelector('[data-share-container]'));
        },
        toast: showToast,
        init: initShareDOM
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShareDOM);
    } else {
        initShareDOM();
    }
})();
