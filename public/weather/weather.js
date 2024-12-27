document.addEventListener('DOMContentLoaded', () => {
    const citySelector = document.getElementById('citySelector');
    const cityName = document.getElementById('cityName');
    const currentDate = document.getElementById('currentDate');
    const temperature = document.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');

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

    const updateWeatherInfo = async (city) => {
        const data = await fetchWeatherData(city);
        if (data) {
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

    // Обработчик изменения города в селекте
    citySelector.addEventListener('change', (e) => {
        updateWeatherInfo(e.target.value);
    });

    // Инициализация с выбором города по умолчанию
    updateWeatherInfo(citySelector.value);
});
