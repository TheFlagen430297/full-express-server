const express = require("express")();
const { stat, readFileSync } = require(`fs`);
const { log } = require(`console`)
const cookieParser = require('cookie-parser');

express.use(cookieParser());

let ess = require(`../../ExpressServerSettings/config.json`);

express.get("*", ({ path, query }, res) => {
    let privateURL = JSON.parse(readFileSync(`${__dirname}/private.json`));
    if (path == privateURL.find((url) => url == path)) return res.status(403).send({status: 403, message: `link private.`})
    else if (path == `/favicon.ico`) { //? Browsers will make a url request for a favicon, so this allows you to decide whether you wish to give a favicon via a url request.
        //[TheFlagen430297] Browsers requesting the favicon via a url request is stupid, it is not recommended and it is recommended to set your favicon in your HTML code.
        //[TheFlagen430297] But, you can change this in "./src/ExpressServerSettings/config.json"
        //[TheFlagen430297] If you use this method, you need to have a image file called "favicon.ico" in "./src/public_html" and in any subdomains.
        if (ess.useFaviconRequest) stat(`${__dirname}/favicon.ico`, (e) => e ? res.status(404).send({ status: 404, message: `Ohh okay, odd... The favicon.ico couldn't be found.`}) : res.status(200).sendFile(`${__dirname}/favicon.ico`))
        else res.status(405).send({ status: 405, message: `Querying /favicon.ico is disabled on this server, please set your favicon in your HTML Code.`});
    } else if (path == `/controls`) {
        if (Object.keys(query).length == 0) return res.status(400).send({ status: 400, message: `...` })
        let { kill, createNewSubdomain } = require(`./controls.js`);
        let users = JSON.parse(readFileSync(`${__dirname}/user.json`))
        if (query.type === `kill`) {
            if (!Object.keys(query).includes(`oauth`)) return res.status(400).send({ status: 400, message: `missing oauth param.` });
            if (!Object.keys(query).includes(`user`)) return res.status(400).send({ status: 400, message: `missing user param.` });
            users.forEach((user, index, array) => {
                if (query.user == user.name) {
                    if (user.permissions.includes(`kill`) || user.permissions.includes(`adminstrator`)) {
                        if (query.oauth === `2546`) {
                            res.status(200).send({ status: 200, message: `The server shut down.` })
                            kill(Object.keys(query).length > 0 ? (query.code ? query.code : 0) : 0);
                        } else res.status(403).send({ status: 403, message: `oauth param incorrect` });
                    } else return res.status(403).send({ status: 403, message: `no permission` })
                } else if (index == array.length - 1) return res.status(404).send({ status: 404, message: `user not found` });
            })
        } else return res.status(400).send({ status: 400, message: `The type of the action does not exist.` });
    } else stat(`${__dirname}${path}`, (e) => { //? Checks to see if the files exist for the request
        //TODO: Use "e" to see why it errored, and respond more correctly.
        if (e) return error(404); //? If the file does not exist, then throw error
        else if (path == "/") { //? If there are no params on the request, then treats it differently.
            //? Checks to see if the basePage exists.
            stat(`${__dirname}/${ess.basePage}`, (e) => {
                //TODO: Use "e" to see why it errored, and respond more correctly.
                if (e) return error(404); //? The file does not exist or there was an error.
                else res.status(200).sendFile(`${__dirname}/${ess.basePage}`);
            });
        }
        else res.status(200).sendFile(`${__dirname}${path}`); //? The file exists and will send.
    });

    /**
     * ### error();
     * When used, it will send the client a error based on what type of error it is.
     * @param { 404|500 } type type of error, use HTTP Status codes
     * @param {boolean} sendFile Sends the file to the clinet
     */
    function error(type, sendFile) {
        if (type == 404) stat(`${__dirname}/${ess.errorPage}`, (e) => { //? Checks to see if the error page is available, if not, then trow an error and respond to the client.
            if (e) {
                log(`The page for Status Code 404 could not be found. Make sure it exist at the path in the config.`);
                res.status(404).send({ status: 404, message: `Wow... The 404 page couldn't be found, neither could the page that you are looking for. Both are 404 Not Found.`});
            }
            else res.status(404).sendFile(`${__dirname }/${ess.errorPage}`);
        });
        else if (type == 500) stat(`${__dirname}/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
            if (e) {
                log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                res.status(404).send({ status: 404, message: `A lot of errors today I see... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
            } else res.status(500).sendFile(`${__dirname}/${ess.internalErrorPage}`);
        });
        else {
            log(`The status code that you entered is incorrect, check your code and try again.`);
            stat(`${__dirname}/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
                if (e) {
                    log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                    res.status(404).send({ status: 404, message: `Oh Goodie... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
                }
                else res.status(500).sendFile(`${__dirname}/${ess.internalErrorPage}`);
            });
        }
    }
});

exports.default = express