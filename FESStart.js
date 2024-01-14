/**
 * # Full Express Server (FES)
 * ### FESStart.js
 * This script sets up a fully working express server packed with features.
 * 
 * All you have to do is place **FESStart.js** in the folder that you want it to be setup in and run `Node FESStart.js` in a terminal and it will set it all up for you :)
 */
let HoverExplanation  = "Hover to see tooltip";

console.clear(); //[TheFlagen430297] If you don't know what this is... I can't help you XD JK
console.log(`Starting Setup`);

/**The **child_process** library*/
const { exec } = require("child_process");
/**The **FS** library */
const fs = require(`fs`);

//? We start by looking and seeing if the config has been generated.
fs.stat(`./src/ExpressServerSettings/config.json`, (e) => {
    //? If it hasn't, then we make the files and download all the dependencies.
    if (e) console.log(`Setting up needed files and downloading dependencies... This may take a moment.`);
    if (e) exec(`npm init -y & npm i express tcp-port-used vhost cookie-parser`, (e, sto, ste) => {
        if (e) { console.log(`error: ${e.message}`); return; }
        if (ste) { console.log(`stderr: ${ste}`); return; }
        fs.stat(`./src`, (err, stat) => { if (err) { fs.mkdir(__dirname + `/src`, () => {}); } }); //? Creates "./src".
        setTimeout(() => {
            fs.stat(`./src/ExpressServerSettings`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/ExpressServerSettings`); fs.writeFileSync(__dirname + `/src/ExpressServerSettings/config.json`, `{ "basePage":"home.html", "errorPage": "404.html", "domain": "localhost", "ip": "127.0.0.1", "useFaviconRequest": false, "lockdown": false }`); } }); //? Creates "./src/ExpressServerSettings/" and the config file for the server.
            setTimeout(() => {
                fs.stat(`./src/public_html`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/public_html`); } }); //? Creates "./src/public_html" folder, where all of your web pages will go for the root domain (example.com).
                setTimeout(() => {
                    fetch(`https://raw.githubusercontent.com/TheFlagen430297/full-express-server/main/setup/settings.json`).then(x => x.json()).then(y => { //? Fetches the settings for setting up the server structure.    
                        for (let i = 0; i < y.loadExamplePages.length; i++) { //? Loops through all the example pages.
                            /**Each page's details */
                            const element = y.loadExamplePages[i];
                            fetch(element.link).then(x => x.text()).then(y => { //? It fetches the page data for each page, saving the data for later.
                                if (element.paths) { //? If there are paths, this it handles it differently.
                                    /**
                                     * ### paths
                                     * The paths where each files needs to go
                                     * @type Array
                                     */
                                    let paths = element.paths;
                                    paths.forEach( /** @param {String} path Path of the needed folder to be made.*/ path => {
                                        //? Makes a new folder if needed
                                        fs.mkdir(__dirname + `/${path}`, (err) => { if (err) return; });
                                    });
                                    //? After all folders have been made, it takes the page data that we took and saves it to a file
                                    fs.writeFile(__dirname + `/${paths.pop()}/${element.name}`, y, () => { });
                                }
                                //? Else it creates the file in public_html
                                else fs.writeFile(__dirname + `/src/public_html/${element.name}`, y, () => { });
                            });
                            //? After it loops through all the example files it starts the server service
                            if (i == y.loadExamplePages.length - 1) { console.log(`Done`); setTimeout(() => { StartService(); }, 3000); }
                        }
                    });
                }, 2000);
            }, 1000);
        }, 1000);
    });
    //? Else if it has been generated, then we just start the server service.
    else { console.log(`No setup service needed.`); StartService(); }
});

/**
 * ### StartService()
 * This starts the server service
 */
function StartService() {
    console.log(`Starting Server Service...`);
    /**The **Express.js** library*/
    const EXPRESS = require(`express`)();
    /**The **http** library */
    const HTTP = require(`http`);
    /**The **tcp-port-used** library*/
    const TCPPU = require('tcp-port-used');
    /**The **vhost** library*/
    const vhost = require(`vhost`);
    /**The **cookieParser** library*/
    const cookieParser = require('cookie-parser');
    /**### The port of the server */
    let port = 80;

    setTimeout(() => {
        console.clear(); //[TheFlagen430297] Again, if you don't know what this is, why are you here?? XD JK I've been roasting too hard lol
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
        let ess = JSON.parse(fs.readFileSync(`./src/ExpressServerSettings/config.json`));
        EXPRESS.use(cookieParser());
        ess.lockdown;
        //? Reads the folders in "./src/subdomains" and adds them to the subdomain list.
        fs.readdirSync(`./src/subdomains`).forEach( /** @param {String} subdomain Each subdomain found.*/ subdomain => { eval(`console.log("Registered subdomain: ${subdomain}"); EXPRESS.use(vhost("${subdomain}.${ess.domain}", require("./src/subdomains/${subdomain}").${subdomain}));`); });
        
        //? Listens for any calls to the server.
        EXPRESS.get(`*`, (req, res) => {
            //! If lockdown is true then it will throw out all requests to the server.
            if (ess.lockdown) return res.status(418);

            //? Reads the subdomains and returns a list of them.
            //! The folder names are the subdomain names, if you want "admin.example.com" the folder name must be "admin"
            fs.readdir(`./src/subdomains`, (e, folders) => {
                let rex = /(.*)\..*/;
                if (rex.test(req.hostname)) { //? Checks if there is a subdomain in the request url, if not, then treats it as on the domain.
                    let check = rex.exec(req.hostname)[1];
                    if (!folders.find( x => x == check)) return res.status(404).send({ status: 404, message: `The subdomain "${check}" does not exist on this server`}); //? If the subdomain does not exist on the server, returns 404 with message.
                } else {
                    if (req.path == `/favicon.ico`) { //? Browsers will make a url request for a favicon, so this allows you to decide whether you wish to give a favicon via a url request.
                        //[TheFlagen430297] Browsers requesting the favicon via a url request is stupid, it is not recommended and it is recommended to set your favicon in your HTML code.
                        //[TheFlagen430297] But, you can change this in "./src/ExpressServerSettings/config.json"
                        //[TheFlagen430297] If you use this method, you need to have a image file called "favicon.ico" in "./src/public_html"
                        if (ess.useFaviconRequest) res.status(200).sendFile(`${__dirname}/src/public_html/favicon.ico`);
                        else res.status(405).send({ status: 405, message: `Querying /favicon.ico is disabled on this server, please set your favicon in your HTML Code.`});
                    }

                    //? Checks to see if the files exist for the request
                    fs.stat(`./src/public_html/${req.path}`, (e) => {
                        //TODO: Use "e" to see why it errored, and respond more correctly.
                        if (e) return error(404); //? If the file does not exist, then throw error
                        else if (req.path == "/") { //? If there are no params on the request, then treats it differently.
                            //? Checks to see if the basePage exists.
                            fs.stat(`./src/public_html/${ess.basePage}`, (e) => {
                                //TODO: Use "e" to see why it errored, and respond more correctly.
                                if (e) return error(404); //? The file does not exist or there was an error.
                                else res.sendFile(`${__dirname}/src/public_html/${ess.basePage}`);
                            });
                        }
                        else res.status(200).sendFile(`${__dirname}/src/public_html/${req.path}`); //? The file exists and will send.
                    });
                }
            });
            /**
             * ### error();
             * When used, it will send the client a error based on what type of error it is.
             * @param { 404|500 } type type of error, use HTTP Status codes
             */
            function error(type) {
                if (type == 404) fs.stat(`./src/public_html/${ess.errorPage}`, (e) => { //? Checks to see if the error page is available, if not, then trow an error and respond to the client.
                    if (e) {
                        console.log(`The page for Status Code 404 could not be found. Make sure it exist at the path in the config.`);
                        res.status(404).send({ status: 404, message: `Wow... The 404 page couldn't be found, neither could the page that you are looking for. Both are 404 Not Found.`} );
                    }
                    else res.status(404).sendFile(`${__dirname }/src/public_html/${ess.errorPage}`);
                });
                else if (type == 500) fs.stat(`./src/public_html/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
                    if (e) {
                        console.log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                        res.status(404).send({ status: 404, message: `A lot of errors today I see... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
                    } else res.status(500).sendFile(`${__dirname }/src/public_html/${ess.internalErrorPage}`);
                });
                else {
                    console.log(`The status code that you entered is incorrect, check your code and try again.`);
                    fs.stat(`./src/public_html/${ess.internalErrorPage}`, (e) => { //? Checks to see if the internal server error page is available, if not, then trow an error and respond to the client.
                        if (e) {
                            console.log(`The page for Status Code 500 could not be found. Make sure it exist at the path in the config.`);
                            res.status(404).send({ status: 404, message: `Oh Goodie... The 500 page can't be found. Besides that error, another internal server error happened (Status code: 500)`});
                        }
                        else res.status(500).sendFile(`${__dirname }/src/public_html/${ess.internalErrorPage}`);
                    });
                }
            }
        });

        FindOpenPort(ess.ip).then(() => {
            HTTP.createServer(EXPRESS).listen(port).on(`listening`, () => { //? Creates the server and opens it.
                setTimeout(() => { console.clear(); console.log(`Server opened at: http://${ess.domain}${port === 80 ? "/" : `:${port}`}`); }, 3000);
            });
        }).catch((e) => { console.log(e); process.exit(); }); //? If there was an error searching for an open port, it will throw an error.
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
    function FindOpenPort(ip) { return new Promise((y , n) => { loop(); function loop() { TCPPU.check(port, ip).then(inUse => { if (inUse) { port++; loop(); } else y(); }, function(err) { n(`Error on check: ${err.message}`); }); } }); }
}