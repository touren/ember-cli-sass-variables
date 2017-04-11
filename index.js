/* jshint node: true */
'use strict';

var fs = require('fs');
var filendir = require('filendir');
var camelCase = require('lodash.camelcase');
var stripComments = require('strip-json-comments');
var _ = require('lodash');

// (c) 2007 Steven Levithan <stevenlevithan.com>
// MIT License
// From: http://blog.stevenlevithan.com/archives/javascript-match-nested

/*** matchRecursive
	accepts a string to search and a format (start and end tokens separated by "...").
	returns an array of matches, allowing nested instances of format.

	examples:
		matchRecursive("test",          "(...)")   -> []
		matchRecursive("(t(e)s)()t",    "(...)")   -> ["t(e)s", ""]
		matchRecursive("t<e>>st",       "<...>")   -> ["e"]
		matchRecursive("t<<e>st",       "<...>")   -> ["e"]
		matchRecursive("t<<e>>st",      "<...>")   -> ["<e>"]
		matchRecursive("<|t<e<|s|>t|>", "<|...|>") -> ["t<e<|s|>t"]
*/
var matchRecursive = function () {
	var	formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
		metaChar = /[-[\]{}()*+?.\\^$|,]/g,
		escape = function (str) {
			return str.replace(metaChar, "\\$&");
		};

	return function (str, format) {
		var p = formatParts.exec(format);
		if (!p) throw new Error("format must include start and end tokens separated by '...'");
		if (p[1] == p[2]) throw new Error("start and end format tokens cannot be identical");

		var	opener = p[1],
			closer = p[2],
			/* Use an optimized regex when opener and closer are one character each */
			iterator = new RegExp(format.length == 5 ? "["+escape(opener+closer)+"]" : escape(opener)+"|"+escape(closer), "g"),
			results = [],
			openTokens, matchStartIndex, match;

		do {
			openTokens = 0;
			while (match = iterator.exec(str)) {
				if (match[0] == opener) {
					if (!openTokens)
						matchStartIndex = iterator.lastIndex;
					openTokens++;
				} else if (openTokens) {
					openTokens--;
					if (!openTokens)
						results.push(str.slice(matchStartIndex, match.index));
				}
			}
		} while (openTokens && (iterator.lastIndex = matchStartIndex));

		return results;
	};
}();

var findList = function(value) {
  let list = matchRecursive(value, "(...)");
  if (_.size(list) > 0) {
    let nextLevelList = matchRecursive(list[0], "(...)");
    if (_.size(nextLevelList) > 0) {
      let newValue=[];
      _.forEach(nextLevelList, (valueString) => {
        newValue.push(findList( '(' + valueString + ')' ));
      });
      return newValue;
    } else {
      return list[0].split(',');
    }
  } else {
    return value;
  }
};
//import matchRecursive from './matcher.js';
/**
  `getVariables` is taken from https://github.com/nordnet/sass-variable-loader
*/
var getVariables = function(content) {
  const variableRegex = /\$(.+):\s+(.+);/;
  const variables = {};
  let lines = "";

  stripComments(content).split('\n').forEach(line => {
    lines += line.trim();
    const variable = variableRegex.exec(lines);
    if (!variable) { return; }
    lines = "";

    const key = variable[1].trim();
    const name = camelCase(key);
    const value = variable[2].replace(/!default|!important/g, '').trim();

    variables[key] = findList(value);
    variables[name] = variables[key];
    // console.log(variables);
    return;
  });

  return variables;
};

module.exports = {
  name: 'ember-cli-sass-variables',
  included: function(app) {
    this.app = app;

    if (typeof app.import !== 'function' && app.app) {
      this.app = app = app.app;
    }

    this._super.included.apply(this, arguments);
    this.appDir = this.app.options.appDir || 'app';
    this.variablesFile = this.app.options.sassVariables || null;
  },
  postBuild: function(result) {
    if (this.variablesFile) {
      var outputPath = this.appDir + '/utils/sass-variables.js';
      var sassVariables = null;
      var outputFile = null;

      var file = fs.readFileSync(this.variablesFile, 'utf8');
      if (file) {
        sassVariables = getVariables(file);
        var utilObject = `/* eslint-disable */\n/* jshint ignore:start */\n// DON'T UPDATE THIS FILE MANUALLY, IT IS AUTO-GENERATED.\nconst sassVariables = JSON.parse(\`${JSON.stringify(sassVariables)}\`);\n\nexport default sassVariables;\n/* jshint ignore:end */`;
        try {
          outputFile = fs.readFileSync(outputPath, 'utf8');
        } catch(error) {}

        if (outputFile !== utilObject) {
          console.log('ember-cli-sass-variables');
          filendir.writeFileSync(outputPath, utilObject, 'utf8');
        }
      } else {
        console.warn('Please configure the `sassVariables: \'styles/_variables.scss\'` object in ember-cli-build.js`');
      }
    }
    return result;
  }
};
