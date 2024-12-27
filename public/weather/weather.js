document.addEventListener('DOMContentLoaded', () => {
    const citySelector = document.getElementById('citySelector');
    const cityName = document.getElementById('cityName');
    const currentDate = document.getElementById('currentDate');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');

    // Функция для получения данных о погоде
    const fetchWeatherData = async (city) => {
        try {
            const response = await fetch(`/api/v1/weather/${city}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    };

    // Функция для обновления информации о погоде на странице
    const updateWeatherInfo = async (city) => {
        const data = await fetchWeatherData(city);
        if (data) {
            cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1);
            currentDate.textContent = data.date;
            temperature.textContent = `${data.temperature}°C`;
            description.textContent = data.weather_condition;
            humidity.textContent = data.humidity;
            windSpeed.textContent = `${data.wind_speed} km/h`;
        } else {
            cityName.textContent = '-';
            currentDate.textContent = '-';
            temperature.textContent = '-';
            description.textContent = '-';
            humidity.textContent = '-';
            windSpeed.textContent = '-';
        }
    };

    // Обработчик изменения города в селекте
    citySelector.addEventListener('change', (e) => {
        updateWeatherInfo(e.target.value);
    });

    // Инициализация с выбором города по умолчанию
    updateWeatherInfo(citySelector.value);
});
