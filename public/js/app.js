/* Calculates the distance between the user and the pet */
const button = document.querySelector('#getLocation');
const distanceDiv = document.querySelector('#distanceDiv')
const distance = document.querySelector('#showDistance');
const duration = document.querySelector('#showDuration');

button.onclick = function () {
    if (distance.innerHTML === ''){
        //HTML Geolocation API to return user's location
        if (navigator.geolocation) {
            console.log('geolocation available');
            navigator.geolocation.getCurrentPosition(position, error);
        } else {
            console.log('geolocation unavailable');
        }

        async function position(position) {
            console.log('User accepted the request for Geolocation.');
            console.log(position);

            const lat = position.coords.latitude;
            const long = position.coords.longitude;
            //send the lat and long variables to the server
            const response = await fetch(`/distance/${lat},${long}`);
            const distanceDetails = await response.json();
            //show distance info
            distanceDiv.style.display = 'block';
            distance.innerHTML = `<span>Distance: </span>${distanceDetails.distance.text}`;
            duration.innerHTML = `<span>Duration: </span>${distanceDetails.duration.text}`;
        }
        async function error(err) {
            const errCode = err.code;
            const errMsg = err.message;
            const error = { errCode, errMsg };
            const options = { 
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(error)
            };
            //send error details to server
            const response = await fetch('/error', options);
            const errorDetails = await response.json();
            console.log(errorDetails);
        } 
    }   
}
