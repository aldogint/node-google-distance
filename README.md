# Google Distance Matrix API for react-native

This repository is forked from [node-google-distance](https://github.com/aldogint/node-google-distance). 
Easily get traveling distance and duration data between locations with the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distancematrix/)

## Installation

    not available yet

## Usage
```js
var distance = require('google-distance');

distance.get(
  {
    origin: '-7.841879,110.409193',
    destination: '-7.741194,110.342588'
  },
  function(err, data) {
    if (err) return console.log(err);
    console.log(data);
});

*to be updated...*