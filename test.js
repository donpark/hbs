var assert = require('assert');
var hbs = require("./lib/hbs");
var originalPath = hbs.handlebarsPath

var Handlebars = hbs.Handlebars;
assert.ok(Handlebars != null);

var options = {
    message: "foobar"
};

//testing out of the box configuration
var source = "testing {{message}}";
var template = hbs.compile(source, options);
var rendered = hbs.render(template, options);
assert.equal('testing foobar', rendered);

//fake handlebars conforming interface, just extend it
var FakeHandlebars = Object.create(Handlebars) 
FakeHandlebars.compile = function(source, options) {
    return function(template, options) {
        return source;
    }
}
  
FakeHandlebars.render = function(tpl, options) {
    return tpl();
}

module.exports = FakeHandlebars;

//setting handlebars to fake version
hbs.Handlebars = FakeHandlebars;
var template = hbs.compile(source, options);
var rendered = hbs.render(template, options);
assert.equal('testing {{message}}', rendered);

//changing require path to go back to path of real handlebars
hbs.handlebarsPath = originalPath;
var template = hbs.compile(source, options);
var rendered = hbs.render(template, options);
assert.equal('testing foobar', rendered);

//changing require path to use this file (which exports fake version)
hbs.handlebarsPath = __filename;
var template = hbs.compile(source, options);
var rendered = hbs.render(template, options);
assert.equal('testing {{message}}', rendered);


// Go back
hbs.handlebarsPath = originalPath;
assert.notEqual(hbs.handlebars, FakeHandlebars, "Didn't change it back")

// Partials
var sourceWithPartial = "testing {{>partial}}"
hbs.registerPartial("partial", "inner {{message}}")
var template = hbs.compile(sourceWithPartial, options);
var rendered = hbs.render(template, options);
assert.equal('testing inner foobar', rendered);

// Helpers
var sourceWithHelper = "testing {{help message}}"
hbs.registerHelper("help", function(message) {
    return "hi " + message
})
var template = hbs.compile(sourceWithHelper, options);
var rendered = hbs.render(template, options);
assert.equal('testing hi foobar', rendered);


// Partials from directory

hbs.partials(__dirname + "/test/partials", function(err) {
    assert.ifError(err)
    
    var template = hbs.compile("testing {{>test}}", options);
    var rendered = hbs.render(template, options);
    assert.equal('testing partial foobar', rendered);
})

// Helpers from a module

hbs.helpers(require('./test/manyHelpers'))
var template = hbs.compile("testing {{hello message}}", options);
var rendered = hbs.render(template, options);
assert.equal('testing hello foobar', rendered);

var template = hbs.compile("testing {{#bold}}asdf{{/bold}}", options);
var rendered = hbs.render(template, options);
assert.equal('testing <b>asdf</b>', rendered);

