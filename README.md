# Google Distance Matrix API for react-native
[![Build Status](https://travis-ci.org/aldogint/react-native-google-matrix.svg?branch=master)](https://travis-ci.org/aldogint/react-native-google-matrix)
[![npm version](https://badge.fury.io/js/react-native-google-matrix.svg)](https://badge.fury.io/js/react-native-google-matrix)  

This repository is forked from [node-google-distance](https://github.com/aldogint/node-google-distance).   
A simple react-native wrapper for [Google Distance Matrix API](https://developers.google.com/maps/documentation/distancematrix/)

## Installation

    npm install --save react-native-google-matrix

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
```

*to be updated...*
