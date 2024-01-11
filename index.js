console.clear()
console.log(`Starting Setup`)
const { exec } = require("child_process");
/**The **FS** library */
const fs = require(`fs`);
fs.stat(`./src/ExpressServerSettings/config.json`, (err, stat) => {
    if (err) console.log(`Setting up needed files and downloading dependencies...`);
    if (err) exec("npm init -y & npm i express tcp-port-used", (error, stdout, stderr) => {
        if (error) { console.log(`error: ${error.message}`); return; }
        if (stderr) { console.log(`stderr: ${stderr}`); return; }
        console.log(`Done`)
        StartService()
    });
    else {
        console.log(`No setup service needed.`);
        StartService()
    }
})

function StartService() {
    console.log(`Starting Server Service`)
    /**The **Express.js** library*/
    const EXPRESS = require(`express`)();
    /**The **http** library */
    const http = require(`http`);
    /**The **tcp-port-used.js** library*/
    let tcpPortUsed = require('tcp-port-used');
    /**### The port of the server */
    let port = 80;
    /**### The IP of the server */
    let ip = "127.0.0.1"
    /**### The Server instance */
    let server;

    console.clear()

    //? This creates the files and folders needed
    fs.stat(`./src`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src`); } });
    fs.stat(`./src/ExpressServerSettings`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/ExpressServerSettings`); fs.writeFileSync(__dirname + `/src/ExpressServerSettings/config.json`, `{ "BasePage":"home.html"}`); } })
    fs.stat(`./src/public_html`, (err, stat) => { if (err) { fs.mkdirSync(__dirname + `/src/public_html`); } })

    setTimeout(() => {
        /**The Server Settings */
        let ess = JSON.parse(fs.readFileSync(`./src/ExpressServerSettings/config.json`))

        EXPRESS.get(`*`, (req, res) => {
            if (req.path == `/favicon.ico`) return res.status(404).send({ status: 404, message: `Querying /favicon.ico is not supported on this server, please set your favicon in your HTML Code.`})
            let routes = fs.readdirSync(`./src/public_html`);
            if (req.path == "/") res.sendFile(__dirname + `/src/public_html/` + ess.BasePage);
            else {
                fs.stat(`./src/public_html/` + req.path, (err, stat) => {
                    if (err) {
                        fs.stat(`./src/public_html/` + ess.ErrorPage, (err, stat) => {
                            if (err) res.status(404).send(`Wow, the 404 page couldn't be found, neither could the page that you are looking for, both are 404 Not Found`);
                            else res.status(404).sendFile(__dirname + `/src/public_html/` + ess.ErrorPage);
                        })
                    } else res.status(200).sendFile(__dirname + `/src/public_html/` + req.path);
                })
            }
        })


        FindOpenPort().then(() => {
            server = http.createServer(EXPRESS).listen(port);
            server.on(`listening`, () => {
                /**The address of the website*/
                let addy = `http://${ip}${port === 80 ? "/" : `:${port}` }`
                console.log(`Opening app at ${addy}`)
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
    function FindOpenPort() { return new Promise((y , n) => { loop(); function loop() { tcpPortUsed.check(port, '127.0.0.1').then(inUse => { if (inUse) { port++; loop() } else y() }, function(err) { console.error('Error on check:', err.message); n() }); } }); }
}