var fs = require("fs");


/**
 * It checks if a directory exists in the file system, otherwise it creates it.
 *
 * @param {String} path     path or directory
 * @param {Number} mask     mask for directory (permissions into fs)
 * @param {Function} cb     callback
 * @return                  returns the specified path or directory
 */
module.exports = function directoryChecker(path, mask, cb) {
    // It allows the `mask` parameter to be optional.
    if (typeof mask === "function") {
        cb = mask;
        mask = 0777;
    }

    return fs.mkdir(path, mask, function(err) {
        console.log("Checking if the " + "[ " + path + " ]" + " directory exists...!");
        if (err) {
            if (err.code === "EEXIST") {
                console.log("The " + "[ " + path + " ]" + " already exists.");
                cb(null);   // It ignores the error if the directory already exists.
            } else {
                console.log("The directory does not exist and cound not be created!");
                cb(err);    // Something else went wrong (typically in windows systems).
            }
        } else {
            console.log("The " + "[ " + path + " ]" + " was successfully created!");
            cb(null);       // The directory was successfully created.
        }
    });
};
