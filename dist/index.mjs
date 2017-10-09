/*global fetch, */
'use strict';
var qs = require('querystring');


const DISTANCE_API_URL = 'https://maps.googleapis.com/maps/' +
  'api/distancematrix/json?';
const requestError = (err, callback) => {
  callback(new Error('Request error: Could not fetch data from Google\'s servers: ' + err));
};

/**
 * An object that caches keys for use with the Google Distance Matrix API.
 * @type {GoogleDistance}
 */
class GoogleDistance {
  /**
   * Sets keys necessary to access the Google Distance Matrix API.
   * @method
   * @param  {Object} namedArgs an object for destructuring named arguments
   * @param {String|undefined} namedArgs.apiKey your api key
   * @param {String|undefined} namedArgs.businessClientKey your business client key
   * @param {String|undefined} namedArgs.businessSignatureKey your business signaturek ey
   * @return {GoogleDistance} a GoogleDistance object.
   */
  constructor(namedArgs={}){
    let {apiKey, businessClientKey, businessSignatureKey} = namedArgs;
    this.apiKey = apiKey || '';
    this.businessClientKey = businessClientKey || '';
    this.businessSignatureKey =  businessSignatureKey || '';
  }
  /**
   * Processes input options and calls the API.
   * @method
   * @param  {Object}   args     Options to pass to the API.
   * @param  {Function} callback a callback to handle (err, success)
   * @return {undefined}
   */
  get(args, callback){
    const options = this.formatOptions(args);
    this.fetchData(options, (err, data)=>{
      if (err) callback(err);
      this.formatResults(data, options, function(err, results) {
        if (err) callback(err);
        return callback(null, results);
      });
    });
  }
  /**
   * Preprocesses the options to pass the Google API
   * @param  {Object} args options to pass the Google API
   * @return {Object}
   * @throws {Error} if any invalid origins / destinations are input
   */
  formatOptions(args){
    let {
      index, origin, origins, destination, destinations, mode, units, language,
      avoid, sensor
    } = args;
    let {key, businessClientKey, businessSignatureKey} = this;
    let batchMode = false;
    // enforce defaults
    index    = index    || null;
    mode     = mode     || 'driving';
    units    = units    || 'metric';
    language = language || 'en';
    avoid    = avoid    || null;
    sensor   = sensor   || false;

    const check = (singular, plural, success) => {
      var okString = (singular || {}).constructor == String && singular.length;
      const okArray = Array.isArray(plural) && plural.length;
      if (!okString && okArray){
        success(plural.join('|'));
        batchMode = true;
      } else if (!okArray && okString){
        success(singular);
      } else {
        throw new Error(
          `invalid option values: ${JSON.stringify(singular)}, ` +
            JSON.stringify(plural)
          )
      }
    };
    check(origin, origins, checked => origins = checked);
    check(destination, destinations, checked => destinations = checked);
    return Object.assign(
      {index, origins, destinations, mode, units, language, avoid, sensor},
      batchMode && {batchMode}, //only include batchMode if true
      businessClientKey && businessSignatureKey
        ? {businessClientKey, businessSignatureKey}
        : {key}
    );
  }
  /**
   * Formats the results to... something
   * @method
   * @param  {Object}   data     a response as seen at
   * @param  {Object]}   options  ...
   * @param  {Function} callback error/success handler function(err, data)
   * @return {Object|Object[]} An array of processed result elements
   */
  formatResults(data, options, callback) {
    /**
     * Processes one element of an API response
     * @function
     * @param  {element} element
     * @return {Object} { index, distance, duration, durationValue, origin,
     *  destination, mode, units, avoid, sensor }
     */
    const formatData = element => {
      return {
        index: options.index,
        distance: element.distance.text,
        distanceValue: element.distance.value,
        duration: element.duration.text,
        durationValue: element.duration.value,
        origin: element.origin,
        destination: element.destination,
        mode: options.mode,
        units: options.units,
        language: options.language,
        avoid: options.avoid,
        sensor: options.sensor
      };
    };

    if (data.status != 'OK') {
      return callback(
        new Error(`Status error: ${data.status}: ${data.error_message}`)
      );
    }
    let results = [];

    for (let i = 0; i < data.origin_addresses.length; i++) {
      for (var j = 0; j < data.destination_addresses.length; j++) {
        var element = data.rows[i].elements[j];
        let {status} = element;
        if (status != 'OK') return callback(new Error(`Result error: ${status}`));
        element.origin = data.origin_addresses[i];
        element.destination = data.destination_addresses[j];

        results.push(formatData(element));
      }
    }

    if (results.length == 1 && !options.batchMode) {
      results = results[0];
    }
    return callback(null, results);
  }
  /**
   * Fetches data
   * @param  {Object}   options  see formatResults's return
   * @param  {Function} callback Error/success handler function(err, data)
   * @return {undefined}
   */
  fetchData(options, callback) {
    fetch(DISTANCE_API_URL + qs.stringify(options))
      .then((response) => {
        if(response.status != 200) {
          let error = new Error(response.statusText);
          error.response = response;
          throw error;
        }
        return response;
      })
      .then((response) => response.json())
      .then((response) => {
        callback(null, response);
      })
      .catch ((error) => {
        requestError(error, callback);
      });
  }
}
// export {GoogleDistance};
var index = new GoogleDistance;

export default index;
//# sourceMappingURL=index.mjs.map
