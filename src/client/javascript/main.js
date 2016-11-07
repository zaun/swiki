(function () {
  'use strict';

  riot.mount('*');
  window.app = {};


  app.resourceService = new ResourceService({
    endpoint: 'https://lf3p07bvm8.execute-api.us-west-2.amazonaws.com/swikiTesting'
  })

  var test = app.resourceService.read('/document');
  console.log(test);
}());
