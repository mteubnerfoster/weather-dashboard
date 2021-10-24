$(document).ready(function () {
    var APIKey = "49a27a54ac40f631b8c1972fcad5d928";
    var STORAGE_KEY = "city-history";
    $("#input-city").val("");
    updateHistory();
    var history = getLocalstorage();
    var queryURL = generateCityForecastURL(history[(history.length - 1)]);
    fetchWeatherData(queryURL);
  
    $("#find-city").on("click", function (event) {
      event.preventDefault();
      var city = $("#input-city").val();
      setLocalStorage(city);
      updateHistory();
      var queryURL = generateCityForecastURL(city);
      fetchWeatherData(queryURL);
    });
  
    function generateCityForecastURL(city) {
      return "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=49a27a54ac40f631b8c1972fcad5d928";
    }
  
    function fetchWeatherData(queryURL) {
      $.ajax({
        url: queryURL,
        method: "GET"
      }).then(processWeatherData);
    }
  
    function processWeatherData(response) {
      console.log(response);
      var todaysData = response.list[0];
      renderTodaysWeather(todaysData, response.city);
      renderForecast(response);
    }
  
    function formatTemp(temp) {
      return ((temp - 273.15) * 1.80 + 32).toFixed(1);
    }
  
    function generateIconURL(icon) {
      return "https://openweathermap.org/img/wn/" + icon + ".png";
    }
  
    function renderTodaysWeather(todaysData, city) {
      var date = todaysData.dt;
      //console.log(date);
      var formatted_date = new Date(date * 1000).toLocaleDateString();
      console.log(formatted_date);
      var uvLat = city.coord.lat;
      var uvLon = city.coord.lon;
      fetchUVData(uvLat, uvLon);
      var weatherIcon = todaysData.weather[0].icon;
      $("#city-name").empty();
      $("#temperature").empty();
      $("#humidity").empty();
      $("#wind-speed").empty();
      $("#city-name").append(city.name).append(" (" + formatted_date + ") ").append(`<img id="weatherIcon" src ="${generateIconURL(weatherIcon)}">`);
      var tempF = formatTemp(todaysData.main.temp);
      $("#temperature").append("Temperature: " + tempF + " &#xb0;F");
      $("#humidity").append("Humidity: " + todaysData.main.humidity + " %");
      $("#wind-speed").append("Wind Speed: " + (todaysData.wind.speed * 2.236936).toFixed(1) + " MPH");
    }
  
    function fetchUVData(uvLat, uvLon) {
      $.ajax({
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + uvLat + "&lon=" + uvLon,
        method: "GET"
      }).then(function (response) {
        $("#UV-index").empty();
        $("#UV-index").append("UV Index: " + '<span id= "level">' + response.value + '</span>');
        if (response.value > 0 && response.value < 3) {
          $("#level").addClass("normal");
        } else if (response.value >= 3 && response.value < 6) {
          $("#level").addClass("moderate");
        } else {
          $("#level").addClass("severe");
        }
      });
    }
  
    function renderForecast(response) {
      $("#fiveDayForecast").html("5-Day Forecast:");
      var days = extractForecastData(response.list);
      console.log(days);
      var cards = $(".card");
      cards.each(function (index, element) {
        var currentCard = $(element);
        var currentData = days[index];
        currentCard.find(".date").html(currentData.date);
        currentCard.find(".icon").attr("src", generateIconURL(currentData.icon));
        currentCard.find(".temp").html("Temp: " + currentData.temp + " &#xb0;F");
        currentCard.find(".humidity").html("Humidity: " + currentData.humidity + "%");
      })
    }

    function extractForecastData(list) {
      var forecastData = [];
      for (var i = 0; i < 40; i += 8) {
        console.log(i);
        var data = {};
        data.date = new Date(list[i].dt * 1000).toLocaleDateString();
        data.icon = list[i].weather[0].icon;
        data.temp = formatTemp(list[i].main.temp);
        data.humidity = list[i].main.humidity;
        forecastData.push(data);
      }
      return forecastData;
    }

    function setLocalStorage(city) {
      var history = getLocalstorage();
      console.log(history);
      history.push(city);
      history = JSON.stringify(history);
      localStorage.setItem(STORAGE_KEY, history);
    }

    function getLocalstorage() {
      var value = localStorage.getItem(STORAGE_KEY);
      if (!value) {
        value = [];
      } else {
        value = JSON.parse(value);
      }
      return value;
    }

    function updateHistory() {
      var history = getLocalstorage();
      console.log(history);
      $(".history").empty();
      var ul = $("<ul>");
      for (var i = 0; i < history.length; i++) {
        var li = $("<li>").append(history[i]);
        li.on("click", function (e) {
          var target = $(e.target);
          console.log(target);
          if (target.is("li")) {
            var queryURL = generateCityForecastURL(target.text());
            fetchWeatherData(queryURL);
          }
        });

        ul.append(li);
      }

      $(".history").append(ul);
      
    }
  });