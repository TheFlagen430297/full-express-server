console.clear()
console.log(`Starting Setup`)
const { exec } = require("child_process");
/**The **FS** library */
const fs = require(`fs`);
fs.stat(`./src/ExpressServerSettings/config.json`, (err, stat) => {
    if (err) console.log(`Setting up needed files and downloading dependencies...`)
    if (err) exec(`npm init -y & npm i express tcp-port-used vhost cookie-parser`, (error, stdout, stderr) => {
        if (error) { console.log(`error: ${error.message}`); return; }
        if (stderr) { console.log(`stderr: ${stderr}`); return; }
        fs.stat(`./src`, (err, stat) => { if (err) { fs.mkdir(__dirname + `/src`, () => {}); } });
        fs.stat(`./src/ExpressServerSettings`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/ExpressServerSettings`); fs.writeFileSync(__dirname + `/src/ExpressServerSettings/config.json`, `{ "BasePage":"home.html", "ErrorPage": "404.html"}`); } })
        fs.stat(`./src/public_html`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/public_html`); } });
        setTimeout(() => {
            fetch(`https://raw.githubusercontent.com/TheFlagen430297/full-express-server/main/setup/settings.json`).then(x => x.json()).then(y => {    
                for (let i = 0; i < y.loadExamplePages.length; i++) {
                    const element = y.loadExamplePages[i];
                    fetch(element.link).then(x => x.text()).then(y => {
                        if (element.paths) {
                            let paths = element.paths
                            paths.forEach(path => {
                                fs.mkdir(__dirname + `/${path}`, (err) => { if (err) return; });
                            })
                            fs.writeFile(__dirname + `/${paths.pop()}/${element.name}`, y, () => { });
                        }
                        else fs.writeFile(__dirname + `/src/public_html/${element.name}`, y, () => { });
                    })
                    if (i == y.loadExamplePages.length - 1) {
                        console.log(`Done`);
                        setTimeout(() => {
                            StartService();
                        }, 3000)
                    }
                }
            })
        }, 3000)
    });
    else {
        console.log(`No setup service needed.`);
        StartService()
    }
})

function StartService() {
    console.log(`Starting Server Service...`)
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
    /**### The IP of the server */
    let ip = "localhost"
    /**### The Server instance */
    let server;

    setTimeout(() => {
        //console.clear()
        /**The Server Settings */
        let ess = JSON.parse(fs.readFileSync(`./src/ExpressServerSettings/config.json`));
        EXPRESS.use(cookieParser());
        fs.readdirSync(`./src/subdomains`).forEach(subdomain => { eval(`console.log("Registered subdomain: ${subdomain}"); EXPRESS.use(vhost("${subdomain}.${ip}", require("./src/subdomains/${subdomain}").${subdomain}));`); });
        EXPRESS.get(`*`, (req, res) => {
            fs.readdir(`./src/subdomains`, (err, files) => {
                let rex = /(.*)\..*/
                if (rex.test(req.hostname)) {
                    let check = rex.exec(req.hostname)[1]
                    if (!files.find( x => x == check)) return res.status(404).send({ status: 404, message: `The subdomain "${check}" does not exist on this server`})
                } else {
                    if (req.path == `/favicon.ico`) return res.status(404).send({ status: 404, message: `Querying /favicon.ico is not supported on this server, please set your favicon in your HTML Code.`})
                    let routes = fs.readdirSync(`./src/public_html`);
                    fs.stat(`./src/public_html/` + req.path, (err, stat) => {
                        if (err) return error()    
                        else if (req.path == "/") {
                            fs.stat(`./src/public_html/` + ess.BasePage, (e, s) => {
                                if (e) return error()
                                else res.sendFile(__dirname + `/src/public_html/` + ess.BasePage);
                            })
                        }
                        else res.status(200).sendFile(__dirname + `/src/public_html/` + req.path);

                        function error() {
                            fs.stat(`./src/public_html/` + ess.ErrorPage, (err, stat) => {
                                if (err) res.status(404).send(`Wow, the 404 page couldn't be found, neither could the page that you are looking for, both are 404 Not Found`);
                                else res.status(404).sendFile(__dirname + `/src/public_html/` + ess.ErrorPage);
                            })
                        }
                    })
                }
            })
        })


        FindOpenPort().then(() => {
            server = HTTP.createServer(EXPRESS).listen(port);
            server.on(`listening`, () => {
                /**The address of the website*/
                let addy = `http://${ip}${port === 80 ? "/" : `:${port}` }`
                setTimeout(() => {
                    console.clear()
                    console.log(`Server open at ${addy}`)
                }, 3000)
            })
        })
    }, 3000);

    /**
     * ### FindOpenPort()
     * Finds an open port, changes the port number, then goes onto the next step.
     * 
     * ```js
     * FindOpenPort().then(() => {
     *  //Code Here 
     * })
     * ```
     * 
     */
    function FindOpenPort() { return new Promise((y , n) => { loop(); function loop() { TCPPU.check(port, '127.0.0.1').then(inUse => { if (inUse) { port++; loop() } else y() }, function(err) { console.error('Error on check:', err.message); n() }); } }); }
}