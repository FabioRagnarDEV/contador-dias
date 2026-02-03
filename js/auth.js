(function initAuth() {
    const session = localStorage.getItem("sessao_ativa");
    const path = window.location.pathname;
    const isLoginPage = path.includes("login.html");

    if (!session && !isLoginPage) {
        sessionStorage.setItem("redirect_target", window.location.href);
        
        const base = path.split('/').length > 2 ? "../login.html" : "login.html";
        window.location.href = base.startsWith("..") ? "../login.html" : "/login.html";
    }
})();

async function tentarLogin(password) {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    
    if (isLocal) {
        if (password.length > 0) {
            localStorage.setItem("sessao_ativa", "true");
            const target = sessionStorage.getItem("redirect_target") || "/index.html";
            window.location.href = target;
            return true;
        } else {
            return false;
        }
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: password })
        });

        if (!response.ok) return false;

        const data = await response.json();

        if (data.autorizado) {
            localStorage.setItem("sessao_ativa", "true");
            const target = sessionStorage.getItem("redirect_target") || "/index.html";
            window.location.href = target;
            return true;
        }
        
        return false;

    } catch (err) {
        return false;
    }
}