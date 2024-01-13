const express = require("express");
const admin = express(); //! This line must match the subdomain name (admin.example.com) that you want to use
const fs = require(`fs`);
const cookieParser = require('cookie-parser');
admin.use(cookieParser()) //! This line must match the express(); call above (admin.use(...);)

admin.get("*", (req, res) => { //! This line must match the express(); call above (admin.get(...);)
    let fileEndRex = /(?:\/)(?:.*)(?:\.)(.*)/
	if (req.path == `/`) res.status(200).send(`cool`)
    else {
        if (fileEndRex.test(req.path) && fileEndRex.exec(req.path)[1].length > 0) {
            if (fs.existsSync(__dirname + req.path)) res.status(200).sendFile(__dirname + req.path)
            else res.status(404).send({ status: 404, message: `This file dose not exists at ${req.path}`, origin: "cdn" })
        } else {
            if (fs.existsSync(__dirname + req.path + `.html`)) res.status(200).sendFile(__dirname + req.path  + `.html`)
            else if (fs.existsSync(__dirname + req.path + `/index.html`)) res.status(200).sendFile(__dirname + req.path + `/index.html`)
            else res.status(404).send({ status: 404, message: `The path "${req.path}" is invalid`})
        }
    }
});

exports.admin = admin; //! This line must match the subdomain that you want to use (admin.example.com) at "exports.<subdomain> = <express(); call>", these must match
//? The file name does not matter
