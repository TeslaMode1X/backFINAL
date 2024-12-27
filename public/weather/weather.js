document.addEventListener('DOMContentLoaded', () => {
    const citySelector = document.getElementById('citySelector');
    const cityName = document.getElementById('cityName');
    const currentDate = document.getElementById('currentDate');
    const temperature = documendocument.addEventListener('DOMContentLoaded', () => {
        const citySelector = document.getElementById('citySelector');
        const cityName = document.getElementById('cityName');
        const currentDate = document.getElementById('currentDate');
        const temperature = document.getElementById('temperature');
        const description = document.getElementById('description');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('windSpeed');
    
        const fetchWeatherData = async (city) => {
            try {
                const response = await fetch(`/api/weather/${city}`); 
                const data = await response.json(); 
    
                if (data) {
                    return data;
                }
            } catch (error) {
                console.error('Error fetching weather data:', error);
                return null;
            }
        };
    
        const updateWeatherInfo = async (city) => {
            const data = await fetchWeatherData(city);
            if (data) {
                cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1);
                currentDate.textContent = data.date;
                temperature.textContent = `${data.temp}°C`;
                description.textContent = data.desc;
                humidity.textContent = data.humidity;
                windSpeed.textContent = data.wind;
            } else {
                cityName.textContent = '-';
                currentDate.textContent = '-';
                temperature.textContent = '-';
                description.textContent = '-';
                humidity.textContent = '-';
                windSpeed.textContent = '-';
            }
    
            window.history.pushState({}, '', `/route/${city}`);
        };
    
        citySelector.addEventListener('change', (e) => {
            updateWeatherInfo(e.target.value);
        });
    
        updateWeatherInfo(citySelector.value);
    });
    t.getElementById('temperature');
    const description = document.getElementById('description');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');

    const fetchWeatherData = async (city) => {
        try {
            const response = await fetch(`/api/weather/${city}`); 
            const data = await response.json(); 

            if (data) {
                return data;
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
            return null;
        }
    };

    const updateWeatherInfo = async (city) => {
        const data = await fetchWeatherData(city);
        if (data) {
            cityName.textContent = city.charAt(0).toUpperCase() + city.slice(1);
            currentDate.textContent = data.date;
            temperature.textContent = `${data.temp}°C`;
            description.textContent = data.desc;
            humidity.textContent = data.humidity;
            windSpeed.textContent = data.wind;
        } else {
            cityName.textContent = '-';
            currentDate.textContent = '-';
            temperature.textContent = '-';
            description.textContent = '-';
            humidity.textContent = '-';
            windSpeed.textContent = '-';
        }

        window.history.pushState({}, '', `/route/${city}`);
    };

    citySelector.addEventListener('change', (e) => {
        updateWeatherInfo(e.target.value);
    });

    updateWeatherInfo(citySelector.value);
});
