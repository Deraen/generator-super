# generator-super

WIP. Doesn't work yet.

A generator for [Yeoman](http://yeoman.io).

Start a complete backend and frontend project using various technologies.

This doesn't offer commands to e.g. create new controllers for AngularJS,
and I don't see that as particularly useful feature. (Use editor snippets or something)

## Features

- [x] Grunt
- [x] Node.js
- [ ] Express backend
- [x] Mocha + Chai.js tests
- [ ] OR Proxy another backend
  - e.g. forward calls to /api to Scala backend on localhost:3000
- [ ] HTML5 template with Boostrap 3 LESS
- [ ] AngularJS
  - [ ] Karma tests

## Ideas

1. ClojureScript
  1. Write tests or backend code using cljsc?
  2. Write frontend using cljsc (Doesn't seem that good idea with AngularJS, maybe in future...)
2. Clojure backend
  1. Should probably leverage separate Lein template
3. Write additional cookbook
  1. How to configure Karma to use IEVMS for IE testing?
  2. And other useful Grunt stuff
4. Heroku/Dokku deployment
  1. Use buildpack which runs bower+grunt in addition to npm
