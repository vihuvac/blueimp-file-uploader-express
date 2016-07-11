Blueimp file uploader for Express js
====================================

[![Build Status](https://travis-ci.org/vihuvac/blueimp-file-uploader-express.svg?branch=master)](https://travis-ci.org/vihuvac/blueimp-file-uploader-express) [![Gitter](https://badges.gitter.im/vihuvac/blueimp-file-uploader-express.svg)](https://gitter.im/vihuvac/blueimp-file-uploader-express?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![License](http://tools.vihuvac.com/images/collection/git-docs/license-mit.svg)](https://github.com/vihuvac/blueimp-file-uploader-express/blob/master/LICENSE)

[![NPM](https://nodei.co/npm/blueimp-file-uploader-express.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/blueimp-file-uploader-express/)

A simple express module for integrating the *[jQuery File Upload](http://blueimp.github.io/jQuery-File-Upload/)* frontend plugin.

## Contents

* [History](#history)
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage with options](#usage-with-options)
* [SSL Support](#ssl-support)
* [Multiple thumbnails](#multiple-thumbnails)
* [Tests](#tests)
* [Contributions](#contributions)


## History
The code was forked from a sample backend code from the [plugin's repo](https://github.com/blueimp/jQuery-File-Upload/wiki/Setup). Adaptations were made to show how to use this plugin with the popular *[Express](http://expressjs.com/)* *Node.js* framework.

Although this code was initially meant for educational purposes, enhancements were made. Users can additionally:

* upgrade lwip to version 0.0.6 or higher to support gif images.
* choose the destination filesystem, local or cloud-based *Amazon S3*.
* create thumbnail without heavy external dependencies using [lwip](https://www.npmjs.com/package/lwip).
* setup server-side rules by [configuration](#Configuration).
* modify the code against a [test harness](#Tests).

## Installation

Setup an *Express Project* and install the package.

```js
$ npm install blueimp-file-uploader-express --save
```

## Configuration
```js
options = {
    tmpDir: __dirname + "/public/tmp",      // tmp dir to upload files to
    uploadDir: __dirname + "/public/files", // actual location of the file
    uploadUrl: "/files/",                   // end point for delete route
    maxPostSize: 11000000000,               // 11 GB
    minFileSize: 1,
    maxFileSize: 10000000000,               // 10 GB
    acceptFileTypes: /.+/i,
    inlineFileTypes: /\.(gif|jpe?g|png)/i,
    imageTypes:  /\.(gif|jpe?g|png)/i,
    copyImgAsThumb: true,                   // required
    imageVersions: {
        maxWidth: 200,
        maxHeight: 200
    },
    accessControl: {
        allowOrigin: "*",
        allowMethods: "OPTIONS, HEAD, GET, POST, PUT, DELETE",
        allowHeaders: "Content-Type, Content-Range, Content-Disposition"
    },
    storage: {
        type: "local",                                     // local or aws
        aws: {
            accessKeyId: "xxxxxxxxxxxxxxxxx",              // required if aws
            secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxx",    // required if aws
            region: "sa-east-1",                           // make sure you know the region, else leave this option out
            bucketName: "xxxxxxxxx",                       // required if aws
            path: "some-directory-in-your-bucket/"         // optional if aws
        }
    }
};

```
### Usage with options
```js
// config the uploader
var options = {
    tmpDir:  __dirname + "/../public/uploaded/tmp",
    uploadDir: __dirname + "/../public/uploaded/files",
    uploadUrl:  "/uploaded/files/",
    maxPostSize: 11000000000, // 11 GB
    minFileSize:  1,
    maxFileSize:  10000000000, // 10 GB
    acceptFileTypes:  /.+/i,
    // Files not matched by this regular expression force a download dialog,
    // to prevent executing any scripts in the context of the service domain:
    inlineFileTypes:  /\.(gif|jpe?g|png)/i,
    imageTypes:  /\.(gif|jpe?g|png)/i,
    copyImgAsThumb: true, // required
    imageVersions: {
        maxWidth: 200,
        maxHeight: 200
    },
    accessControl: {
        allowOrigin: "*",
        allowMethods: "OPTIONS, HEAD, GET, POST, PUT, DELETE",
        allowHeaders: "Content-Type, Content-Range, Content-Disposition"
    },
    storage: {
        type: "aws",
        aws: {
            accessKeyId: "xxxxxxxxxxxxxxxxx",
            secretAccessKey: "xxxxxxxxxxxxxxxxx",
            region: "sa-east-1", // make sure you know the region, else leave this option out
            bucketName: "xxxxxxxxxxxxxxxxx"
        }
    }
};


// Init the uploader
var uploader = require("blueimp-file-uploader-express")(options);


module.exports = function (router) {
    router.get("/upload", function (req, res) {
        uploader.get(req, res, function (err, obj) {
            res.send(JSON.stringify(obj));
        });
    });

    router.post("/upload", function (req, res) {
        uploader.post(req, res, function (err, obj) {
            res.send(JSON.stringify(obj));
        });
    });

    /**
     * The path SHOULD match options.uploadUrl
     *
     * If you are using the optional parameter path: for aws, you need to pass the reference before the file name, e.g:
     * router.delete("/uploaded/files/:directory/:name", function (req, res) {}
     *
     * Otherwise just pass a single reference, e.g:
     * router.delete("/uploaded/files/:name", function (req, res) {}
     */
    router.delete("/uploaded/files/:name", function (req, res) {
        uploader.delete(req, res, function (err, obj) {
            res.send(JSON.stringify(obj));
        });
    });

    return router;
}
```

> **Note**:
>
> You can use the optional parameter ```path``` in order to store images in that specific directory.

### SSL Support

Set the `useSSL` option to `true` to use the package with an [HTTPS server](http://expressjs.com/4x/api.html#app.listen).

```js
var express = require("express"),
    fs      = require("fs"),
    https   = require("https"),
    app     = express()
;


// config the uploader
var options = {
    ...
    useSSL: true
    ...
};

// init the uploader
var uploader = require("blueimp-file-uploader-express")(options);

app.get("/upload", function(req, res) {
    uploader.get(req, res, function (err,obj) {
    if(!err)
        res.send(JSON.stringify(obj));
})
app.post("/upload", // ...
app.delete("/uploaded/files/:name", // ...

// create the HTTPS server
var app_key = fs.readFileSync("key.pem");
var app_cert = fs.readFileSync("cert.pem");

https.createServer({key: app_key, cert: app_cert}, app).listen(443);

```

### Multiple thumbnails

To generate multiple thumbnails while uploading.

```js
var options = {
    tmpDir: __dirname + "/../public/uploaded/tmp",
    uploadDir: __dirname + "/../public/uploaded/files",
    uploadUrl: "/uploaded/files/",
    copyImgAsThumb: true, // required
    imageVersions: {
        maxWidth: 200,
        maxHeight: 200
    },
    storage: {
        type: "local"
    }
};
```
`copyImgAsThumb` needs to be set to true. `imageVersions`, `maxWidth` and `maxHeight` will by default create a `thumbnail` folder and place the specified width/height thumbnail in it.

Optionally, you can omit the `maxHeight`. In this case, it will be resize proportionally to the specified width.

```js
imageVersions: {
    maxWidth: 200
},
```

also

```js
imageVersions: {
    maxWidth: 200,
    maxHeight : "auto"
},
```

PS : `auto` value works only with height.

You can also specify multiple thumbnail generations like

```js
var options = {
    tmpDir: __dirname + "/../public/uploaded/tmp",
    uploadDir: __dirname + "/../public/uploaded/files",
    uploadUrl: "/uploaded/files/",
    copyImgAsThumb: true,
    imageVersions: {
        maxWidth: 200,
        maxHeight: "auto",
        "large" : {
            width : 600,
            height : 600
        },
        "medium" : {
            width : 300,
            height : 300
        },
        "small" : {
            width : 150,
            height : 150
        }
    },
    storage: {
        type: "local"
    }
};
```

Refer to : [How to submit additional form data](https://github.com/blueimp/jQuery-File-Upload/wiki/How-to-submit-additional-form-data) to send additional form data from the client.

## Tests

Unit tests can be run with *Jasmine* using `npm test` or this command:

```js
$ jasmine-node specs/
```

## Contributions

Changes and improvements are welcome! Feel free to fork and open a pull request.

### To Do
* Make [Configuration](#configuration) documentation clearer and shorter.
* Refactor code to build tests and provide generic transports as in `winston`.
* Write end to end tests with [WebdriverIO](http://webdriver.io/).
* Provide a basic image processing pipeline (resizing, croping, filter effects).
* Fix AWS thubnail issue (preview at uploading).
* Provide access to other cloud-based services like *Microsoft Azure*.
