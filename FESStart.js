/**
 * # Full Express Server (FES)
 * ### FESStart.js
 * This script sets up a fully working express server packed with features.
 * 
 * All you have to do is place **FESStart.js** in the folder that you want it to be setup in and run `Node FESStart.js` in a terminal and it will set it all up for you :)
 */
let HoverExplanation  = "Hover to see tooltip";

/**The **child_process** library*/
const { exec } = require("child_process");
/**The **FS** library */
const { mkdir, mkdirSync, readdir, readdirSync, readFileSync, stat, writeFile, writeFileSync } = require(`fs`);
const { log, clear } = require(`console`);

clear(); //[TheFlagen430297] If you don't know what this is... I can't help you XD JK
log(`Starting Setup`);

//? We start by looking and seeing if the config has been generated.
stat(`./src/ExpressServerSettings/config.json`, (e) => {
    //? If it hasn't, then we make the files and download all the dependencies.
    if (e) log(`Setting up needed files and downloading dependencies... This may take a moment.`);
    if (e) exec(`npm i express tcp-port-used vhost cookie-parser`, (e, sto, ste) => {
        if (e) { log(`error: ${e.message}`); return; }
        if (ste) { log(`stderr: ${ste}`); return; }
        stat(`./src`, (err, stat) => { if (err) { mkdir(__dirname + `/src`, () => {}); } }); //? Creates "./src".
        setTimeout(() => {
            stat(`./src/ExpressServerSettings`, (err, stat) => { if (err) { mkdirSync(__dirname + `/src/ExpressServerSettings`); writeFileSync(__dirname + `/src/ExpressServerSettings/config.json`, `{ "basePage":"home.html", "errorPage": "404.html", "domain": "localhost", "ip": "127.0.0.1", "useFaviconRequest": true, "lockdown": false }`); } }); //? Creates "./src/ExpressServerSettings/" and the config file for the server.
            setTimeout(() => {
                stat(`./src/public_html`, (err, stat) => { if (err) { mkdirSync(__dirname + `/src/public_html`); } }); //? Creates "./src/public_html" folder, where all of your web pages will go for the root domain (example.com).
                setTimeout(() => {
                    stat(`./src/subdomains`, (e) => { if (e) mkdirSync(__dirname + `/src/subdomains`);});
                    setTimeout(() => {
                        createNewSubdomain({ name: "admin", useAdminPage: true, enableServerControls: true, enableUserProfiles: true, skeleton: true}).then(() => { console.log(`Done`); StartService(); });
                    }, 3000);
                }, 2000);
            }, 1000);
        }, 1000);
    });
    //? Else if it has been generated, then we just start the server service.
    else { log(`No setup service needed.`); StartService(); }
});

/**
 * ### StartService()
 * This starts the server service
 */
function StartService() {
    log(`Starting Server Service...`);
    /**The **Express.js** library*/
    const express = require(`express`)();
    /**The **http** library */
    const { createServer } = require(`http`);
    /**The **tcp-port-used** library*/
    const { check } = require('tcp-port-used');
    /**The **vhost** library*/
    const vhost = require(`vhost`);
    /**The **cookieParser** library*/
    const cookieParser = require('cookie-parser');
    /**### The port of the server */
    let port = 80;
    let subdomainList = [];

    setTimeout(() => {
        clear(); //[TheFlagen430297] Again, if you don't know what this is, why are you here?? XD JK I've been roasting too hard lol
        /**
         * ### Express Server Settings (ess)
         * The setting of the server, can be found at `./src/ExpressServerSettings/config.json`
         * @typedef ess
         * @type { Object }
         * @property { String } ess.basePage The page that the server sends when no path is specified, *Like `http://localhost/`*
         * 
         * Defaults to **home.html**, can be changed in `./src/ExpressServerSettings/config.json`
         * @property { String } ess.errorPage The page that the server sends when the file could not be found, *Like `http://localhost/thisFileDoesNotExistOnTheServer.lol`*
         * 
         * Defaults to **404.html**, can be changed in `./src/ExpressServerSettings/config.json`
         * @property { String } ess.internalErrorPage The page that the server sends when an internal error happens *(If eligible)*
         * 
         * Defaults to **500.html**, can be changed in `./src/ExpressServerSettings/config.json`
         * @property { String } ess.domain The domain of the server.
         * 
         * Do not set it to an **IPv4** or **IPv6** address, it must be either *`localhost`* or a domain name like *`example.com`*
         * 
         * Defaults to *`localhost`* in `./src/ExpressServerSettings/config.json`
         * @property { String } ess.ip The IP of the server.
         * 
         * The **IPv4** address of the server, it should never need to be changed, but can be if needed.
         * 
         * Defaults to *`127.0.0.1`* in `./src/ExpressServerSettings/config.json`
         * @property { Boolean } ess.useFaviconRequest Whether or not to use the Favicon URL Request method.
         * 
         * *It is not recommended to use the Favicon URL Request method because it is better to put it in your [HTML Code](https://www.w3schools.com/html/html_favicon.asp 'View how to at: https://www.w3schools.com/html/html_favicon.asp')*
         * 
         * If you use this method, you need to have a image file called *`favicon.ico`* in `./src/public_html`
         * 
         * Defaults to **false**, can be changed in `./src/ExpressServerSettings/config.json`
         * @property { Boolean } ess.lockdown Whether or not to stop accepting all requests.
         * 
         * This will stop all incoming request and only respond with **HTTP Status Code 418** *`I'm a teapot`*
         * 
         * Defaults to **false**, can be changed in `./src/ExpressServerSettings/config.json`
         */
        /**@type {ess} */
        let ess = JSON.parse(readFileSync(`./src/ExpressServerSettings/config.json`));
        express.use(cookieParser());

        //? Reads the folders in "./src/subdomains" and adds them to the subdomain list.
        readdirSync(`${__dirname}/src/subdomains`).forEach( /** @param {String} subdomain Each subdomain found.*/ subdomain => {
            log(`Registered subdomain: ${subdomain}`);
            subdomainList.push(subdomain);
            express.use(vhost(`${subdomain}.${ess.domain}`, require(`./src/subdomains/${subdomain}`).default));
        });
        //? Listens for any calls to the server.
        express.get(`*`, ({ hostname, path }, { status }) => {
            //! If lockdown is true then it will throw out all requests to the server.
            if (ess.lockdown) return status(418);

            //? Reads the subdomains and returns a list of them.
            //! The folder names are the subdomain names, if you want "admin.example.com" the folder name must be "admin"
            readdir(`./src/subdomains`, (e, folders) => {
                let rex = /(.*)\..*/;
                if (rex.test(hostname)) { //? Checks if there is a subdomain in the request url, if not, then treats it as on the domain.
                    let check = rex.exec(hostname)[1];
                    if (!folders.find( x => x == check)) return status(404).send({ status: 404, message: `The subdomain "${check}" does not exist on this server`}); //? If the subdomain does not exist on the server, returns 404 with message.
                } else {
                    if (path == `/favicon.ico`) { //? Browsers will make a url request for a favicon, so this allows you to decide whether you wish to give a favicon via a url request.
                        //[TheFlagen430297] Browsers requesting the favicon via a url request is stupid, it is not recommended and it is recommended to set your favicon in your HTML code.
                        //[TheFlagen430297] But, you can change this in "./src/ExpressServerSettings/config.json"
                        //[TheFlagen430297] If you use this method, you need to have a image file called "favicon.ico" in "./src/public_html" and in any subdomains.
                        if (ess.useFaviconRequest) status(200).sendFile(`${__dirname}/src/public_html/favicon.ico`);
                        else status(405).send({ status: 405, message: `Querying /favicon.ico is disabled on this server, please set your favicon in your HTML Code.`});
                    }

                    //? Checks to see if the files exist for the request
                    stat(`./src/public_html/${path}`, (e) => {
                        //TODO: Use "e" to see why it errored, and respond more correctly.
                        if (e) return error(404); //? If the file does not exist, then throw error
                        else if (path == "/") { //? If there are no params on the request, then treats it differently.
                            //? Checks to see if the basePage exists.
                            stat(`./src/public_html/${ess.basePage}`, (e) => {
                                //TODO: Use "e" to see why it errored, and respond more correctly.
                                if (e) return error(404); //? The file does not exist or there was an error.
                                else status(200).sendFile(`${__dirname}/src/public_html/${ess.basePage}`);
                            });
                        }
                        else status(200).sendFile(`${__dirname}/src/public_html/${path}`); //? The file exists and will send.
                    });
                }
            });
            /**
             * ### error();
             * When used, it will send the client a error based on what type of error it is.
             * @param { 404|500 } type type of error, use HTTP Status codes
             */
            function error(type) {
                if (type == 404) stat(`./src/public_html/${ess.errorPage}`, (e) => { //? Checks to see if the error page is available, if not, then trow an error and respond to the client.
                    if (e) {
                        log(`The page for Status Code 404 could not be found. Make sure it exist at the path in the config.`);
                        status(404).send({ status: 404, message: `Wow... The 404 page couldn't be found, neither could the page that you are looking for. Both are 404 Not Found.`} );
                    }
                    else status(404).sendFile(`${__dirname }/src/public_html/${ess.errorPage}`);
                });
                else if (type == 500) stat(`./src/public_html/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
                    if (e) {
                        log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                        status(404).send({ status: 404, message: `A lot of errors today I see... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
                    } else status(500).sendFile(`${__dirname }/src/public_html/${ess.internalErrorPage}`);
                });
                else {
                    log(`The status code that you entered is incorrect, check your code and try again.`);
                    stat(`./src/public_html/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
                        if (e) {
                            log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                            status(404).send({ status: 404, message: `Oh Goodie... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
                        }
                        else status(500).sendFile(`${__dirname }/src/public_html/${ess.internalErrorPage}`);
                    });
                }
            }
        });

        FindOpenPort(ess.ip).then(() => {
            createServer(express).listen(port).on(`listening`, () => { //? Creates the server and opens it.
                setTimeout(() => {
                    clear();
                    /**The address of the server */
                    let addy = `${ess.domain}${port === 80 ? "/" : `:${port}`}`;
                    log(`Server opened at: http://${addy}`);
                    subdomainList.forEach(subdomain => log(`Subdomain: http://${subdomain}.${addy}`));
                }, 3000);
            });
        }).catch((e) => { log(e); process.exit(); }); //? If there was an error searching for an open port, it will throw an error.
    }, 3000);

    /**
     * ### FindOpenPort()
     * Finds an open port, changes the port number, then goes onto the next step.
     * ```js
     * FindOpenPort(`127.0.0.1`).then(() => {
     *  //Code Here 
     * })
     * ```
     * @param { String } ip The IP that you want to check for an open port.
     * @returns { Promise<string>|void}
     */
    function FindOpenPort(ip) { return new Promise((y , n) => { loop(); function loop() { check(port, ip).then(inUse => { if (inUse) { port++; loop(); } else y(); }, function(err) { n(`Error on check: ${err.message}`); }); } }); }
}

/**
     * ## createNewSubdomain();
     * Creates a new subdomain
     *
     * @param { Object } options The options for the subdomain.
     * @param { String } options.name The name for the subdomain.
     * @param { Boolean } [options.enableUserProfiles] Whether to enable the user profile controls.
     * @param { Boolean } [options.enableServerControls] Whether to enable the server controls.
     * @param { Boolean } [options.useAdminPage] Whether to load the admin page for the server.
     * @param { Boolean } [options.skeleton] Whether to load the subdomain with a few example pages.
     * @param { Array<String> } [options.blockedFiles] Which files should not be accessible from URLs.
     * 
     * the array must have a file path like `/test/code.js`
     * 
     * example of options.blockedFiles:
     * ```js
     * options.blockedFiles = ["/example.html", "/code/example.js"]
     * ```
     * 
     * **example of how to use this function:**
     * ```js
     * //Call the function
     * const { createNewSubdomain } = require(`./FESStart`);
     * createNewSubdomain({ name: `test`}).then(() => {
     *      console.log(`Created Subdomain Successfully`);
     * }).catch(e => { console.log(e) })
     * ```
     * @returns { Promise<Object> }
     */
function createNewSubdomain(options) {
    let settingsURL = `https://raw.githubusercontent.com/TheFlagen430297/full-express-server/dev/setup/settings.json`;
    return new Promise((res, rej) => {
        if (!options.name) return rej({ status: 400, message: `name is required`});
        stat(`${__dirname}/src/subdomains/${options.name}`, (e, stats) => {
            if (!e) return rej({ status: 409, message: `subdomain already exists.`})
            else mkdir(`${__dirname}/src/subdomains/${options.name}`, (e) => {
                writeFileSync(`${__dirname}/src/subdomains/${options.name}/private.json`, JSON.stringify(["/users.json", "/controls.js", ...(options.blockedFiles || [])]));
                fetch(settingsURL).then(res => res.json()).then(data => {
                    data.ExamplePages.dev.forEach((element, index, array) => {
                        if (options.useAdminPage && options.skeleton && element.id == `adminPanel`) newFile(element);
                        else if (options.skeleton && element.id === `home`) newFile(element)
                        if (element.id == `subdomainAdmin`) newFile(element);
                        if (options.skeleton && [`404`, `500`, `favicon`].includes(element.id)) newFile(element);
                        if (options.enableUserProfiles && element.id == `users`) newFile(element);
                        if (options.enableServerControls && element.id == `serverControls`) newFile(element);
                        if (index == array.length - 1) res();
                    });
                });
    
                /**
                 * ### newFile();
                 * 
                 * Makes a new file.
                 * 
                 * @param { Object } element The file Object
                 */
                function newFile(element) { fetch(element.link).then(res => res.text()).then(data => { writeFileSync(`${__dirname}/src/subdomains/${options.name}/${element.fileName}`, data); }); }
            });
        })
    });
}


module.exports = { createNewSubdomain };