const API_KEY = 'c8b50245c1e4474594550144230306';

const app = (() => {

    async function getData(location) {
        const request = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${location}`
    
        try {
            const response = await fetch(request);
            if (!response.ok) {
                throw new Error('Request failed with status: ' + response.status);
            }
            const data = await response.json();
            return data;
    
        } catch (error) {
            throw error
        }
    }
    
    function processData(data) {
        function processWeatherData(data) {
            return {
                conditionText: data.condition.text,
                tempC: data.temp_c,
                tempF: data.temp_f,
                humidity: data.humidity,
                isDay: data.is_day,
                precipIn: data.precip_in,
                precipMm: data.precip_mm,
            }
        }
    
        function processLocationData(data) {
            const dateTime = data.localtime.split(' ');
            return {
                country: data.country,
                region: data.region,
                name: data.name,
                date: dateTime[0],
                time: dateTime[1]
            }
        }
    
        const weatherData = processWeatherData(data.current);
        const locationData = processLocationData(data.location);
        
        console.log(weatherData);
        console.log(locationData);
        
        return { weatherData, locationData }
    }
    
    
    function displayData(data) {
        
        const weatherData = data.weatherData;
        const locationData = data.locationData;
        
        function displayWeatherData(data) {
            const weatherDisplay = document.querySelector('section.weather-display');
            
            const tempDisplay = weatherDisplay.querySelector('.temperature span');
            const descriptionDisplay = weatherDisplay.querySelector('.description');
            const humidityDisplay = weatherDisplay.querySelector('.humidity span');
            const timeOfDayDisplay = weatherDisplay.querySelector('.time-of-day');
            const precipitationDisplay = weatherDisplay.querySelector('.precipitation span');
    
            tempDisplay.textContent = tempUnit === 'c' ? data.tempC + '°C' : data.tempF + '°F';
    
            descriptionDisplay.textContent = data.conditionText;
            humidityDisplay.textContent = data.humidity + '%';
            precipitationDisplay.textContent = data.precipMm + 'mm';
            
            if (data.isDay === 1) {
                timeOfDayDisplay.querySelector('span').textContent = 'Day';
                timeOfDayDisplay.querySelector('i').className = 'fa fa-sun-o';
                document.querySelector('body').style.backgroundColor = '#00a0d1';
            } else {
                timeOfDayDisplay.querySelector('span').textContent = 'Night';
                timeOfDayDisplay.querySelector('i').className = 'fa fa-moon-o';
                document.querySelector('body').style.backgroundColor = 'rgb(0,20,40)';
            }
    
            function setWeatherIcon(condition) {
                weatherImg = document.querySelector('.weather-img img');
                if (condition.includes('thunder')) {
                    weatherImg.src = 'images/thunderstorm.png';
                } else if (condition.includes('cloud') || condition === 'overcast') {
                    weatherImg.src = 'images/cloudy.png';
                } else if (condition.includes('mist')) {
                    weatherImg.src = 'images/mist.png';
                } else if (condition === 'sunny') {
                    weatherImg.src = 'images/sunny.png';
                } else if (condition.includes('rain')) {
                    weatherImg.src = 'images/rain.png';
                } else {
                    weatherImg.src = 'images/clear_weather.png';
                }
            }

            setWeatherIcon(data.conditionText.toLowerCase());
        }
    
        function displayLocationData(data) {
            const locationDisplay = document.querySelector('section.location-display');
    
            const cityDisplay = locationDisplay.querySelector('.city-country');
            const dateDisplay = locationDisplay.querySelector('.date');
            const timeDisplay = locationDisplay.querySelector('.time');
    
            cityDisplay.textContent = data.name + ', ' + data.country;
    
            dateDisplay.textContent = data.date;
            timeDisplay.textContent = data.time;
        }
    
        displayWeatherData(weatherData);
        displayLocationData(locationData);
    }
    
    
    async function showWeather (location) {
        try {
            const rawData = await getData(location);
            const processedData = processData(rawData);
            localStorage.setItem('data', JSON.stringify(processedData));
            displayData(processedData);
        } catch (error) {
            throw error;
        }
    }


    // Toggle temperature unit
    let tempUnit = 'c'; // Default to celsius
    
    const tempToggleBtn = document.querySelector('button.toggle-unit');
    
    tempToggleBtn.addEventListener('click', () => {
        tempUnit = tempUnit === 'c' ? 'f' : 'c';
        tempToggleBtn.textContent = tempUnit === 'c' ? '°F' : '°C'
        
        const processedData = JSON.parse(localStorage.getItem('data'));
        displayData(processedData, tempUnit);
    })

    return { showWeather }
})();


// Default weather data shown on page load
const defaultLocation = 'Tokyo'
app.showWeather(defaultLocation);

const locationForm = document.querySelector('form.location');

locationForm.addEventListener('submit', async event => {
    event.preventDefault();
    
    const locationField = document.getElementById('location-field');
    const location = locationField.value;
    
    const errorContainer = document.querySelector('div.error');

    try {
        await app.showWeather(location);
        errorContainer.textContent = ''
        
    } catch (error) {
        console.log(error)
        errorContainer.textContent = 'Location not found';
    }
    
    event.target.reset();
})
