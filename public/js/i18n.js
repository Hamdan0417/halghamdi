// Language redirection logic
(function() {
    const savedLang = localStorage.getItem('lang-preference');
    const path = window.location.pathname;

    // Only redirect if at root
    if (path === '/' || path === '/index.html') {
        if (savedLang === 'ar') {
            window.location.replace('/ar/');
        } else if (savedLang === 'en') {
            window.location.replace('/en/');
        } else {
            // Detect browser language
            const browserLang = navigator.language || navigator.userLanguage;
            if (browserLang.startsWith('ar')) {
                window.location.replace('/ar/');
            } else {
                window.location.replace('/en/');
            }
        }
    }
})();
