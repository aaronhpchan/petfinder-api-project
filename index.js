require("dotenv").config();
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
const express = require('express');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

let accessToken;
accessToken = getAccessToken();
//accessToken = process.env.ACCESS_TOKEN;

let pageData = { };
let orgLocation = [];
let userError = [];

app.get('/', (req, res) => {
    returnAnimals(res);
    console.log(accessToken);
});
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
});
app.get('/dogs', (req, res) => {
    returnDogs(res);
});
app.get('/cats', (req, res) => {
    returnCats(res);
});
app.get('/:id', (req, res) => {
    function returnSingleAnimal (res) {
        //return an individual animal from Petfinder API
        axios({
            method: 'get',
            url: `https://api.petfinder.com/v2/animals/${req.params.id}`,
            headers: { 'Authorization': `Bearer ${accessToken}` }    
        }).then(function (response){
            pageData.animal = response.data.animal
            pageData.title = `${response.data.animal.type} for Adoption`;
            return response.data.animal.organization_id;
        }).then(function (orgID){
            //return info about the animal's organization from Petfinder API
            axios({
                method: 'get',
                url: `https://api.petfinder.com/v2/organizations/${orgID}`,
                headers: { 'Authorization': `Bearer ${accessToken}` }    
            }).then(function (response){
                pageData.organization = response.data.organization;
                return response.data.organization.address.postcode;
            }).then(function (orgPostcode){
                //convert the organization's address into coordinates by using Google Geocoding API
                axios({
                    method: 'get',
                    url: `https://maps.googleapis.com/maps/api/geocode/json?address=${orgPostcode}&key=${process.env.API_KEY}`,
                    headers: { 'Authorization': `Bearer ${accessToken}` }    
                }).then(function (response){
                    //save the organization's coordinates into the orgLocation array
                    orgLocation.pop();
                    orgLocation.push(response.data.results[0].geometry.location);
                    res.render('animal', pageData);
                });
            });
        }).catch(function (error){
            console.log(error);
        });
    }
    returnSingleAnimal(res);
});
app.get('/distance/:latlong', (req, res) => {
    const latlong = req.params.latlong.split(',');
    const userLat = latlong[0];
    const userLong = latlong[1];
    const orgLat = orgLocation[0].lat;
    const orgLong = orgLocation[0].lng;
    //return the distance between user location and destination by using Google Distance Matrix API
    axios({
        method: 'get',
        url: `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${userLat}%2C${userLong}&destinations=${orgLat}%2C${orgLong}%7C&key=${process.env.API_KEY}`
    }).then(function (response){
        const elements = Object.values(response.data.rows[0]);
        return res.json(elements[0][0]);
    }).catch(function (error){
        console.log(error);
    });
});
app.post('/error', (req, res) => {
    userError.pop();
    userError.push(req.body);
    res.json({
        status: 'failure',
        code: req.body.errCode,
        message: req.body.errMsg
    });
});

//return 3 dogs and 3 cats from Petfinder API
function returnAnimals(res) {
    const reqDogs = axios({
        method: 'get',
        url: 'https://api.petfinder.com/v2/animals?type=dog&limit=3',
        headers: { 'Authorization': `Bearer ${accessToken}` }    
    });
    const reqCats = axios({
        method: 'get',
        url: 'https://api.petfinder.com/v2/animals?type=cat&limit=3',
        headers: { 'Authorization': `Bearer ${accessToken}` }    
    });
    axios.all([reqDogs, reqCats]).then(axios.spread(function(resDogs, resCats) {
        pageData.title = 'Home';
        pageData.dogs = resDogs.data.animals;
        pageData.cats = resCats.data.animals;
        res.render('index', pageData);
    }));
}
//return 6 dogs from Petfinder API
function returnDogs(res) {
    axios({
        method: 'get',
        url: 'https://api.petfinder.com/v2/animals?type=dog&limit=6',
        headers: { 'Authorization': `Bearer ${accessToken}` }    
    }).then(function (response){
        pageData.dogs = response.data.animals;
        pageData.title = 'Dogs';
        res.render('dogs', pageData);
    }).catch(function (error){
        console.log(error);
    });
}
//return 6 cats from Petfinder API
function returnCats(res) {
    axios({
        method: 'get',
        url: 'https://api.petfinder.com/v2/animals?type=cat&limit=6',
        headers: { 'Authorization': `Bearer ${accessToken}` }    
    }).then(function (response){
        pageData.cats = response.data.animals;
        pageData.title = 'Cats';
        res.render('cats', pageData);
    }).catch(function (error){
        console.log(error);
    });
}

//OAuth-related function
function getAccessToken() {
    let reqData = {
        'grant_type': 'client_credentials',
        'client_id': process.env.CLIENT_ID,
        'client_secret': process.env.CLIENT_SECRET
    };
    if(!accessToken) {
        axios({
            method: 'post',
            url: 'https://api.petfinder.com/v2/oauth2/token',
            data: reqData
        }
        ).then((response) => {
            accessToken = response.data.access_token;
            return accessToken;
        }).catch((error) => {
            console.log(error);
        });
    }
}

app.listen(3000, () => {
    console.log('listening on http://localhost:3000');
});