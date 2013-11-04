var util = require('util');
var path = require('path');
var _ = require('lodash');
var yeoman = require('yeoman-generator');

var prompts = {
  name: {
    type: 'input',
    message: 'Name',
    default: _.last(process.cwd().split(require('path').sep))
  },
  bootstrap: {
    type: 'confirm',
    message: 'HTML5 template using Bootstrap 3 and LessCSS',
    default: true,
    bower: {
      dependencies: {
        'bootstrap': '~3.0.1',
      }
    },
    npm: {
      devDependencies: {
        'grunt-contrib-less': '~0.8.1',
        'grunt-usemin': '~2.0.0',
        'grunt-contrib-concat': '~0.3.0',
        'grunt-contrib-htmlmin': '~0.1.3',
        'grunt-contrib-cssmin': '~0.6.2',
        'grunt-rev': '~0.1.0',
        'grunt-contrib-uglify': '~0.2.5',
      }
    }
  },
  node: {
    type: 'confirm',
    message: 'Enable NodeJS backend',
    default: true,
    npm: {
      dependencies: {
        'express': '~3.4.4',
        'lodash': '~2.2.1',
      }
    }
  },
  proxy: {
    type: 'confirm',
    message: 'Proxy another server e.g. under /api',
    default: false,
    when: function(props) {
      return !props.node;
    }
  },
  angular: {
    type: 'confirm',
    message: 'Enable AngularJS',
    default: false,
    npm: {
      devDependencies: {
        'grunt-ngmin': '0.0.3',
      }
    }
  },
  mocha: {
    type: 'confirm',
    message: 'Use Mocha+Chai.js for Node unittests',
    default: true,
    when: function(props) {
      return props.node;
    }
  },
  karma: {
    type: 'confirm',
    message: 'Use Karma for Angular e2e tests',
    default: true,
    when: function(props) {
      return props.angular;
    }
  }
};

var SuperGenerator = module.exports = function(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.on('end', function() {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SuperGenerator, yeoman.generators.Base);

SuperGenerator.prototype.askFor = function() {
  var cb = this.async();

  var mapNames = function(v, k) {
    return _.extend(v, {name: k});
  };

  this.prompt(_.map(prompts, mapNames), function(props) {
    console.log(props);
    // FIXME: options with dependencies might be undefined
    _.extend(this, {mocha: false, karma: false}, props);

    var dependencies = {};
    var devDependencies = {
      'grunt-contrib-watch': '~0.5.3',
      'matchdep': '~0.3.0',
      'grunt': '~0.4.1',
      'grunt-contrib-copy': '~0.4.1',
      'grunt-env': '~0.4.0',
      'grunt-contrib-clean': '~0.5.0',
      'grunt-preprocess': '~3.0.1',
    };
    var bowerDependencies = {};

    var enabled = _.omit(props, function(v) { return v !== true; });
    console.log(enabled);
    _(enabled).map(function(v, k) { return prompts[k]; }).each(function(promp) {
      if (promp.npm) {
        _.extend(dependencies, promp.npm.dependencies || {});
        _.extend(devDependencies, promp.npm.devDependencies || {});
      }

      if (promp.bower) {
        _.extend(bowerDependencies, promp.bower.dependencies || {});
      }
    });

    this.deps = JSON.stringify(dependencies, null, 4);
    this.devDeps = JSON.stringify(devDependencies, null, 4);
    this.bowerDeps = JSON.stringify(bowerDependencies, null, 4);

    cb();
  }.bind(this));
};

SuperGenerator.prototype.app = function() {
  this.mkdir('app');
  this.mkdir('app/templates');

  if (this.node) {
    this.mkdir('backend');
  }

  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');
};

SuperGenerator.prototype.projectfiles = function() {
  this.copy('jshintrc', '.jshintrc');
};
