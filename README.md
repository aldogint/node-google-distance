# Google Distance Matrix API for react-native 

This repository is forked from [react-native-google-matrix](https://github.com/aldogint/react-native-google-matrix) which as forked from [node-google-distance](https://github.com/aldogint/node-google-distance).     
A simple wrapper for the [Google Distance Matrix API](https://developers.google.com/maps/documentation/distancematrix/) that uses the [fetch api](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) and es6 syntax used in modern browsers and react native.

## Installation

    git clone https://github.com/SKalt/react-native-google-matrix.git [path/to/where/you/want/it]
or 

```
git submodule add https://github.com/SKalt/react-native-google-matrix.git [path/to/where/you/want/it]
````

## Usage
```js
var distance = require('path/to/google-distance/dist/index.common.js');
```
or
```js
import distance from 'path/to/google-distance/dist/index.mjs';

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
