#!/usr/bin/env node

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var readline = require('readline');
var today = moment();

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

dataDir = process.argv[2];
start = moment(process.argv[3] || "2014-06-20", 'YYYY-MM-DD');

if (process.argv[2] === 'log') {
    var log = require('./lib/logData');
    dataDir = process.argv[3];

    withConfig(rl, function (config) {
        log(config.dataDir, function (err) {
            process.exit(0);
        });
    });

    return;
}
var withConfig = require('./lib/config');

withConfig(rl, function (config) {
    checkDatesFrom(moment().subtract({ days: 3 }), config.dataDir, function () {
        process.exit(0);
    });
});

function dataExistsForDate(date, dataDir, done) {
    var p = makeFilename(date, dataDir);
    done(fs.existsSync(p));
}

function getTimesFromPrompt(date, done) {
    var day = humanizeDate(date);
    var answers = [];

    rl.question("What the heck did you do " + day + "? (hours - task) ", function (answer) {
        if (answer.trim() === '') {
            done("None entered");
        } else {
            answers.push(answer);
            getMoreTimes(function (more) {
                if (!Array.isArray(more)) more = [more];
                done(null, answers.concat(more));
            });
        }
    });
}

function getMoreTimes(done) {
    var answers = [];
    rl.question("What else? ", function (answer) {
        if (answer.trim() === '') {
            done([]);
        } else {
            answers.push(answer);
            getMoreTimes(function (more) {
                done(answers.concat(more));
            });
        }
    });
}

function makeFilename(date, dataDir) {
    return path.join(dataDir, date.format("YYYY-MM-DD.txt"));
}

function checkAndPopulate(date, dataDir, done) {
    dataExistsForDate(date, dataDir, function (exists) {
        if (exists) return done();

        getTimesFromPrompt(date, function (err, results) {
            if (err) {
                console.log('Nothing entered for', date.toString());
                return done();
            }

            fs.writeFile(makeFilename(date, dataDir), results.join('\n') + '\n', done);
        });
    });
}

function checkDatesFrom(start, dataDir, done) {
    if (start.day() === 0 || start.day() === 6) {
        //console.log(humanizeDate(start), 'was the weekend');
        return checkDatesFrom(start.clone().add({ days: 1 }), dataDir, done);
    }

    //Don't do future things
    if (start.isAfter(moment())) return done();

    //Do today if after 4pm
    if (start.isSame(moment(), 'day') && moment().hour() < 16) return done();

    checkAndPopulate(start, dataDir, function (err) {
        if (err) throw err;
        checkDatesFrom(start.clone().add({ days: 1 }), dataDir, done);
    });
}


function humanizeDate(date) {
    return date.calendar().split(' at ')[0];
}
