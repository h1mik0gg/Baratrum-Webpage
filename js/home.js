const serviceType = document.getElementById('serviceType');
const taxiFields = document.getElementById('taxiFields');
const carsharingFields = document.getElementById('carsharingFields');
const applicationForm = document.getElementById('applicationForm');
const notification = document.getElementById('notification');

serviceType.addEventListener('change', function() {
    if (this.value === 'taxi') {
        taxiFields.style.display = 'block';
        carsharingFields.style.display = 'none';
        document.getElementById('carsharingTariff').removeAttribute('required');
        document.getElementById('orderAddress').removeAttribute('required');
        document.getElementById('carModel').removeAttribute('required');
        document.getElementById('rentalPeriod').removeAttribute('required');
        document.getElementById('taxiTariff').setAttribute('required', 'required');
        document.getElementById('pickupAddress').setAttribute('required', 'required');
        document.getElementById('destinationAddress').setAttribute('required', 'required');
    } else if (this.value === 'carsharing') {
        taxiFields.style.display = 'none';
        carsharingFields.style.display = 'block';
        document.getElementById('taxiTariff').removeAttribute('required');
        document.getElementById('pickupAddress').removeAttribute('required');
        document.getElementById('destinationAddress').removeAttribute('required');
        document.getElementById('carsharingTariff').setAttribute('required', 'required');
        document.getElementById('orderAddress').setAttribute('required', 'required');
        document.getElementById('carModel').setAttribute('required', 'required');
        document.getElementById('rentalPeriod').setAttribute('required', 'required');
    } else {
        taxiFields.style.display = 'none';
        carsharingFields.style.display = 'none';
    }
});

applicationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceTypeValue = serviceType.value;
    let messageText = '';

    if (serviceTypeValue === 'taxi') {
        const tariffOptions = {
            'budget': 'Бюджет',
            'economy': 'Эконом',
            'comfort': 'Комфорт',
            'business': 'Бизнес',
            'hyper': 'Гипер'
        };
        
        const tariff = tariffOptions[document.getElementById('taxiTariff').value] || document.getElementById('taxiTariff').value;
        const pickupAddress = document.getElementById('pickupAddress').value;
        const destinationAddress = document.getElementById('destinationAddress').value;
        const comment = document.getElementById('taxiComment').value || 'Не указан';
        
        messageText = `🚕 *Новая заявка на такси*

*Тип услуги:* Такси
*Тариф:* ${tariff}
*Адрес подачи:* ${pickupAddress}
*Адрес назначения:* ${destinationAddress}
*Комментарий водителю:* ${comment}`;
    } else if (serviceTypeValue === 'carsharing') {
        const tariffOptions = {
            'economy': 'Эконом',
            'comfort': 'Комфорт',
            'sport': 'Спорт',
            'premium': 'Премиум'
        };
        
        const tariff = tariffOptions[document.getElementById('carsharingTariff').value] || document.getElementById('carsharingTariff').value;
        const orderAddress = document.getElementById('orderAddress').value;
        const carModel = document.getElementById('carModel').value;
        const rentalPeriod = document.getElementById('rentalPeriod').value;
        const comment = document.getElementById('carsharingComment').value || 'Не указан';
        
        messageText = `🚗 *Новая заявка на каршеринг*

*Тип услуги:* Каршеринг
*Тариф:* ${tariff}
*Адрес заказа:* ${orderAddress}
*Модель машины:* ${carModel}
*Срок аренды:* ${rentalPeriod}
*Комментарий к аренде:* ${comment}`;
    }

    // Настройки Telegram Bot
    // 1. Создайте бота через @BotFather в Telegram
    // 2. Получите токен бота
    // 3. Получите ваш chat_id (отправьте сообщение боту @userinfobot или используйте getUpdates)
    const BOT_TOKEN = '8539998342:AAHKmrItqbJSOApkNZ4Zf7KSAJ51wuhGNBM'; // Замените на токен вашего бота
    const CHAT_ID = '6357901595'; // Замените на ваш chat_id

    // Отправка в Telegram
    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    fetch(telegramUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: messageText,
            parse_mode: 'Markdown'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            notification.textContent = 'Спасибо за заявку!';
            notification.classList.add('show');
            
            setTimeout(function() {
                notification.classList.remove('show');
            }, 3000);
            
            applicationForm.reset();
            taxiFields.style.display = 'none';
            carsharingFields.style.display = 'none';
        } else {
            throw new Error(data.description || 'Ошибка отправки');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        notification.textContent = 'Ошибка отправки. Попробуйте позже.';
        notification.classList.add('show');
        
        setTimeout(function() {
            notification.classList.remove('show');
        }, 3000);
    });
});

