// Обработка формы входа
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const notification = document.getElementById('notification');

    // Функция показа уведомлений
    function showNotification(message, type = 'success') {
        if (!notification) {
            console.error('Элемент уведомления не найден');
            alert(message);
            return;
        }
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Обработка формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('loginPhone').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            // Получаем зарегистрированных пользователей из localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Ищем пользователя по телефону и паролю
            const user = users.find(u => u.phone === phone && u.password === password);
            
            if (user) {
                // Сохраняем все данные пользователя (кроме пароля)
                const { password: _, ...userData } = user;
                
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
                
                // Если выбрано "Запомнить меня", сохраняем в localStorage
                if (rememberMe) {
                    localStorage.setItem('rememberedUser', JSON.stringify(userData));
                }
                
                showNotification('Вход выполнен успешно!', 'success');
                
                // Перенаправление на профиль через небольшую задержку
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 500);
            } else {
                showNotification('Неверный номер телефона или пароль', 'error');
            }
        });
    }

    // Обработка формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const phone = document.getElementById('registerPhone').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const name = document.getElementById('registerName').value.trim();
            const city = document.getElementById('registerCity').value.trim();
            const birthday = document.getElementById('registerBirthday').value;
            const password = document.getElementById('registerPassword').value;
            const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
            const dataConsent = document.getElementById('dataConsent').checked;
            
            // Проверка заполнения обязательных полей
            if (!phone || !email || !name || !city || !birthday || !password || !passwordConfirm) {
                showNotification('Пожалуйста, заполните все поля', 'error');
                return;
            }
            
            // Проверка согласия на обработку данных
            if (!dataConsent) {
                showNotification('Необходимо согласие на обработку персональных данных', 'error');
                return;
            }
            
            // Проверка совпадения паролей
            if (password !== passwordConfirm) {
                showNotification('Пароли не совпадают', 'error');
                return;
            }
            
            // Проверка минимальной длины пароля
            if (password.length < 6) {
                showNotification('Пароль должен содержать минимум 6 символов', 'error');
                return;
            }
            
            // Получаем существующих пользователей
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Проверяем, не зарегистрирован ли уже пользователь с таким телефоном
            if (users.find(u => u.phone === phone)) {
                showNotification('Пользователь с таким номером телефона уже зарегистрирован', 'error');
                return;
            }
            
            // Создаем нового пользователя
            const newUser = {
                phone: phone,
                email: email,
                name: name,
                city: city,
                birthday: birthday,
                password: password
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Автоматически входим после регистрации
            const { password: _, ...userData } = newUser;
            
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            
            showNotification('Регистрация прошла успешно!', 'success');
            
            // Перенаправление на профиль
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 500);
        });
    }

    // Переключение между вкладками - МАКСИМАЛЬНО ПРОСТОЙ И НАДЕЖНЫЙ СПОСОБ
    setTimeout(function() {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginFormDiv = document.getElementById('loginForm');
        const registerFormDiv = document.getElementById('registerForm');
        
        console.log('Проверка элементов:', {
            loginTab: !!loginTab,
            registerTab: !!registerTab,
            loginFormDiv: !!loginFormDiv,
            registerFormDiv: !!registerFormDiv
        });
        
        if (!loginTab || !registerTab || !loginFormDiv || !registerFormDiv) {
            console.error('ОШИБКА: Не все элементы найдены!');
            return;
        }
        
        // Функция переключения
        function switchToLogin() {
            console.log('Переключение на ВХОД');
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginFormDiv.classList.add('active');
            registerFormDiv.classList.remove('active');
        }
        
        function switchToRegister() {
            console.log('Переключение на РЕГИСТРАЦИЮ');
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerFormDiv.classList.add('active');
            loginFormDiv.classList.remove('active');
        }
        
        // Добавляем обработчики МНОЖЕСТВЕННЫМИ способами для надежности
        loginTab.onclick = switchToLogin;
        registerTab.onclick = switchToRegister;
        
        loginTab.addEventListener('click', switchToLogin, false);
        registerTab.addEventListener('click', switchToRegister, false);
        
        loginTab.addEventListener('mousedown', function(e) {
            e.preventDefault();
            switchToLogin();
        }, false);
        
        registerTab.addEventListener('mousedown', function(e) {
            e.preventDefault();
            switchToRegister();
        }, false);
        
        // Делегирование на контейнере
        const tabsContainer = document.getElementById('authTabsContainer');
        if (tabsContainer) {
            tabsContainer.addEventListener('click', function(e) {
                const target = e.target;
                if (target.id === 'loginTab' || target.closest('#loginTab')) {
                    e.preventDefault();
                    switchToLogin();
                } else if (target.id === 'registerTab' || target.closest('#registerTab')) {
                    e.preventDefault();
                    switchToRegister();
                }
            }, false);
        }
        
        console.log('✅ Переключение вкладок настроено! Попробуйте кликнуть на вкладки.');
    }, 100);

    // Проверка, есть ли сохраненный пользователь (для "Запомнить меня")
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        try {
            const userData = JSON.parse(rememberedUser);
            // Загружаем полные данные пользователя из массива users
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const fullUserData = users.find(u => u.phone === userData.phone);
            
            if (fullUserData) {
                const { password: _, ...userDataWithoutPassword } = fullUserData;
                sessionStorage.setItem('currentUser', JSON.stringify(userDataWithoutPassword));
            } else {
                sessionStorage.setItem('currentUser', rememberedUser);
            }
        } catch (e) {
            console.error('Ошибка при загрузке сохраненного пользователя:', e);
        }
    }
});
