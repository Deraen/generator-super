var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var st = require('st');


module.exports = {
  init: function(app) {
    app.set('port', process.env.PORT || 8000);
    app.set('mongo', process.env.MONGO || process.env.MONGOLAB_URI);

    app.use(express.urlencoded());
    app.use(express.json());
    app.use(express.compress());

    if (process.env.NODE_ENV === 'production') {
      app.use(st({
        path: 'dist',
        url: '/',
        index: 'index.html',
        passthrough: true,
      }));
    } else {
      app.use(express.static(path.resolve('.tmp')));
      app.use(express.static(path.resolve('frontend')));
    }

    if (process.env.NODE_ENV === 'development') {
      app.use(express.logger('dev'));
    }
  },
};
