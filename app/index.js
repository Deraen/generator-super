var util = require('util');
var path = require('path');
var _ = require('lodash');
var yeoman = require('yeoman-generator');

var arrayRef = [];
var push = arrayRef.push;

var prompts = {
  name: {
    type: 'input',
    message: 'Name',
    default: _.last(process.cwd().split(require('path').sep))
  },
  bootstrap: {
    type: 'confirm',
    message: 'HTML5 template using Bootstrap 3 and LessCSS',
    default: false,
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
    message: 'Enable NodeJS',
    default: true,
    npm: {
      dependencies: {
        'lodash': '~2.4.1',
      }
    },
    files: {
      'src/index.js': 'node/index.js',
    }
  },
  express: {
    type: 'confirm',
    message: 'Enable Express backend',
    default: false,
    npm: {
      dependencies: {
        'express': '~3.4.6',
      }
    },
    files: {
      'src/index.js': 'express/index.express.js',
      'src/config.js': 'express/config.js',
    },
    when: function(props) {
      return props.node;
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
    },
    when: function(props) {
      return props.bootstrap;
    }
  },
  mocha: {
    type: 'confirm',
    message: 'Use Mocha+Chai.js for Node unittests',
    default: true,
    npm: {
      devDependencies: {
        'grunt-mocha-test': '~0.8.1',
        'chai': '~1.8.1',
      },
    },
    files: {
      'test/unit/example.js': 'test/unit/example.js',
    },
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

function indent(text, spaces) {
  if (!text) return '';
  return text.replace(/\n/g, '\n  ');
}

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
    _.extend(this, {mocha: false, angular: false, karma: false}, props);

    var dependencies = {};
    var devDependencies = {
      'grunt-contrib-watch': '~0.5.3',
      'load-grunt-tasks': '~0.2.0',
      'grunt': '~0.4.1',
      'grunt-contrib-copy': '~0.4.1',
      'grunt-env': '~0.4.0',
      'grunt-contrib-clean': '~0.5.0',
      'grunt-preprocess': '~3.0.1',
    };
    var bowerDependencies = {};

    var enabledProps = _.omit(props, function(v) { return v !== true; });
    console.log(enabledProps);

    var enabled = _.map(enabledProps, function (v, k) { console.log(v, k); return prompts[k]; });
    console.log(enabled);

    this.files = _.merge.apply(null, _.pluck(enabled, 'files'));

    var deps = _.merge.apply(null, _.pluck(enabled, 'npm')) || {};
    console.log(deps);
    this.deps = indent(JSON.stringify(deps.dependencies, null, 2));
    this.devDeps = indent(JSON.stringify(_.extend(devDependencies, deps.devDependencies), null, 2));

    var bower = _.merge.apply(null, _.pluck(enabled, 'bower')) || {};
    console.log(bower);
    this.bowerDeps = indent(JSON.stringify(bower.dependencies, null, 2));

    cb();
  }.bind(this));
};

SuperGenerator.prototype.app = function() {
  this.template('_package.json', 'package.json');
  this.template('_bower.json', 'bower.json');
  this.template('_Gruntfile.js', 'Gruntfile.js');

  console.log('files', this.files);
  _.each(this.files, function(from, to) {
    this.template(from, to);
  }.bind(this));
};

SuperGenerator.prototype.projectfiles = function() {
  this.copy('jshintrc', '.jshintrc');
};
