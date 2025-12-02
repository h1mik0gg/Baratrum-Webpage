// Загрузка и отображение данных профиля
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Если пользователь не авторизован, перенаправляем на страницу входа
        window.location.href = 'auth.html';
        return;
    }

    // Инициализация всех разделов
    initPersonalInfo(currentUser);
    initCards();
    initDiscount();
    
    // Обработчики событий
    setupEventListeners();
});

// Инициализация раздела личной информации
function initPersonalInfo(user) {
    // Загружаем сохраненные данные из localStorage (если есть)
    const savedUserData = loadUserDataFromStorage(user.phone);
    
    // Объединяем данные: сначала из localStorage, потом из sessionStorage
    const fullUserData = {
        ...user,
        ...savedUserData
    };
    
    // Обновляем sessionStorage актуальными данными
    sessionStorage.setItem('currentUser', JSON.stringify(fullUserData));
    
    const personalInfo = document.getElementById('personalInfo');
    
    // Форматирование даты рождения
    let formattedBirthday = '';
    if (fullUserData.birthday) {
        formattedBirthday = fullUserData.birthday.split('T')[0];
    }
    
    // Отображение информации
    personalInfo.innerHTML = `
        <div class="profile-field">
            <span class="field-label">ФИО:</span>
            <span class="field-value" id="displayName">${fullUserData.name || 'Не указано'}</span>
        </div>
        <div class="profile-field">
            <span class="field-label">Номер телефона:</span>
            <span class="field-value" id="displayPhone">${fullUserData.phone || 'Не указано'}</span>
        </div>
        <div class="profile-field">
            <span class="field-label">Электронная почта:</span>
            <span class="field-value" id="displayEmail">${fullUserData.email || 'Не указано'}</span>
        </div>
        <div class="profile-field">
            <span class="field-label">Город:</span>
            <span class="field-value" id="displayCity">${fullUserData.city || 'Не указано'}</span>
        </div>
        <div class="profile-field">
            <span class="field-label">Дата рождения:</span>
            <span class="field-value" id="displayBirthday">${formattedBirthday || 'Не указано'}</span>
        </div>
        <div class="profile-field">
            <span class="field-label">Пол:</span>
            <span class="field-value" id="displayGender">${fullUserData.gender || 'Не указано'}</span>
        </div>
    `;
    
    // Форма редактирования
    const editForm = document.getElementById('personalEditForm');
    editForm.innerHTML = `
        <form id="personalEditFormElement">
            <div class="form-group">
                <label for="editName">ФИО</label>
                <input type="text" id="editName" name="name" value="${fullUserData.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="editPhone">Номер телефона</label>
                <input type="tel" id="editPhone" name="phone" value="${fullUserData.phone || ''}" required>
            </div>
            <div class="form-group">
                <label for="editEmail">Электронная почта</label>
                <input type="email" id="editEmail" name="email" value="${fullUserData.email || ''}" required>
            </div>
            <div class="form-group">
                <label for="editCity">Город</label>
                <input type="text" id="editCity" name="city" value="${fullUserData.city || ''}" required>
            </div>
            <div class="form-group">
                <label for="editBirthday">Дата рождения</label>
                <input type="date" id="editBirthday" name="birthday" value="${formattedBirthday || ''}" required>
            </div>
            <div class="form-group">
                <label for="editGender">Пол</label>
                <select id="editGender" name="gender">
                    <option value="">Не указано</option>
                    <option value="Мужской" ${fullUserData.gender === 'Мужской' ? 'selected' : ''}>Мужской</option>
                    <option value="Женский" ${fullUserData.gender === 'Женский' ? 'selected' : ''}>Женский</option>
                </select>
            </div>
            <div class="form-actions">
                <button type="submit" class="submit-btn">Сохранить</button>
                <button type="button" class="cancel-btn" id="cancelEditBtn">Отмена</button>
            </div>
        </form>
    `;
}

// Загрузка данных пользователя из localStorage
function loadUserDataFromStorage(phone) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone);
    
    if (user) {
        // Возвращаем все данные пользователя, кроме пароля
        const { password, ...userData } = user;
        return userData;
    }
    
    return {};
}

// Инициализация раздела карт
function initCards() {
    const cardsList = document.getElementById('cardsList');
    const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
    
    if (cards.length === 0) {
        cardsList.innerHTML = '<p class="empty-message">У вас нет привязанных карт</p>';
    } else {
        cardsList.innerHTML = cards.map((card, index) => `
            <div class="card-item">
                <div class="card-info">
                    <span class="card-number">**** **** **** ${card.number.slice(-4)}</span>
                    <span class="card-expiry">${card.expiry}</span>
                </div>
                <button class="delete-card-btn" data-index="${index}">Удалить</button>
            </div>
        `).join('');
        
        // Обработчики удаления карт
        document.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteCard(index);
            });
        });
    }
}

// Инициализация раздела скидки
function initDiscount() {
    const discountInfo = document.getElementById('discountInfo');
    const currentUser = getCurrentUser();
    
    // Генерируем промокод на основе имени пользователя
    const promoCode = generatePromoCode(currentUser.name || 'User');
    
    discountInfo.innerHTML = `
        <div class="discount-card">
            <div class="discount-code">
                <span class="code-label">Ваш промокод:</span>
                <span class="code-value" id="promoCode">${promoCode}</span>
                <button class="copy-btn" onclick="copyPromoCode()">Копировать</button>
            </div>
            <p class="discount-description">Скидка 20% на первый заказ</p>
        </div>
    `;
}

// Генерация промокода
function generatePromoCode(name) {
    const namePart = name.replace(/\s+/g, '').substring(0, 4).toUpperCase();
    return `${namePart}New20`;
}

// Копирование промокода
function copyPromoCode() {
    const promoCode = document.getElementById('promoCode').textContent;
    navigator.clipboard.writeText(promoCode).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Скопировано!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка редактирования личной информации
    document.getElementById('editPersonalBtn').addEventListener('click', function() {
        const personalInfo = document.getElementById('personalInfo');
        const editForm = document.getElementById('personalEditForm');
        personalInfo.style.display = 'none';
        editForm.style.display = 'block';
    });
    
    // Отмена редактирования
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
        const personalInfo = document.getElementById('personalInfo');
        const editForm = document.getElementById('personalEditForm');
        personalInfo.style.display = 'block';
        editForm.style.display = 'none';
    });
    
    // Сохранение личной информации
    document.getElementById('personalEditFormElement').addEventListener('submit', function(e) {
        e.preventDefault();
        savePersonalInfo();
    });
    
    // Кнопка добавления карты
    document.getElementById('addCardBtn').addEventListener('click', function() {
        const addCardForm = document.getElementById('addCardForm');
        addCardForm.style.display = 'block';
        this.style.display = 'none';
    });
    
    // Отмена добавления карты
    document.getElementById('cancelCardBtn').addEventListener('click', function() {
        const addCardForm = document.getElementById('addCardForm');
        const addCardBtn = document.getElementById('addCardBtn');
        addCardForm.style.display = 'none';
        addCardBtn.style.display = 'block';
        document.getElementById('cardForm').reset();
    });
    
    // Форматирование номера карты
    document.getElementById('cardNumber').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
        e.target.value = formattedValue;
    });
    
    // Форматирование срока действия
    document.getElementById('cardExpiry').addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
    });
    
    // Только цифры для CVC
    document.getElementById('cardCVC').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
    
    // Добавление карты
    document.getElementById('cardForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addCard();
    });
}

// Сохранение личной информации
function savePersonalInfo() {
    const form = document.getElementById('personalEditFormElement');
    const formData = new FormData(form);
    
    const currentUser = getCurrentUser();
    const updatedUser = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        city: formData.get('city'),
        birthday: formData.get('birthday'),
        gender: formData.get('gender')
    };
    
    // Обновляем данные в sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Обновляем данные в localStorage (всегда сохраняем)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.phone === currentUser.phone);
    
    if (userIndex !== -1) {
        // Обновляем существующего пользователя, сохраняя пароль
        users[userIndex] = { 
            ...users[userIndex], 
            ...updatedUser 
        };
    } else {
        // Если пользователя нет в массиве, добавляем его
        users.push({
            ...updatedUser,
            password: currentUser.password || ''
        });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    
    // Также сохраняем в rememberedUser если он есть
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        localStorage.setItem('rememberedUser', JSON.stringify(updatedUser));
    }
    
    // Обновляем отображение
    document.getElementById('displayName').textContent = updatedUser.name;
    document.getElementById('displayPhone').textContent = updatedUser.phone;
    document.getElementById('displayEmail').textContent = updatedUser.email;
    document.getElementById('displayCity').textContent = updatedUser.city;
    document.getElementById('displayBirthday').textContent = updatedUser.birthday || 'Не указано';
    document.getElementById('displayGender').textContent = updatedUser.gender || 'Не указано';
    
    // Скрываем форму редактирования
    document.getElementById('personalInfo').style.display = 'block';
    document.getElementById('personalEditForm').style.display = 'none';
    
    // Обновляем промокод если изменилось имя
    initDiscount();
    
    // Показываем уведомление об успешном сохранении
    showSaveNotification();
}

// Показ уведомления об успешном сохранении
function showSaveNotification() {
    // Создаем элемент уведомления если его нет
    let notification = document.getElementById('saveNotification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'saveNotification';
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(51, 50, 122, 0.95);
            backdrop-filter: blur(10px);
            color: white;
            padding: 20px 40px;
            border-radius: 52px;
            font-size: 18px;
            font-weight: 700;
            z-index: 2000;
            opacity: 0;
            transition: all 0.3s ease;
            text-transform: uppercase;
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = 'Данные успешно сохранены!';
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 2000);
}

// Добавление карты
function addCard() {
    const form = document.getElementById('cardForm');
    const formData = new FormData(form);
    
    const cardNumber = formData.get('cardNumber').replace(/\s/g, '');
    const card = {
        number: cardNumber,
        expiry: formData.get('cardExpiry'),
        cvc: formData.get('cardCVC'),
        name: formData.get('cardName')
    };
    
    const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
    cards.push(card);
    localStorage.setItem('userCards', JSON.stringify(cards));
    
    // Обновляем список карт
    initCards();
    
    // Скрываем форму
    document.getElementById('addCardForm').style.display = 'none';
    document.getElementById('addCardBtn').style.display = 'block';
    form.reset();
}

// Удаление карты
function deleteCard(index) {
    const cards = JSON.parse(localStorage.getItem('userCards') || '[]');
    cards.splice(index, 1);
    localStorage.setItem('userCards', JSON.stringify(cards));
    initCards();
}
