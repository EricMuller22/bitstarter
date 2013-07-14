#!/usr/bin/env node
/*
Automatically grade files for the presence of specific HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development and basic DOM parsing.

References:

  + cheerio
    - https://github.com/MatthewMueller/cheerio
    - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
    - http://maxogden.com/scarping-with-node.HTML

  + commander.js
    - https://github.com/visionmedia/commander.js
    - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

  + JSON
    - http://en.wikipedia.org/wiki/JSON
    - https://developer.mozilla.org/en-US/docs/JSON
    - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var rest = require('restler');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function (infile) {
  var instr = infile.toString();
  if (!fs.existsSync(instr)) {
    console.log("%s does not exist. Exiting.", instr);
    process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
  }
  return instr;
};

var cheerioHtmlFile = function (htmlfile) {
  return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function (checksfile) {
  return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function (htmlresult, checksfile) {
  $ = htmlresult;
  var checks = loadChecks(checksfile).sort();
  var out = {};
  for (var ii in checks) {
    var present = $(checks[ii]).length > 0;
    out[checks[ii]] = present;
  }
  return out;
};

var clone = function (fn) {
  // Workaround for commander.js issue.
  // http://stackoverflow.com/a/6772648
  return fn.bind({});
};

if (require.main == module) {
  var page, checkJson, outJson;

  program
    .option('-c --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-u --url <html_file>', 'URL to check')
    .option('-f --file <html_file>', 'HTML file to check', clone(assertFileExists))
    .parse(process.argv);

  if (program.url) {
    rest.get(program.url).on('complete', function (result) {
      page = cheerio.load(result);
      checkJson = checkHtmlFile(page, program.checks);
      outJson = JSON.stringify(checkJson, null, 4);
      console.log(outJson);
    });
  }
  else if (program.file) {
    page = cheerioHtmlFile(program.file);
    checkJson = checkHtmlFile(page, program.checks);
    outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
  }
  else {
    console.log("Please input a web URL or a filename to check");
  }
}
else {
  exports.checkHtmlFile = checkHtmlFile;
}