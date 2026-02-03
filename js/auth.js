(function initAuth() {
    const session = localStorage.getItem("sessao_ativa");
    const path = window.location.pathname;
    const isLoginPage = path.includes("login.html");
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isLocal) return;

    if (!session && !isLoginPage) {
        sessionStorage.setItem("redirect_target", window.location.href);
        window.location.href = "/login.html";
    }
})();

async function tentarLogin(password) {
    const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    
    if (isLocal) {
        localStorage.setItem("sessao_ativa", "true");
        window.location.href = "/index.html"; 
        return true;
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ senha: password })
        });

        if (!response.ok && response.status !== 401) {
            return false;
        }

        const data = await response.json();

        if (data.autorizado) {
            localStorage.setItem("sessao_ativa", "true");
            const target = sessionStorage.getItem("redirect_target") || "/index.html";
            window.location.href = target;
            return true;
        }
        
        return false;

    } catch (err) {
        console.error("Auth Error");
        return false;
    }
}

function logout() {
    localStorage.removeItem("sessao_ativa");
    window.location.href = "/login.html";
}