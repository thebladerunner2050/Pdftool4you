/**
 * theme.js — System-default Light/Dark mode controller for PDFTool4You
 * Supports 'system', 'light', and 'dark' preferences with real-time OS preference detection.
 */

(function () {
    // 1. Immediately apply theme before document is rendered to prevent FOUC
    function applyCurrentTheme() {
        const stored = localStorage.getItem('theme') || 'system';
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored === 'dark' || (stored === 'system' && prefersDark);

        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    applyCurrentTheme();

    // 2. React to OS preference changes in real-time when set to 'system'
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', function (e) {
        const stored = localStorage.getItem('theme') || 'system';
        if (stored === 'system') {
            if (e.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            updateThemeUI('system', e.matches);
        }
    });

    // 3. Global Theme Management Functions
    window.ThemeManager = {
        getTheme: function () {
            return localStorage.getItem('theme') || 'system';
        },
        isDarkMode: function () {
            return document.documentElement.classList.contains('dark');
        },
        setTheme: function (theme) {
            if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
                theme = 'system';
            }
            localStorage.setItem('theme', theme);
            
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

            if (isDark) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            updateThemeUI(theme, isDark);
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: theme, isDark: isDark } }));
        },
        toggle: function () {
            // Cycle: system -> light -> dark -> system
            const current = this.getTheme();
            if (current === 'system') {
                this.setTheme('light');
            } else if (current === 'light') {
                this.setTheme('dark');
            } else {
                this.setTheme('system');
            }
        }
    };

    function updateThemeUI(theme, isDark) {
        // Update all toggle buttons on page
        const triggerBtns = document.querySelectorAll('[data-theme-trigger]');
        triggerBtns.forEach(btn => {
            const iconSystem = btn.querySelector('.theme-icon-system');
            const iconLight = btn.querySelector('.theme-icon-light');
            const iconDark = btn.querySelector('.theme-icon-dark');
            const labelEl = btn.querySelector('.theme-label');

            if (iconSystem) iconSystem.classList.toggle('hidden', theme !== 'system');
            if (iconLight) iconLight.classList.toggle('hidden', theme !== 'light');
            if (iconDark) iconDark.classList.toggle('hidden', theme !== 'dark');

            if (labelEl) {
                if (theme === 'system') labelEl.textContent = isDark ? 'System (Dark)' : 'System (Light)';
                else if (theme === 'light') labelEl.textContent = 'Light';
                else labelEl.textContent = 'Dark';
            }
        });

        // Update menu checks and active states
        const options = document.querySelectorAll('[data-theme-value]');
        options.forEach(opt => {
            const val = opt.getAttribute('data-theme-value');
            const isSelected = val === theme;
            opt.setAttribute('aria-selected', isSelected ? 'true' : 'false');
            
            const check = opt.querySelector('.theme-check');
            if (check) {
                check.classList.toggle('opacity-100', isSelected);
                check.classList.toggle('opacity-0', !isSelected);
            }

            if (isSelected) {
                opt.classList.add('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'font-semibold');
                opt.classList.remove('text-zinc-600', 'dark:text-zinc-400');
            } else {
                opt.classList.remove('bg-zinc-100', 'dark:bg-zinc-800', 'text-zinc-900', 'dark:text-white', 'font-semibold');
                opt.classList.add('text-zinc-600', 'dark:text-zinc-400');
            }
        });
    }

    // Initialize UI elements when DOM is ready
    function initThemeDOM() {
        const currentTheme = window.ThemeManager.getTheme();
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = currentTheme === 'dark' || (currentTheme === 'system' && prefersDark);
        updateThemeUI(currentTheme, isDark);

        // Bind dropdown menus
        document.querySelectorAll('[data-theme-menu-container]').forEach(container => {
            const trigger = container.querySelector('[data-theme-trigger]');
            const menu = container.querySelector('[data-theme-menu]');

            if (trigger && menu) {
                trigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isOpen = !menu.classList.contains('hidden');
                    // Close all other menus first
                    document.querySelectorAll('[data-theme-menu]').forEach(m => m.classList.add('hidden'));
                    document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
                    if (!isOpen) {
                        menu.classList.remove('hidden');
                    }
                });

                menu.querySelectorAll('[data-theme-value]').forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const selectedVal = item.getAttribute('data-theme-value');
                        window.ThemeManager.setTheme(selectedVal);
                        menu.classList.add('hidden');
                    });
                });
            }
        });

        // Close dropdowns on outside click or Escape
        document.addEventListener('click', () => {
            document.querySelectorAll('[data-theme-menu]').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('[data-theme-menu]').forEach(m => m.classList.add('hidden'));
                document.querySelectorAll('[data-lang-menu]').forEach(m => m.classList.add('hidden'));
            }
        });
    }

    // Auto-load mobile navigation & responsive controller if not yet present
    if (!document.querySelector('script[src*="mobile-nav.js"]')) {
        const navScript = document.createElement('script');
        navScript.src = 'mobile-nav.js';
        navScript.defer = true;
        document.head.appendChild(navScript);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeDOM);
    } else {
        initThemeDOM();
    }
})();
