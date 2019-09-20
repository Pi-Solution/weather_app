var g_weather = [[], []]
window.addEventListener('load', () => {
    //get user location
    get_user_location();
    //add event to input and submit
    add_event_to_input();
    //add event to weather departure cards
    weather_card_click_event('wc-dep', 'wc-dep_w');
});
function add_event_to_input(){
   //add event listener to submit button 
        //this will allow user to input long and lat and submit it to api
    let submit_button = document.getElementById('submit_location');
    submit_button.addEventListener('click', () => {
        let long = document.getElementById('long').value
        let lat = document.getElementById('lat').value
        if(long <= 180 && long >= -180 && lat <= 90 && lat >= -90){
            let userPosition = {
                'long': long,
                'lat': lat,
                'weatLoc': 'des'
            }
            let desWeatherCards = document.getElementsByClassName('wc-des')
            //remove old click event if exist
            if (g_weather[1].length > 0) {
                for (let index = 0; index < desWeatherCards.length; index++) {
                    desWeatherCards[index].removeEventListener("click", weather_card_click_event('wc-des', 'wc-des_w'));          
                }
            }
            //add new click
            for (let index = 0; index < desWeatherCards.length; index++) {
                desWeatherCards[index].addEventListener("click", weather_card_click_event('wc-des', 'wc-des_w'));         
            }
            get_weather_data(userPosition)
        }else{
            alert('Please input a valid values of:\n Longitude (max = 180, min -180) \n Latitude (max = 90, min -90)');
        }
    })
}
/*add eventListener to weather cards
        This will allow user to click on weather card and select choosen day weather info
    */
function weather_card_click_event(cards_cls, con_cls){
    let weatherCards = document.getElementsByClassName(cards_cls,);
    for (let index = 0; index < weatherCards.length; index++) {
        weatherCards[index].addEventListener('click', () => {
            render_other_wether_info(con_cls, index)
        })
    }
}
//This function returns the object with user Longitude and Latitude
function get_user_location(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(position => {
            let long = position.coords.longitude;
            let lat = position.coords.latitude;
            let userPosition = {
                'long': long,
                'lat': lat,
                'weatLoc': 'dep'
            }
            get_weather_data(userPosition)
        });
    }else{
        alert('To get your Weather info you need to give use your location')
        userPosition = {
            'error': "user did't give location"
        }
    }
}
//get wether data from api
function get_weather_data(position){
    const api = `https://api.met.no/weatherapi/locationforecast/1.9/?lat=${position.lat};lon=${position.long}`;
    fetch(api)
    .then(response => response.text())
    .then(data=>{
        let parser = new DOMParser();
        let xml = parser.parseFromString(data, 'application/xml');
        if(position.weatLoc == 'dep' ? set_weather(xml, 'wc-dep_w') : set_weather(xml, 'wc-des_w'));
    })
}
//set departure_weather
function set_weather(data, id){
    let weather = format_wether_data(data);
    //console.log(data)
    (id == 'wc-dep_w')? g_weather[0] = weather : g_weather[1] = weather;
    //console.log(weather)
    for (let index = 0; index < weather.length; index++) {

        let wCards = document.getElementById(id).children
        let wCards_child = wCards[index].children
       
        wCards_child[0].innerHTML = weather[index].day
        wCards_child[1].innerHTML = weather[index].temperature.toFixed(1) + 'C'
        
        //cloudiness
        let cloudH = Math.max(weather[index].lowClouds, weather[index].mediumClouds, weather[index].highClouds)
        let cloud_array = [weather[index].highClouds, weather[index].mediumClouds, weather[index].lowClouds]
        let cloudH_child = cloud_array.indexOf(cloudH)
        //determenate position of clouds
        if (cloudH_child == 0) {
            wCards_child[2].innerHTML = "High Clouds"
            wCards_child[3].children[1].style.top = '5%';
        }else if (cloudH_child == 1) {
            wCards_child[2].innerHTML = "Medium Clouds"
            wCards_child[3].children[1].style.top = '15%';
        }
        else if (cloudH_child == 2) {
            wCards_child[2].innerHTML = "Low Clouds"
            wCards_child[3].children[1].style.top = '25%';
        }
        //determenate opacity of clouds and sun
        if (weather[index].cloudiness < 25) {
            wCards_child[3].children[1].style.opacity = '0.0'
            wCards_child[3].children[0].style.opacity = '1'
        }else if (weather[index].cloudiness <= 25 && weather[index].cloudiness < 50) {
            wCards_child[3].children[1].style.opacity = '0.6'
            wCards_child[3].children[0].style.opacity = '0.8'
        }else if (weather[index].cloudiness >= 50) {
            wCards_child[3].children[1].style.opacity = '1'
            wCards_child[3].children[0].style.opacity = '0.0'
        }
    }
    render_other_wether_info(id, 0)
}
// dod => destinationOrDeparture
function render_other_wether_info(dod, day){
    let index = (dod == 'wc-dep_w')?  0 : 1
    document.getElementsByClassName('day')[index].innerHTML = " " + g_weather[index][day].day
    document.getElementsByClassName('dew-p')[index].innerHTML = " " + g_weather[index][day].dewPoint.toFixed(1) + "C"
    document.getElementsByClassName('humidity')[index].innerHTML = " " + g_weather[index][day].humidity.toFixed(0) + "%"
    document.getElementsByClassName('fog')[index].innerHTML = " " + g_weather[index][day].fog.toFixed(0) + "%"
    
}
function format_wether_data(data){
    /*  This is array what we will return fo parent function
        This array will be used to render data to end user
    */
    let formated_weather = [];

    let time = data.getElementsByTagName('time');
    for (let i = 0; i < 4; i++) {
        //make i new object for so we can store data
        formated_weather.push({
            'temperature': 0,
            'dewPoint': 0,
            'humidity': 0,
            'cloudiness': 0,
            'highClouds': 0,
            'mediumClouds': 0,
            'lowClouds': 0,
            'fog': 0,
            'day': ''
        })
        let date = new Date();
        let formated_date = format_date(date, i)
        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayName = days[date.getDay()];
        formated_weather[i].day = dayName
        for (let index = 0; index < time.length; index++) {
            if (time[index].getAttribute('from').substring(0, 10) == formated_date) {
                let timeChild = time[index].children
                let temperature = timeChild[0].getElementsByTagName('temperature')
                let dewPoint = timeChild[0].getElementsByTagName('dewpointTemperature')
                let humidity = timeChild[0].getElementsByTagName('humidity')
                let cloudiness = timeChild[0].getElementsByTagName('cloudiness')
                let highClouds = timeChild[0].getElementsByTagName('highClouds')
                let mediumClouds = timeChild[0].getElementsByTagName('mediumClouds')
                let lowClouds = timeChild[0].getElementsByTagName('lowClouds')
                let fog = timeChild[0].getElementsByTagName('fog')
                if (temperature[0] != undefined) {
                    formated_weather[i].temperature = (formated_weather[i].temperature + parseFloat(temperature[0].getAttribute('value'))) / 2
                    formated_weather[i].dewPoint = (formated_weather[i].dewPoint + parseFloat(dewPoint[0].getAttribute('value'))) / 2
                    formated_weather[i].humidity = (formated_weather[i].humidity + parseFloat(humidity[0].getAttribute('value'))) / 2
                    formated_weather[i].cloudiness = (formated_weather[i].cloudiness + parseFloat(cloudiness[0].getAttribute('percent'))) / 2
                    formated_weather[i].highClouds = (formated_weather[i].highClouds + parseFloat(highClouds[0].getAttribute('percent'))) / 2
                    formated_weather[i].mediumClouds = (formated_weather[i].mediumClouds + parseFloat(mediumClouds[0].getAttribute('percent'))) / 2
                    formated_weather[i].lowClouds = (formated_weather[i].lowClouds + parseFloat(lowClouds[0].getAttribute('percent'))) / 2
                    formated_weather[i].fog = (formated_weather[i].fog + parseFloat(fog[0].getAttribute('percent'))) / 2
                }
            }
        }
    }
    //console.log(formated_weather)
    return formated_weather
}
//format time so we can use it for api xml data if statment
function format_date(date, day){
    date.setDate(date.getDate() + day)
    add_zero = (data) => (data < 10) ? '0' + data : data
    let formated_date = date.getFullYear() + '-' + add_zero(date.getMonth() + 1) + '-' + add_zero(date.getDate())
    return formated_date
}