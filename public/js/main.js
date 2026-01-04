document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    // Load saved theme or default
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Mobile Menu
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const expanded = navLinks.classList.contains('active');
            navToggle.setAttribute('aria-expanded', expanded);
        });
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // Language Toggle Handling (Save preference)
    // Assumes buttons link to the other language version directly,
    // but we intercept to save preference.
    const langSwitchers = document.querySelectorAll('.lang-switch');
    langSwitchers.forEach(link => {
        link.addEventListener('click', (e) => {
            // Determine target language from URL structure
            // e.g., /ar/ -> /en/ means target is en
            const href = link.getAttribute('href');
            if (href.includes('/ar/')) {
                localStorage.setItem('lang-preference', 'ar');
            } else if (href.includes('/en/')) {
                localStorage.setItem('lang-preference', 'en');
            }
        });
    });
});
