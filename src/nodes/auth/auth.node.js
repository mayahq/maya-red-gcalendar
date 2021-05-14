const Auth = require('./auth.schema')

const node = new Auth()
const fn = (RED) => node.config(RED)
module.exports = fn