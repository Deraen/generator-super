var express = require('express');
var app = express();

var config = require('./config');

config.init(app);

// Consider moving controller definition into another file
app.get('/', function(req, res) {
  res.send('Hello world');
});

if (process.env.NODE_ENV === 'test') {
    console.log('Exporting app for test framework');
    module.exports = app;
} else {
    app.listen(app.get('port'), function() {
        console.log('App running on port ' + app.get('port'));
    });
}
