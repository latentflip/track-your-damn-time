var path = require('path');
var glob = require('glob');
var colors = require('colors');
var moment = require('moment');
var fs = require('fs');

module.exports = function (dataDir, done) {
    console.log('');

    glob(path.join(dataDir, '**', '*.txt'), function (err, files) {
        files.forEach(function (f) {
            var date = path.basename(f, '.txt');
            console.log(moment(date, 'YYYY-MM-DD').format('ddd, Do MMM YYYY').bold);
            console.log(fs.readFileSync(f).toString());
            console.log('');
        });
        done();
    });
};
