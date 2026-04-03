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
const { clear } = require(`console`);
const { join } = require("path");
let log
// Change the "dev" to "main" if you want the most stable version.
let settingsURL = `https://raw.githubusercontent.com/TheFlagen430297/full-express-server/dev/setup/settings.json`;

clear(); //[TheFlagen430297] If you don't know what this is... I can't help you XD JK

//? We start by looking and seeing if the config has been generated.
stat(join(__dirname, `src/ExpressServerSettings`, `config.json`), (e) => {
    //? If it hasn't, then we make the files and download all the dependencies.
    if (e) console.log(`=+=+=+=+=+=+=+=+=+=+=+=+=\n    Welcome to FES!\n=+=+=+=+=+=+=+=+=+=+=+=+=\n\nThis is the server's first start.\nSetting up needed files and downloading dependencies... This may take a moment.`);
        if (e) exec(`bun add express tcp-port-used vhost cookie-parser flaggedapi`, (e, sto, ste) => {
            if (e) { console.log(`error: ${e.message}`); return; }
            stat(join(__dirname, `src`), (e) => { if (e) { mkdir(join(__dirname, `src`), () => {}); } }); //? Creates "./src".
            setTimeout(() => {
                log = require(`flaggedapi`).log;
                stat(join(__dirname,`src/ExpressServerSettings` ), (e) => { if (e) { mkdirSync(join(__dirname, `src/ExpressServerSettings`)); writeFileSync(join(__dirname, `src/ExpressServerSettings`, `config.json`), `{\n "basePage": "index.html",\n "domain": "localhost",\n "errorPage": "404.html",\n "internalErrorPage": "500.html",\n "ip": "127.0.0.1",\n "lockdown": false,\n "setPort": null,\n "useFaviconRequest": true\n}`); } }); //? Creates "./src/ExpressServerSettings/" and the config file for the server.
                setTimeout(() => {
                    stat(join(__dirname, `src/public_html`), (e) => { if (e) { mkdirSync(join(__dirname, `src/public_html`)); } }); //? Creates "./src/public_html" folder, where all of your web pages will go for the root domain (example.com).
                    setTimeout(() => {
                        stat(join(__dirname, `src/subdomains`), (e) => { if (e) mkdirSync(join(__dirname, `src/subdomains`));});
                        stat(join(__dirname, `src/plugins`), (e) => { if (e) mkdirSync(join(__dirname, `src/plugins`)); writeFileSync(join(__dirname, `src/plugins`, `example.js`), `module.exports = {\n  name: "Example Plugin",\n  description: "This is an example of a plugin.",\n  enabled: true,\n  run: () => {\n    console.log("This log is coming from the plugin example.js! You can replace this code and create your own plugin.");\n  },\n};`);});
                        setTimeout(() => {
                            writeFileSync(join(__dirname, `src/public_html`, `private.json`), JSON.stringify(["/users.json", "/controls.js"]));
                            fetch(settingsURL).then(res => res.json()).then(data => { data.ExamplePages.dev.forEach((element, index, array) => { if ([`404`, `500`, `favicon`, `index`, `users`, `serverControls`].includes(element.id)) fetch(element.link).then(res => res.text()).then(data => { writeFileSync(join(__dirname, `src/public_html`, element.fileName), data); }); }); });
                            createNewSubdomain({ name: "panel", useAdminPage: true, enableServerControls: true, enableUserProfiles: true, skeleton: true}).then(() => { console.log(`Setup is complete`); StartService(); });
                        }, 3000);
                    }, 2000);
                }, 1000);
            }, 1000);
        });
    else StartService(); //? Else if it has been generated, then we just start the server service.
});

/**
 * ### StartService()
 * This starts the server service
 */
function StartService() {
    /**FlaggedAPI, used to log stuff */
    log = require(`flaggedapi`).log;
    log(`Starting Server Service`, { bold: true, italic: true, color: `0f0`});
    /**The **Express.js** library*/
    const express = require(`express`);
    /**The server */
    const Server = express();
    /**The **http** library */
    const { createServer } = require(`http`);
    /**The **tcp-port-used** library*/
    const { check } = require('tcp-port-used');
    /**The **vhost** library*/
    const vhost = require(`vhost`);
    /**The **cookieParser** library*/
    const cookieParser = require('cookie-parser');
    let subdomainList = [];;
    plugins();

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
     * @property { number|null } ess.setPort The set port for the server.
     * 
     * You can set the port of the server, however, if there is another service using that port, it will error out.
     * 
     * If set to `null` it will find a open port closest to port 80.
     * 
     * Defaults to *`null`* in `./src/ExpressServerSettings/config.json`
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

    Server.use(cookieParser());
    Server.use(express.json());

    //? Reads the folders in "./src/subdomains" and adds them to the subdomain list.
    readdirSync(join(__dirname, `src/subdomains`)).forEach( /** @param {String} subdomain Each subdomain found.*/ subdomain => {
        log(`Registered subdomain: ${subdomain}`, { italic: true });
        subdomainList.push(subdomain);
        Server.use(vhost(`${subdomain}.${ess.domain}`, require(join(__dirname, `src/subdomains/${subdomain}`)).default));
    });

    //? Listens for any calls to the server.
    Server.use(({ hostname, path }, res) => {
        ess = JSON.parse(readFileSync(join(__dirname, `src/ExpressServerSettings`, `config.json`)));

        /**
         * ### ```responseType[type](data)```
         * The function to send data to the client.
         * 
         * ```js
         * responseType[`Error`](404, `404 Not Found`, `This does not exist`);
         * ```
         */
        const responseType = {
            /**
             * ## Error 
             * This will handle errors replies and reply to the client with the given information.
             * 
             * @param { Number } HTTP_StatusCode The HTTP Status code.
             * @param { String } [ errorTitle ] The title of the error
             * @param { String } [ description ] The description of the error
             * 
             * @returns { void }
             */
            Error: (HTTP_StatusCode, errorTitle, description) => {
                let HTTP_Status = HTTP_StatusType(errorTitle, description);
                if (HTTP_Status.page && !errorTitle) stat(HTTP_Status.payload.path, (err, status) => {
                    if (err) {
                        if(!status.isFile()) {
                            log(`The page for Status Code ${HTTP_Status.payload.HTTP_Status} could not be found. Make sure it exist at the path in the config.\nThis could also be coming from one of the subdomains.`, { type: `error` });
                            return res.status(404).json({ errorTitle: `Missing HTTP Status Code page for HTTP Status Code: ${HTTP_Status.payload.HTTP_Status}`, description: `Wow... The ${HTTP_Status.payload.HTTP_Status} error page couldn't be found. Along with that issue, the origin HTTP Status Code is: ${HTTP_StatusCode}. Description of issue: ${HTTP_Status.payload.description ? HTTP_Status.payload.description : `NO DESCRIPTION PROVIDED`}`, HTTP_Status: 404 } );
                        } else return res.status(404).sendFile(join(__dirname, `src/public_html`, ess.errorPage));
                    } else return res.status(HTTP_StatusCode).sendFile(HTTP_Status.payload.path);
                });
                else res.status(HTTP_Status.payload.HTTP_Status).json({ errorTitle: HTTP_Status.payload.errorTitle, description: HTTP_Status.payload.description, HTTP_Status: HTTP_Status.payload.HTTP_Status })

                /**
                 * 
                 * ### HTTP_StatusType(title, description)
                 * 
                 * @param { String } title The **Title** of the error.
                 * @param { String } description The **Description** of the error.
                 * 
                 * @typedef { Object } HTTP_StatusInfo - The payload that is used to get information about the error.
                 * @property { Boolean } page Weather there is a default page for the error or not.
                 * @property { ErrorPayload } payload The information of the error.
                 * 
                 * @typedef { Object} ErrorPayload - The payload that comes when an error code matches a given set of codes.
                 * @property { String | undefined } [ errorTitle ] The **Title** for the error, will default if not set.
                 * @property { String | undefined } [ description ] The **Description** for the error, will default if not set.
                 * @property { String | undefined } [ HTTP_Status ] The HTTP Status.
                 * @property { String | undefined } [ path ] The path to the default error page.
                 *
                 * @returns { HTTP_StatusInfo }
                 */
                function HTTP_StatusType(title, description) {
                    let filePath = join(__dirname, `src/public_html`);
                    switch (HTTP_StatusCode) {
                        case 400: return { page: false, payload: { path: undefined, errorTitle: title ? title : `HTTP Status Code 400 - Bad Request`, description: description ? description : `Common issues are an error in the URL, check your URL and try again`, HTTP_Status: 400}}
                        case 401: return { page: false, payload: { path: undefined, errorTitle: title ? title : `HTTP Status Code 401 - Unauthorized`, description: description ? description : `The request did not provide authorization information`, HTTP_Status: 401}}
                        case 403: return { page: false, payload: { path: undefined, errorTitle: title ? title : `HTTP Status Code 403 - Forbidden`, description: description ? description : `You don't have access to this resource.`, HTTP_Status: 403 } };
                        case 404: return { page: true, payload: { path: join(filePath, ess.errorPage), errorTitle: title ? title : `HTTP Status Code 404 - Not Found`, description: description ? description : `The resource does not exist at this URL`, HTTP_Status: 404 }}
                        case 405: return { page: false, payload: { path: undefined, errorTitle: title ? title : `HTTP Status Code 405 - Method Not Allowed`, description: description ? description : `The method that was used was not allowed`, HTTP_Status: 405 }}
                        case 418: return { page: false, payload: { path: undefined, errorTitle: `I'm stoopid :P (I'm a Teapot)`, description: `All server requests are ignored due to being in Lockdown`, HTTP_Status: 418 }}
                        case 500:
                            log(`There was an Internal Server Error at ${Date.now().toISOString()}`, { type: `error` });
                            return { page: true, payload: { path: join(filePath, ess.internalErrorPage), errorTitle: title ? title : `HTTP Status Code 500 - Internal Server Error`, description: description ? description : `The Server had an unknown internal error`, HTTP_Status: 500 }}
                        default: break;
                    };
                };
            },

            /**
             * ## Success 
             * Send the file using the path to the file.
             * 
             * @param { Number } HTTP_StatusCode The HTTP Status Code.
             * @param { String } payload The path to the file or json.
             * 
             * @returns { void }
             */
            Success: (HTTP_StatusCode, payload) => { 
                if (typeof payload === `string`) return res.status(HTTP_StatusCode).sendFile(payload);
                res.status(HTTP_StatusCode).send(payload);
            }
        };

        if (ess.lockdown) { responseType[`Error`](418); log(`A request was stopped due to being in Lockdown, time: ${Date.now()}`, { type: `Warning` }); return; } //! If lockdown is true then it will throw out all requests to the server.
        
        let subdomainCheck = /([a-z0-9]*)(?:\.)([a-z0-9]*)(?:\.*)(.*)/.exec(hostname);

        if (subdomainCheck && !subdomainList.includes(subdomainCheck[1])) return responseType[`Error`](404, `Error With Subdomain`, `The subdomain (${subdomainCheck[1]}) does not exist on this server. This could be due to: A Typing error (check your spelling), The subdomain does not exist at all, The Subdomain was not loaded or was created outside of startup. (Creating the files in the backend)`); //? Checks if the subdomain exists, if not, returns 404.
        if (hostname != ess.domain) return responseType[`Error`](403, `Mismatch Domains`, `The supplied domain (${hostname}) did not match the set domain in this server. This could be due to: Trying to directly connect to the server's IP and not it's set up domain, A domain that connects to the IP address of the server but is not the set domain.`); //! If the hostname does not match the domain set, it is stopped.
    
        stat(join(__dirname, `src/public_html`, `private.json`), (e) => {
            if (!e) privateURL = JSON.parse(readFileSync(join(__dirname, `src/public_html`, `private.json`)));
            if (!e && path == privateURL.find((url) => url == path)) return responseType[`Error`](403, `URL is Private`, `The URL is private and you don't have access to it`); //? If the file is private and someone tries to access it, it will block the client and throw a 403.
            if (path == `/favicon.ico`) { //? Browsers will make a url request for a favicon, so this allows you to decide whether you wish to give a favicon via a url request.
                //[TheFlagen430297] It is recommended to set your favicon in your HTML code.
                //[TheFlagen430297] But, you can change this in "./src/ExpressServerSettings/config.json"
                //[TheFlagen430297] If you use this method, you need to have a image file called "favicon.ico" in "./src/public_html" and in any subdomains.
                if (ess.useFaviconRequest) return stat(join(__dirname, `/src/public_html`, `favicon.ico`), (Error) => Error && Error.code === `ENOENT` ? responseType[`Error`](404, `Favicon Not Found`, `Ohh okay, odd... The favicon.ico couldn't be found.`) : Error ? ( responseType[`Error`](500, `Internal Server Error`, `There was an internal server error fetching the favicon`), log(`There was a Internal Server Error while fetching the favicon.`, { type: `warning`}), console.log(Error) ) : responseType[`Success`](200, join(__dirname, `src/public_html`, `favicon.ico`))); // Checks to see if the server is using the favicon request, if so, it will check if the favicon exist, if not, it will throw a 404, if there was an error, it will handle the error, if it exist, it will send the file.
                responseType[`Error`](405, `Query Favicon Disabled`, `Querying /favicon.ico is disabled on this server`); //If the favicon request method is disabled, the server will send a 405.
            } else if (path == `/controls`) {

                //TODO: In the future, remove this method of control handling and remove controls on the main domain. (The controls should only be in the panel subdomain)

                stat(join(__dirname, `src/public_html`, `controls.js`), (error) => {
                    if (error) return responseType[`Error`](403, `Controls Disabled`, `Controls are disabled on this domain.`); //If the controls.js does not exist, it will treat it as it is disabled, which will throw a 403 and act like the user doesn't have permission.
                    if (Object.keys(query).length == 0) return responseType[`Error`](400, `No Params Passed`, `The request did not include any params. (Can't do anything if you don't tell me what to do lol)`);
                    let { kill } = require(join(__dirname, `/src/public_html`, `controls.js`));
                    stat(join(__dirname, `src/public_html`, `users.json`), (Error) => {
                        if (Error) return Error.code === `ENOENT` ? responseType[`Error`](404, `User.json Not Found`, `The users.json file could not be found`) : ( responseType[`Error`](500, `Internal Server Error`, `There was an internal server error fetching the users.json file`), log(`There was a Internal Server Error while fetching the users.json file`, { type: `warning` }), console.log(Error) ); // If the users.json does not exist, throw a 404, if it was another error, throw a 500.
                        let users = JSON.parse(readFileSync(join(__dirname, `user.json`)));
                        if (query.type === `kill`) {
                            if (!Object.keys(query).includes(`oauth`)) return responseType[`Error`](401, `Missing oauth param`, `You did not provide the oauth param`); //If the client did not provide a oauth param, throw a 401.
                            if (!Object.keys(query).includes(`user`)) return responseType[`Error`](401, `Missing user param`, `You did not provide the user param`); //If the client did not provide a user param, throw a 401.
                            users.forEach((user, index, array) => {
                                if (query.user == user.name) {
                                    if (["kill", "administrator"].find(x => user.permissions.includes(x))) {
                                        if (query.oauth === `2546`) {
                                            responseType[`Success`](200, { status: 200, message: `The server shut down.` });
                                            kill(Object.keys(query).length > 0 ? (query.code ? query.code : 0) : 0);
                                        } else responseType[`Error`](403, `Incorrect oauth`, `oauth param incorrect`);
                                    } else return responseType[`Error`](403, `No Permission`, `You do not have permission to use this`);
                                } else if (index == array.length - 1) return responseType[`Error`](404, `User Not Found`, `The User does not exist.`);
                            })
                        } else return responseType[`Error`](400, `Command Not Found`, `The type of the action does not exist.`);
                    })
                })
            } else if (path == `/`) {
                stat(join(__dirname, `src/public_html`, ess.basePage), (Error) => { //? Checks to see if the basePage exists.
                    if (Error && Error?.code === `ENOENT`) return responseType[`Error`](404, `Homepage Not Found`, `The homepage for the server could not be found. If you are the client (You most likely are) please try again later. If you are the server admin, make sure that settings are correct and that the file exist.`); //? The file does not exist and throws a 404.
                    if (Error) return ( responseType[`Error`](500, `Internal Server Error`, `There was an unknown internal server error`), console.log(Error) );
                    responseType[`Success`](200, join(__dirname, `src/public_html`, ess.basePage))
                });
            } else {
                let rootPath = join(__dirname, `src/public_html`);
                let hasFileExtensionRegex = /(.*)([^\w\s\/])(.*)/
                let separator = hasFileExtensionRegex.exec(path)?.[2];

                if (separator && separator != `.`) return responseType[`Error`](400, `Incorrect URL Punctuation`, `The file extension separator is (${separator}), which is invalid. You must use (.) or remove the (${separator})`);

                let filePath = hasFileExtensionRegex.test(path) ? join(rootPath, path) : join(rootPath, path + `.html`);
                
                stat(filePath, (Error) => {
                    if (Error) {
                        if (separator && !hasFileExtensionRegex.exec(path)?.[3]) return responseType[`Error`](400, `Missing File Extension`,  `The URL ended with '.' which is invalid. You need to either provide a file extension or remove the '.'`);
                        if (Error && Error.code === "ENOENT") return responseType[`Error`](404);
                        return ( responseType[`Error`](500), console.log(Error));
                    };
                    responseType[`Success`](200, filePath);
                });
            }
        });
    });

    //TODO: This will handle POST requests and will route requests through plugins. Plugins must handle the passed data and handle accordingly.
    // Server.use()

    FindOpenPort(ess.ip).then(openPort => {
        createServer(Server).listen(openPort)
            .on(`listening`, () => { //? Creates the server and opens it.
                if (ess.lockdown) log(`The server is in lockdown!\nAll requests are ignored and status 418 is sent back.\nThis can only be changed in the config.json!`, { bold: true, type: `error`, color: `f00`});
                
                /**The address of the server */
                let address = `${ess.domain}${openPort != 80 ? `:${openPort}/` : "/"}`;

                log(`Server opened at: http://${address}`, { bold: true, italic: true, type: "success", color: `0c0`});
                subdomainList.forEach(subdomain => log(`Subdomain: http://${subdomain}.${address}`, { italic: true, color: `0c0`}));
                if (ess.domain == "localhost") log(`The domain is set to "localhost", you won't be able to use domains if this server is being broadcasted to the internet.\nIn order to use domains, you must edit the domain property to "YourDomain.com" in the config!`, { bold:true, italic:true, type:`warning` });
            })
            .on(`error`, (Error => { log(`There was an Error starting the server`, { type: `error` } ); console.log(Error); process.exit(1); }))
    }).catch(Error => { log(Error, { type: `error` }); process.exit(1); }); //? If there was an error searching for an open port, it will throw an error.

    /**
     * ### FindOpenPort()
     * Finds an open port, changes the port number, then goes onto the next step.
     * ```js
     * FindOpenPort(`127.0.0.1`).then(openPort => {
     *  console.log(openPort);
     * }).catch(Error => {
     *  console.log(Error)
     * })
     * ```
     * @param { String } ip The IP that you want to check for an open port.
     * @returns { Promise<string>|void}
     */
    function FindOpenPort(ip) { 
        let port = (ess.setPort ? ess.setPort : 80);
        return new Promise((resolve , reject) => {
            if (ess.setPort && typeof ess.setPort != `number`) return reject(`The port that was set in config.js is not a number, therefore, the server was closed.`);
            if (ess.setPort && ess.setPort > 65535) return reject(`The port was set in the config.js to ${ess.setPort}, which is out of range, please set it between 0-65535`);
            loop();
            function loop() {
                check(port, ip).then(inUse => {
                    if (inUse && ess.setPort) reject(`The port was set in config.js, however, the port is unavailable, and therefore the server is closed.`)
                    if (inUse && !ess.setPort) { port++; loop(); }
                    else resolve(port);
                }).catch(Error => {
                    console.error(Error);
                    reject(`There was an unexpected error, and therefore, the server was closed.`);
                });
            };
        }); 
    }
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
    return new Promise((res, rej) => {
        if (!options.name) return rej({ status: 400, message: `name is required`});
        stat(join(__dirname, `src/subdomains`, options.name), (e, stats) => {
            if (!e) return rej({ status: 409, message: `subdomain already exists.`});
            else mkdir(join(__dirname, `src/subdomains`, options.name), (e) => {
                writeFileSync(join(__dirname, `src/subdomains`, options.name, `private.json`), JSON.stringify(["/users.json", "/controls.js", ...(options.blockedFiles || [])]));
                fetch(settingsURL).then(res => res.json()).then(data => {
                    data.ExamplePages.dev.forEach((element, index, array) => {
                        if (options.useAdminPage && options.skeleton && element.id == `adminPanel`) newFile(element);
                        else if (options.skeleton && element.id === `index`) newFile(element);
                        if (element.id == `subdomainAdmin`) newFile(element);
                        if (options.skeleton && [`404`, `500`, `favicon`].includes(element.id)) newFile(element);
                        if (options.enableUserProfiles && element.id == `users`) newFile(element);
                        if (options.enableServerControls && element.id == `serverControls`) newFile(element);
                        if (index == array.length - 1) setTimeout(() => { res(); }, 3000)
                    });
                });
    
                /**
                 * ### newFile();
                 * 
                 * Makes a new file.
                 * 
                 * @param { Object } element The file Object
                 */
                function newFile(element) { fetch(element.link).then(res => res.text()).then(data => { writeFileSync(join(__dirname, `src/subdomains`, options.name, element.fileName), data); }); }
            });
        });
    });
}

function plugins() {
    stat(join(__dirname, `src/plugins`), (e) => {
        if (e) { mkdirSync(join(__dirname, `src/plugins`)); log(`UPDATED\nThis server now includes plugins!\nPlugins can be used to run code alongside the server\nRead the documentaion on the GitHub Repo to create your own`, { bold: true, type: `success` });}
        let plugins = readdirSync(join(__dirname, `src/plugins`));
        if (!plugins.length) return log(`There are no plugins to load`, { italic: true, type: "info", color: `ff2`});
            plugins.forEach(x => {
            const plugin = require(join(__dirname, `src/plugins`, x));
            if (plugin.enabled) { log(`Loading Plugin: ${plugin.name}`, { italic: true }); plugin.run(); } 
            else log(`The plugin: ${plugin.name}, is disabled and was not loaded`, { italic: true, type: "info", color: `a00`});
        });
    })
}


module.exports = { createNewSubdomain };