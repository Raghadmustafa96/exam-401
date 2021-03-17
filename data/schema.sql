DROP TABLE IF EXISTS covidTable;

CREATE TABLE covidTable(
    id SERIAL PRIMARY KEY ,
  Country varchar(255),
  TotalConfirmed varchar(255),
  TotalDeaths varchar(255),
  TotalRecovered varchar(255),
  Date varchar(255)
);





