'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

'use strict';

var qs = require('querystring');
const fetch = require('node-fetch');

var DISTANCE_API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json?';
var requestError = function requestError(err, callback) {
  callback(new Error('Request error: Could not fetch data from Google\'s servers: ' + err));
};

/**
 * An object that caches keys for use with the Google Distance Matrix API.
 * @type {GoogleDistance}
 */

var GoogleDistance = function () {
  /**
   * Sets keys necessary to access the Google Distance Matrix API.
   * @method
   * @param  {Object} namedArgs an object for destructuring named arguments
   * @param {String|undefined} namedArgs.apiKey your api key
   * @param {String|undefined} namedArgs.businessClientKey your business client key
   * @param {String|undefined} namedArgs.businessSignatureKey your business signaturek ey
   * @return {GoogleDistance} a GoogleDistance object.
   */
  function GoogleDistance() {
    var namedArgs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, GoogleDistance);
    var apiKey = namedArgs.apiKey,
        businessClientKey = namedArgs.businessClientKey,
        businessSignatureKey = namedArgs.businessSignatureKey;

    this.apiKey = apiKey || '';
    this.businessClientKey = businessClientKey || '';
    this.businessSignatureKey = businessSignatureKey || '';
  }
  /**
   * Processes input options and calls the API.
   * @method
   * @param  {Object}   args     Options to pass to the API.
   * @param  {Function} callback a callback to handle (err, success)
   * @return {undefined}
   */


  createClass(GoogleDistance, [{
    key: 'get',
    value: function get$$1(args, callback) {
      var options = this.formatOptions(args);
      this.fetchData(options, function (err, data) {
        if (err) return callback(err);
        this.formatResults(data, options, function (err, results) {
          if (err) return callback(err);
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

  }, {
    key: 'formatOptions',
    value: function formatOptions(args) {
      var index = args.index,
          origin = args.origin,
          origins = args.origins,
          destination = args.destination,
          destinations = args.destinations,
          mode = args.mode,
          units = args.units,
          language = args.language,
          avoid = args.avoid,
          sensor = args.sensor,
          key = args.key;

      var batchMode = false;
      index = index || null;
      mode = mode || 'driving';
      units = units || 'metric';
      language = language || 'en';
      avoid = avoid || null;
      sensor = sensor || false;
      key = this.apiKey;

      if (!origin && origins) {
        origins = origins.join('|');
        batchMode = true;
      }
      if (!destination && destinations) {
        destinations = destinations.join('|');
        batchMode = true;
      }
      if (!origins) throw new Error('Argument Error: Origin is invalid');
      if (!destinations) throw new Error('Argument Error: Destination is invalid');

      return Object.assign({
        index: index, origins: origins, destinations: destinations, mode: mode, units: units, language: language, avoid: avoid, sensor: sensor, key: key
      }, batchMode && { batchMode: batchMode }); //only include batchMode if true
    }
    /**
     * Formats the results to... something
     * @method
     * @param  {Object}   data     a response as seen at
     * @param  {Object]}   options  ...
     * @param  {Function} callback error/success handler function(err, data)
     * @return {Object|Object[]} An array of processed result elements
     */

  }, {
    key: 'formatResults',
    value: function formatResults(data, options, callback) {
      /**
       * Processes one element of an API response
       * @function
       * @param  {element} element
       * @return {Object} { index, distance, duration, durationValue, origin,
       *  destination, mode, units, avoid, sensor }
       */
      var formatData = function formatData(element) {
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
        return callback(new Error('Status error: ' + data.status + ': ' + data.error_message));
      }
      var results = [];

      for (var i = 0; i < data.origin_addresses.length; i++) {
        for (var j = 0; j < data.destination_addresses.length; j++) {
          var element = data.rows[i].elements[j];
          var status = element.status;

          if (status != 'OK') {
            return callback(new Error('Result error: ' + resultStatus));
          }
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
  }, {
    key: 'fetchData',

    /**
     * Fetches data
     * @param  {Object}   options  see formatResults's return
     * @param  {Function} callback Error/success handler function(err, data)
     * @return {undefined}
     */
    value: function fetchData(options, callback) {
      fetch(DISTANCE_API_URL + qs.stringify(options)).then(function (response) {
        if (response.status != 200) {
          var error = new Error(response.statusText);
          error.response = response;
          throw error;
        }
        return response;
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        callback(null, response);
      }).catch(function (error) {
        requestError(error, callback);
      });
    }
  }]);
  return GoogleDistance;
}();


// export {GoogleDistance};
var index = new GoogleDistance();

module.exports = index;
//# sourceMappingURL=index.common.js.map
