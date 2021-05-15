const ListEvents = require('./listEvents.schema')

const node = new ListEvents()
const fn = (RED) => node.config(RED)
module.exports = fn