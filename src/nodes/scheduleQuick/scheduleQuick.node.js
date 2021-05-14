const ScheduleQuick = require('./scheduleQuick.schema')

const node = new ScheduleQuick()
const fn = (RED) => node.config(RED)
module.exports = fn