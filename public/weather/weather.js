document.addEventListener('DOMContentLoaded', () => {
    const citySelector = document.getElementById('citySelector');
    const cityName = document.getElementById('cityName');
    const currentDate = document.getElementById('currentDate');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const weatherTableBody = document.getElementById('weatherTableBody');

    // Функция для получения данных о текущей погоде
    const fetchCurrentWeather = async (city) => {
        try {
            const response = await fetch(`/api/v1/today/weather/${city}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching current weather data:', error);
            return null;
        }
    };

    // Функция для получения прогноза на 7 дней
    const fetchWeeklyWeather = async (city) => {
        try {
            const response = await fetch(`/api/v1/week/weather/${city}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weekly weather data:', error);
            return null;
        }
    };

    // Обновление информации о текущей погоде
    const updateCurrentWeather = async (city) => {
        const data = await fetchCurrentWeather(city);
        if (data && data.length > 0) {
            cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1);
            currentDate.textContent = data[0].date;
            temperature.textContent = `${data[0].temperature}°C`;
            description.textContent = data[0].weather_condition;
            humidity.textContent = data[0].humidity;
            windSpeed.textContent = `${data[0].wind_speed}`;
        } else {
            cityName.textContent = '-';
            currentDate.textContent = '-';
            temperature.textContent = '-';
            description.textContent = '-';
            humidity.textContent = '-';
            windSpeed.textContent = '-';
        }
    };

    // Обновление прогноза на 7 дней
    const updateWeeklyWeather = async (city) => {
        const data = await fetchWeeklyWeather(city);
        if (data && data.length > 0) {
            // Очищаем старые данные из таблицы
            weatherTableBody.innerHTML = '';

            // Заполняем таблицу данными на 7 дней
            data.forEach(day => {
                const row = document.createElement('tr');
                
                const dateCell = document.createElement('td');
                dateCell.textContent = day.date;
                row.appendChild(dateCell);
                
                const tempCell = document.createElement('td');
                tempCell.textContent = `${day.temperature}°C`;
                row.appendChild(tempCell);
                
                const descCell = document.createElement('td');
                descCell.textContent = day.weather_condition;
                row.appendChild(descCell);
                
                const humidityCell = document.createElement('td');
                humidityCell.textContent = `${day.humidity}%`;
                row.appendChild(humidityCell);
                
                const windSpeedCell = document.createElement('td');
                windSpeedCell.textContent = `${day.wind_speed} km/h`;
                row.appendChild(windSpeedCell);

                weatherTableBody.appendChild(row);
            });
        } else {
            weatherTableBody.innerHTML = '<tr><td colspan="5">No weather data available</td></tr>';
        }
    };

    // Обработчик изменения города в селекте
    citySelector.addEventListener('change', (e) => {
        const selectedCity = e.target.value;
        updateCurrentWeather(selectedCity);
        updateWeeklyWeather(selectedCity);
    });

    // Инициализация с выбором города по умолчанию
    const defaultCity = citySelector.value;
    updateCurrentWeather(defaultCity);
    updateWeeklyWeather(defaultCity);
});
