// Проверка авторизации пользователя
function checkAuth() {
    const currentUser = sessionStorage.getItem('currentUser');
    return currentUser !== null;
}

// Получение данных текущего пользователя
function getCurrentUser() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        return JSON.parse(currentUser);
    }
    return null;
}

// Выход из аккаунта
function logout() {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('rememberedUser');
    window.location.href = 'auth.html';
}

// Проверка авторизации при загрузке страницы профиля
window.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    
    // Если открыта страница профиля, проверяем авторизацию
    if (fileName === 'profile.html' || fileName === 'profile') {
        if (!checkAuth()) {
            window.location.href = 'auth.html';
        }
    }
    
    // Если открыта страница авторизации и пользователь уже авторизован, перенаправляем на профиль
    if (fileName === 'auth.html' || fileName === 'auth') {
        if (checkAuth()) {
            window.location.href = 'profile.html';
        }
    }
});

