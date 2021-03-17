'use strict';

var express = require('express')
var methodOverride = require('method-override')
require('dotenv').config();
var pg = require('pg')
var superagent = require('superagent')
var cors = require('cors')


// setup
var app = express()
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

const PORT = process.env.PORT || 3030;

let client = '' ;

if(PORT == 3000 || PORT == 3030){
 client = new pg.Client(process.env.DATABASE_URL);
} else {
 client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
}


// routes
 app.get('/', handleHome);
 app.get('/getCountry',getCountryHandler)
 app.get('/allCountries', allcountries)
 app.post('/myRecords', myRecords)
 app.get('/Records', RecordsHandler)
 app.get('/details/:id', detailsHandler)
 app.delete('/delete/:id' , deleteHandler)


// function
function handleHome(req,res){
    let url = `https://api.covid19api.com/world/total`;
    superagent.get(url).then(result=>{
        res.render('./pages/index',{data:result.body});
    })
}

function getCountryHandler(req,res){
    let country = req.query.country;
    let from = req.query.from;
    let to = req.query.to;

    let url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`;
    superagent.get(url).then(result=>{
        let arr = result.body.map(element=>{
            let countryObj = new Country(element);
            return countryObj
        })
        console.log(arr)

        res.render('./pages/getCountry',{data:arr});
    })
}

function allcountries(req,res){
    let url = `https://api.covid19api.com/summary`;
    superagent.get(url).then(result=>{
        let arr = result.body.Countries.map(element=>{
            let countryObj = new Countries(element);
            return countryObj
        })
        // console.log(arr)
        res.render('./pages/allCountries',{data:arr});
    })


}


function myRecords(req,res){
 let {Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date}= req.body;
 let SQL= `INSERT INTO covidTable (Country, TotalConfirmed, TotalDeaths, TotalRecovered, Date)VALUES ($1,$2,$3,$4,$5);`
 let values = [Country,TotalConfirmed,TotalDeaths,TotalRecovered,Date];
 client.query(SQL,values).then(result=>{
    res.redirect('/Records')
 })
}


function RecordsHandler(req,res){
    let SQL= `SELECT * FROM covidTable`
    client.query(SQL).then(result=>{
       res.render('./pages/myRecords', {data:result.rows})
    })
}

function detailsHandler(req,res){
    let SQL= `SELECT * FROM covidTable WHERE id=$1`;
    let value = [req.params.id];
    client.query(SQL,value).then(result=>{
       res.render('./pages/detailes', {data:result.rows[0]})
    })
}

function deleteHandler(req,res){
    let SQL= `DELETE FROM covidTable WHERE id=$1`;
    let value = [req.params.id];
    client.query(SQL,value).then(result=>{
        res.redirect('/Records');
    })
}



// constructor

function Country(data){
    this.Date = data.Date;
    this.Cases = data.Cases;
}
function Countries(data){
    this.Country = data.Country;
    this.TotalConfirmed = data.TotalConfirmed;
    this.TotalDeaths = data.TotalDeaths;
    this.TotalRecovered = data.TotalRecovered;
    this.Date = data.Date
}



client.connect().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Listening on PORT ${PORT}`);
    })
})