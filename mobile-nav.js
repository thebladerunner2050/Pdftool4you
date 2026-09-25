/**
 * mobile-nav.js — Responsive Mobile & Tablet Experience Controller
 * Powers the Mobile Bottom Navigation Dock, Slide-Over Drawer, Hamburger Menu,
 * Touch Gestures, Safe Area Handling, and Scroll-To-Top across all devices.
 */

(function () {
    'use strict';

    // Inject mobile.css if not present
    function ensureMobileStylesheet() {
        if (!document.querySelector('link[href*="mobile.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'mobile.css';
            document.head.appendChild(link);
        }

        // Ensure viewport meta has viewport-fit=cover
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
            let content = viewportMeta.getAttribute('content') || '';
            if (!content.includes('viewport-fit=cover')) {
                viewportMeta.setAttribute('content', content + ', viewport-fit=cover');
            }
        } else {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            viewportMeta.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
            document.head.appendChild(viewportMeta);
        }
    }

    ensureMobileStylesheet();

    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page === '' ? 'index.html' : page;
    }

    // Initialize UI components after DOM is ready
    function initMobileNav() {
        const currentPage = getCurrentPage();

        // 1. Inject / Attach Mobile Hamburger Menu Button to the LEFT of the Logo in Header
        injectHeaderMobileButton();

        // 2. Inject Mobile Slide-Over Drawer (slides smoothly from the LEFT)
        injectSlideOverDrawer(currentPage);

        // 3. Inject Floating Scroll-To-Top Button
        injectScrollToTop();

        // 4. Touch Drop Zone enhancements
        enhanceTouchDropZones();

        // 5. Sync drawer theme & language with active app managers
        syncDrawerSettings();
    }

    function injectHeaderMobileButton() {
        const header = document.querySelector('header');
        if (!header) return;

        // Find the logo link
        const logoLink = header.querySelector('a[href="index.html"]') || header.querySelector('a.group') || header.querySelector('a');

        // Ensure logo has header-logo-responsive class and parent has relative
        if (logoLink) {
            if (!logoLink.classList.contains('header-logo-responsive')) {
                logoLink.classList.add('header-logo-responsive');
            }
            if (logoLink.parentElement && !logoLink.parentElement.classList.contains('relative')) {
                logoLink.parentElement.classList.add('relative');
            }
        }

        // If trigger already present in header, ensure listeners are bound
        const existingTriggers = header.querySelectorAll('[data-mobile-drawer-trigger]');
        if (existingTriggers.length > 0) {
            existingTriggers.forEach(btn => {
                btn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDrawer();
                };
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDrawer();
                });
            });
            return;
        }

        // Insert the three-line button to its LEFT if missing
        if (!logoLink) return;

        const mobileBtn = document.createElement('button');
        mobileBtn.type = 'button';
        mobileBtn.setAttribute('data-mobile-drawer-trigger', '');
        mobileBtn.setAttribute('aria-label', 'Open navigation menu');
        mobileBtn.className = 'lg:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-all shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 mr-2 sm:mr-2.5 shrink-0';
        mobileBtn.innerHTML = `
            <svg class="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        `;

        mobileBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
        };
        mobileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
        });

        // Insert directly to the LEFT of the logo!
        logoLink.parentNode.insertBefore(mobileBtn, logoLink);
    }

    function injectBottomDock(currentPage) {
        // Kept empty to prevent bottom overlay blocking action buttons on mobile screens
    }

    function injectSlideOverDrawer(currentPage) {
        if (document.getElementById('mobile-drawer-container')) return;

        const drawerContainer = document.createElement('div');
        drawerContainer.id = 'mobile-drawer-container';
        drawerContainer.className = 'fixed inset-0 z-50 pointer-events-none';

        drawerContainer.innerHTML = `
            <!-- Backdrop Overlay -->
            <div id="mobile-drawer-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs opacity-0 transition-opacity duration-300 ease-out pointer-events-none"></div>

            <!-- Slide-Over Drawer Panel (slides smoothly from the LEFT) -->
            <aside id="mobile-drawer-panel" class="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white dark:bg-zinc-950 shadow-2xl flex flex-col transform -translate-x-full transition-transform duration-300 ease-out z-50 pointer-events-auto border-r border-zinc-200 dark:border-zinc-800">
                
                <!-- Drawer Header -->
                <div class="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                    <a href="index.html" class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm shadow-sm">
                            <svg class="w-4 h-4 text-white dark:text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                            </svg>
                        </div>
                        <span class="font-bold text-base text-zinc-900 dark:text-white tracking-tight">PDFTool<span class="text-blue-600 dark:text-blue-400">4You</span></span>
                    </a>

                    <button type="button" id="mobile-drawer-close" aria-label="Close menu" class="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <!-- Scrollable Drawer Body -->
                <div class="flex-1 overflow-y-auto p-5 space-y-6 touch-scroll no-scrollbar">

                    <!-- Quick Settings (Appearance & Language) -->
                    <div class="p-3.5 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                        <!-- Appearance Mode -->
                        <div>
                            <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center justify-between">
                                <span>Appearance</span>
                                <span class="text-[10px] text-zinc-500 font-normal">Theme</span>
                            </div>
                            <div class="grid grid-cols-3 gap-1 bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
                                <button type="button" data-drawer-theme="system" class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1">
                                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                    <span>Auto</span>
                                </button>
                                <button type="button" data-drawer-theme="light" class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                    <span>Light</span>
                                </button>
                                <button type="button" data-drawer-theme="dark" class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-1">
                                    <svg class="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
                                    <span>Dark</span>
                                </button>
                            </div>
                        </div>

                        <!-- Language Selector -->
                        <div class="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center justify-between">
                                <span>Language / भाषा</span>
                            </div>
                            <div class="grid grid-cols-2 gap-1.5 bg-zinc-200/70 dark:bg-zinc-800/80 p-1 rounded-xl text-xs">
                                <button type="button" data-drawer-lang="en" class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center">
                                    English
                                </button>
                                <button type="button" data-drawer-lang="hi" class="py-1.5 px-2 rounded-lg font-semibold transition-all text-center">
                                    हिन्दी (Hindi)
                                </button>
                            </div>
                        </div>

                        <!-- Quick Share Button -->
                        <div class="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                            <button type="button" id="drawer-share-trigger" class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 active:scale-95 transition-all shadow-2xs">
                                <svg class="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
                                </svg>
                                <span>Share PDFTool4You</span>
                            </button>
                        </div>
                    </div>

                    <!-- PDF Document Tools List -->
                    <div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                            </svg>
                            <span>PDF Tools</span>
                        </div>

                        <div class="space-y-1">
                            <a href="rotate-pdf.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'rotate-pdf.html' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Rotate PDF</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Turn individual/all pages</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="pdf-crop.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'pdf-crop.html' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 0L4 4m5.121 5.121L4 19"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Crop PDF</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Trim margins & bounds</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="pdf-compressor.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'pdf-compressor.html' ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">PDF Compressor</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Target KB/MB size</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="merge-pdf.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'merge-pdf.html' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Merge PDF</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Combine multi-files</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="split-pdf.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'split-pdf.html' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Split PDF</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Extract pages & ranges</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="pdf-watermarker.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'pdf-watermarker.html' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">PDF Watermarker</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Text & Logo stamps</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="remove-pdf-password.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'remove-pdf-password.html' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Password Remover</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Decrypt & unlock PDF</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="pdf-to-img.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'pdf-to-img.html' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">PDF to Image</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">JPG, PNG, WebP 300 DPI</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    </div>

                    <!-- Image Tools List -->
                    <div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>Image Tools</span>
                        </div>

                        <div class="space-y-1">
                            <a href="webp-to-jpg.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'webp-to-jpg.html' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <span class="text-[10px] font-bold">WEBP</span>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">WebP to JPG</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Universal JPG output</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="image-to-pdf.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'image-to-pdf.html' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">Image to PDF</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">JPG/PNG to document</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="png-to-jpg.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'png-to-jpg.html' ? 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                                        <span class="text-[10px] font-bold">JPG</span>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">PNG to JPG</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">High quality compression</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="jpg-to-png.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'jpg-to-png.html' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <span class="text-[10px] font-bold">PNG</span>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">JPG to PNG</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">Lossless conversion</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>

                            <a href="pan-card-photo-maker.html" class="flex items-center justify-between p-2.5 rounded-xl ${currentPage === 'pan-card-photo-maker.html' ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200'} transition-all active:scale-[0.98]">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    </div>
                                    <div>
                                        <p class="text-xs font-bold leading-tight">PAN Card Photo Maker</p>
                                        <p class="text-[10px] text-zinc-400 leading-tight">NSDL & UTIITSL resizer</p>
                                    </div>
                                </div>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    </div>

                    <!-- Educational Guides & Blog Articles -->
                    <div>
                        <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2 flex items-center justify-between">
                            <span class="flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                                </svg>
                                <span>Guides & Blog</span>
                            </span>
                            <a href="blog.html" class="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">View All</a>
                        </div>

                        <div class="space-y-1 text-xs">
                            <a href="how-to-compress-pdf.html" class="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <span>Compress PDF to 200KB Guide</span>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                            <a href="pan-card-photo-resizer-guide.html" class="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <span>PAN Photo & Signature Guide</span>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                            <a href="how-to-watermark-pdf.html" class="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <span>Watermark PDF Tutorial</span>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                            <a href="how-to-remove-pdf-password.html" class="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <span>Unlock PDF Password Guide</span>
                                <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                            </a>
                        </div>
                    </div>

                    <!-- Company & Legal Pages -->
                    <div class="pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">Company & Legal</div>
                        <div class="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            <a href="blog.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold text-blue-600 dark:text-blue-400">Blog Hub</a>
                            <a href="about-us.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">About Us</a>
                            <a href="contact-us.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Contact</a>
                            <a href="privacy-policy.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Privacy Policy</a>
                            <a href="terms-and-conditions.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Terms of Use</a>
                            <a href="disclaimer.html" class="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Disclaimer</a>
                        </div>
                    </div>

                    <!-- Privacy Trust Badge -->
                    <div class="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/60 rounded-xl text-center">
                        <p class="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1.5 mb-0.5">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span>100% In-Browser Privacy</span>
                        </p>
                        <p class="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Your files never touch a remote server</p>
                    </div>

                </div>

            </aside>
        `;

        document.body.appendChild(drawerContainer);

        // Bind Drawer Close Events
        const backdrop = drawerContainer.querySelector('#mobile-drawer-backdrop');
        const closeBtn = drawerContainer.querySelector('#mobile-drawer-close');

        if (backdrop) backdrop.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeDrawer();
        });

        // Theme buttons in drawer
        drawerContainer.querySelectorAll('[data-drawer-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTheme = btn.getAttribute('data-drawer-theme');
                if (window.ThemeManager) {
                    window.ThemeManager.setTheme(targetTheme);
                }
                syncDrawerSettings();
            });
        });

        // Language buttons in drawer
        drawerContainer.querySelectorAll('[data-drawer-lang]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetLang = btn.getAttribute('data-drawer-lang');
                if (window.I18nManager) {
                    window.I18nManager.setLang(targetLang);
                }
                syncDrawerSettings();
            });
        });

        // Share button in drawer
        const shareBtn = drawerContainer.querySelector('#drawer-share-trigger');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                if (window.ShareManager) {
                    window.ShareManager.share();
                } else if (navigator.share) {
                    navigator.share({
                        title: document.title,
                        url: window.location.href
                    }).catch(() => {});
                }
            });
        }
    }

    function openDrawer() {
        let container = document.getElementById('mobile-drawer-container');
        if (!container) {
            injectSlideOverDrawer(getCurrentPage());
            container = document.getElementById('mobile-drawer-container');
        }
        if (!container) return;

        try {
            syncDrawerSettings();
        } catch (err) {
            console.warn('Sync drawer error:', err);
        }

        container.style.display = 'block';
        container.style.pointerEvents = 'auto';
        void container.offsetWidth; // Force browser layout recalculation
        container.classList.add('is-open');

        const backdrop = document.getElementById('mobile-drawer-backdrop');
        const panel = document.getElementById('mobile-drawer-panel');

        if (backdrop) {
            backdrop.style.opacity = '1';
            backdrop.style.pointerEvents = 'auto';
        }
        if (panel) {
            panel.style.visibility = 'visible';
            panel.style.transform = 'translateX(0)';
        }

        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        const container = document.getElementById('mobile-drawer-container');
        if (!container) return;

        container.classList.remove('is-open');

        const backdrop = document.getElementById('mobile-drawer-backdrop');
        const panel = document.getElementById('mobile-drawer-panel');

        if (backdrop) {
            backdrop.style.opacity = '0';
            backdrop.style.pointerEvents = 'none';
        }
        if (panel) {
            panel.style.transform = 'translateX(-100%)';
        }

        setTimeout(() => {
            if (!container.classList.contains('is-open')) {
                container.style.display = 'none';
                container.style.pointerEvents = 'none';
                if (panel) panel.style.visibility = 'hidden';
                document.body.style.overflow = '';
            }
        }, 320);
    }

    function syncDrawerSettings() {
        // Theme sync
        const currentTheme = window.ThemeManager ? window.ThemeManager.getTheme() : (localStorage.getItem('theme') || 'system');
        document.querySelectorAll('[data-drawer-theme]').forEach(btn => {
            const val = btn.getAttribute('data-drawer-theme');
            if (val === currentTheme) {
                btn.className = 'py-1.5 px-2 rounded-lg font-bold bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs text-center flex items-center justify-center gap-1';
            } else {
                btn.className = 'py-1.5 px-2 rounded-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all text-center flex items-center justify-center gap-1';
            }
        });

        // Language sync
        const currentLang = window.I18nManager ? window.I18nManager.getLang() : (localStorage.getItem('pdf_lang') || 'en');
        document.querySelectorAll('[data-drawer-lang]').forEach(btn => {
            const val = btn.getAttribute('data-drawer-lang');
            if (val === currentLang) {
                btn.className = 'py-1.5 px-2 rounded-lg font-bold bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs text-center';
            } else {
                btn.className = 'py-1.5 px-2 rounded-lg font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all text-center';
            }
        });
    }

    function injectScrollToTop() {
        if (document.getElementById('floating-scroll-top')) return;

        const btn = document.createElement('button');
        btn.id = 'floating-scroll-top';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Scroll to top');
        btn.className = 'fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-30 w-10 h-10 rounded-full bg-zinc-900/90 text-white dark:bg-white/90 dark:text-zinc-900 shadow-xl flex items-center justify-center opacity-0 pointer-events-none translate-y-4 transition-all duration-300 hover:scale-105 active:scale-95 border border-zinc-700 dark:border-zinc-300';
        btn.innerHTML = `
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
            </svg>
        `;

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(btn);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 280) {
                btn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
                btn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
            } else {
                btn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
                btn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
            }
        }, { passive: true });
    }

    function enhanceTouchDropZones() {
        const dropZones = document.querySelectorAll('#drop-zone, .drop-zone');
        dropZones.forEach(zone => {
            // Touch active feedback
            zone.addEventListener('touchstart', () => {
                zone.classList.add('drop-zone-touch-active');
            }, { passive: true });

            zone.addEventListener('touchend', () => {
                setTimeout(() => zone.classList.remove('drop-zone-touch-active'), 200);
            }, { passive: true });

            zone.addEventListener('touchcancel', () => {
                zone.classList.remove('drop-zone-touch-active');
            }, { passive: true });
        });
    }

    // Global Smart Back Navigation Handler
    // When users click the back button in header, return to the exact page they opened it from
    document.addEventListener('click', function (e) {
        const backBtn = e.target.closest('.back-btn-responsive, a[aria-label="Back"], a[aria-label="Back to Tools"], a[data-action="back"]');
        if (!backBtn) return;

        const referrer = document.referrer;
        const currentUrl = window.location.href;
        const origin = window.location.origin;

        // Check if the user came from a page on the same domain and it's not the exact current URL
        const isSameDomainReferrer = referrer && (
            referrer.startsWith(origin) || 
            referrer.startsWith(window.location.protocol + '//' + window.location.host)
        );

        if (isSameDomainReferrer && referrer !== currentUrl) {
            e.preventDefault();
            e.stopPropagation();
            window.history.back();
        } else if (window.history.length > 1 && isSameDomainReferrer) {
            e.preventDefault();
            e.stopPropagation();
            window.history.back();
        }
        // Otherwise, fallback to the default link href
    }, true);

    // Expose Global Helper & Functions
    window.openMobileDrawer = openDrawer;
    window.closeMobileDrawer = closeDrawer;
    window.MobileNav = {
        open: openDrawer,
        close: closeDrawer,
        sync: syncDrawerSettings
    };

    // Global capture-phase event listener for all hamburger drawer triggers and close buttons
    document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-mobile-drawer-trigger]');
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();
            openDrawer();
            return;
        }

        const closeBtn = e.target.closest('#mobile-drawer-close, [data-mobile-drawer-close]');
        if (closeBtn) {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
            return;
        }

        if (e.target && e.target.id === 'mobile-drawer-backdrop') {
            e.preventDefault();
            e.stopPropagation();
            closeDrawer();
            return;
        }
    }, true);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }
})();
