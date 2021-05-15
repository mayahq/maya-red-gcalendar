const DeleteEvent = require('./deleteEvent.schema')

const node = new DeleteEvent()
const fn = (RED) => node.config(RED)
module.exports = fn