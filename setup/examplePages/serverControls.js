const { createNewSubdomain } = require(`./../../../FESStart`);


/**### Kills the server @param {number} code a stop code*/
let kill = (code) => { /*console.log(`Stopped Server with code: ${code}`); process.exit(code);*/ }

module.exports = { kill, createNewSubdomain }