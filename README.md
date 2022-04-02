# petfinder-api-project

Pet Friend is a web application which locates dogs and cats available for adoption.

## Features
- Home page displays both dogs and cats available for adoption
- Dogs page and Cats page display dogs and cats respectively
- User can click on each pet's image or name hyperlink to enter that pet's page
- Each pet's page contains information such as breed, age, and its welfare organization details etc.
  - The distance between the user and the pet will be calculated and displayed on click of the "Calculate Distance" button on the page

## APIs
External APIs used:
- [Petfinder API](https://www.petfinder.com/developers/v2/docs/) 
  - Server-side request to return pets available for adoption
    - Includes information about each pet and its organizaiton
- [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) 
  - Client-side request to return the user's location in coordinates
  - *User permission to provide location information is required*
- [Google Geocoding API](https://developers.google.com/maps/documentation/geocoding) 
  - Server-side request to convert the organization's address into coordinates
- [Google Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix) 
  - Server-side request to return the distance between user location and destination

## Tools
Tools used to build this application:
- Bootstrap 5
- Node.js
- Express.js
- EJS
- Fetch API (client-side)
- Axios (server-side)
