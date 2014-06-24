var path = require('path');

module.exports = function (rl, done) {
    var HOME = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;

    var configFile = path.join(HOME, '.track-your-damn-time.json');
    var config;

    try {
        config = require(configFile);
    } catch (e) {
    }

    config = config || {};

    if (!config.dataDir) {
        var mkdirp = require('mkdirp');
        var fs = require('fs');
        rl.question("Where should we store the data? ", function (answer) {
            answer = answer.trim();
            if (answer[0] === '~') {
                answer = path.join(HOME, answer.substr(1));
            }

            config.dataDir = answer;
            mkdirp(answer, function (err) {
                fs.writeFile(configFile, JSON.stringify(config, null, 2), function () {
                    done(config);
                });
            });
        });
    } else {
        done(config);
    }
};
