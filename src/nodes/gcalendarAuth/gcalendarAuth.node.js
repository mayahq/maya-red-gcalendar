const GcalendarAuth = require('./gcalendarAuth.schema')

const node = new GcalendarAuth()
const fn = (RED) => node.config(RED)
module.exports = fn