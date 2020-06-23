const colors = require('colors/safe');


const log = (...args) => {
   console.log(colors.yellow(...args));
}

const log_warn =   (...args) => {
   console.log(colors.yellow(...args));
}

const log_err = (...args) => {
   console.log(colors.red(...args));
}

module.exports = { log, log_warn, log_err }
