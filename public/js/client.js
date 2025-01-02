function showToast(message, duration = 5000, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">&times;</button>
    `;
    container.appendChild(toast);
    toast.querySelector('.close-btn').addEventListener('click', () => {
        container.removeChild(toast);
    });
    setTimeout(() => {
        if (container.contains(toast)) {
            container.removeChild(toast);
        }
    }, duration);
}

// Функция для обработки ошибок, переданных через URL-параметры
function handleUrlErrors() {
    const urlParams = new URLSearchParams(window.location.search);
    const errorType = urlParams.get('error');
    
    if (errorType) {
        let message = '';
        let type = 'error';
        
        switch (errorType) {
            case '401':
                message = 'User not logged in';
                type = 'warning';
                break;
            default:
                message = 'Unknown error occurred';
                break;
        }
        
        showToast(message, 5000, type);

        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Проверка существования элемента перед добавлением обработчика
function setupFormHandler(formId, apiUrl, successMessage) {
    const form = document.getElementById(formId);
    
    if (form) {  // Проверяем, существует ли форма
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const formData = {
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                name: document.getElementById('name') ? document.getElementById('name').value : undefined, // Для формы регистрации
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });
            
                const data = await response.json();  
            
                if (!response.ok) {
                    showToast(data.message || 'Request failed', 5000, 'error');
                } else {
                    showToast(successMessage || 'Request successful!', 5000, 'success');
                    setTimeout(() => {
                        window.location.href = data.redirectUrl || '/';  
                    }, 1000);
                }
            } catch (error) {
                showToast('Network error occurred', 5000, 'error');
                console.error('Error:', error);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    handleUrlErrors();
    
    setupFormHandler('signUpForm', '/signup', 'Sign Up successful!');
    
    setupFormHandler('loginForm', '/login', 'Login successful!');
});
