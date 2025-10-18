document.addEventListener('DOMContentLoaded', () => {
    let apiBaseUrl = '';

    async function loadConfig() {
        try {
            const response = await fetch('/config');
            const config = await response.json();
            apiBaseUrl = config.api_base_url;
        } catch (error) {
            console.error('Error loading config:', error);
            alert('Unable to connect to server. Please try again later.');
        }
    }

    const formContainer = document.querySelector('.form-container');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            formContainer.classList.add('is-flipped');
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            formContainer.classList.remove('is-flipped');
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!apiBaseUrl) {
                await loadConfig();
            }
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            if (password !== confirmPassword) {
                registerMessage.textContent = 'Passwords do not match!';
                registerMessage.style.color = '#ff4d4d';
                return;
            }
            try {
                const response = await fetch(`${apiBaseUrl}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password })
                });
                const data = await response.json();
                registerMessage.textContent = data.message;
                registerMessage.style.color = response.ok ? '#4CAF50' : '#ff4d4d';
                if (response.ok) {
                    registerForm.reset();
                    setTimeout(() => formContainer.classList.remove('is-flipped'), 1000);
                }
            } catch (error) {
                registerMessage.textContent = 'Server connection error!';
                registerMessage.style.color = '#ff4d4d';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!apiBaseUrl) {
                await loadConfig();
            }
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            try {
                const response = await fetch(`${apiBaseUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await response.json();
                loginMessage.textContent = data.message || 'Login successful!';
                loginMessage.style.color = response.ok ? '#4CAF50' : '#ff4d4d';
                if (response.ok && data.token) {
                    localStorage.setItem('token', data.token);
                    loginForm.reset();
                    setTimeout(() => window.location.href = 'dashboard.html', 500);
                }
            } catch (error) {
                loginMessage.textContent = 'Server connection error!';
                loginMessage.style.color = '#ff4d4d';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', loadConfig);
});