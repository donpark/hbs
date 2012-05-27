// builtin
var fs = require('fs');
var assert = require('assert');

// 3rd party
var express = require('express');
var request = require('request');

// local
var hbs = require('../../');

var app = express();

// manually set render engine, under normal circumstances this
// would not be needed as hbs would be installed through npm
app.engine('hbs', hbs.__express);

// set the view engine to use handlebars
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.use(express.static(__dirname + '/public'));

// value for async helper
// it will be called a few times from the template
var vals = ['foo', 'bar', 'baz'];
hbs.registerAsyncHelper('async', function(context, cb) {
  process.nextTick(function() {
    cb(vals.shift());
  });
});

app.get('/', function(req, res){
  res.render('async', {
    layout: false
  });
});

test('async', function(done) {
  var server = app.listen(3000, function() {

    var expected = fs.readFileSync(__dirname + '/../fixtures/async.html', 'utf8');

    request('http://localhost:3000', function(err, res, body) {
      assert.equal(body, expected);
      server.close();
    });
  });

  server.on('close', function() {
    done();
  });
});
