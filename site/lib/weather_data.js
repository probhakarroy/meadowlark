var weather = {
    locations: [
        {
            name: 'Portland',
            forecast_url: 'http://www.wunderground.com/US/OR/Portland.html',
            icon_url: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
            weather: 'Overcast',
            temp: '54.1 F (12.3 C)',
        },
        {
            name: 'Bend',
            forecast_url: 'http://www.wunderground.com/US/OR/Bend.html',
            icon_url: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
            weather: 'Partly Cloudy',
            temp: '55.0 F (12.8 C)',
        },
        {
            name: 'Manzanita',
            forecast_url: 'http://www.wunderground.com/US/OR/Manzanita.html',
            icon_url: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
            weather: 'Light Rain',
            temp: '55.0 F (12.8 C)',
        },
    ],
};

exports.get_weather_data = () => {
    return weather;
}