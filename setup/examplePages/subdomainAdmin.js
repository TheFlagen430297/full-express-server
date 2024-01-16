const EXPRESS = require("express")();
const fs = require(`fs`);
const cookieParser = require('cookie-parser');
EXPRESS.use(cookieParser())

EXPRESS.get("*", (req, res) => {
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

exports.default = EXPRESS
