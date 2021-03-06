/* jshint node: true */
/* global require, module */

'use strict';

var EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
var mergeTrees = require('broccoli-merge-trees');
var find       = require('broccoli-stew').find;

var app = new EmberAddon({});

function treeGenerator (dir) {
    return {
        read: function () { return dir; },
        cleanup: function () { }
    }
};

var templateCompilerTree = find(treeGenerator(app.bowerDirectory + '/ember'), {
    files:   ['ember-template-compiler.js'],
    srcDir:  '/',
    destDir: '/assets/tests/'
});

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

module.exports = mergeTrees([templateCompilerTree, app.toTree()]);
