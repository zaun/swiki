(function () {
  'use strict';

  window.ResourceService = function (options) {
    options = _.defaults(options, {
      endpoint: 'http://localhost',
      headers: {},
      cache: 'default',
      credentials: 'same-origin'
    });

    var checkStatus = function (response) {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else {
        var error = new Error(response.status + ' ' + response.statusText)
        error.response = response
        throw error
      }
    }

    var service = {
      read: function (resourcePath) {
        return fetch(options.endpoint + resourcePath, {
          method: 'GET',
          headers: options.headers,
          mode: 'cors',
          cache: options.cache,
          credentials: options.credentials
        })
        .then(checkStatus)
        .then(function (response) {
          return response.json();
        });
      }
    };

    return service;
  }
}());
