const rvn = require("./rvn")
const socket = require("./socket")
const init = function(config) {

  // Cconnection pool init
  const connections = { pool: {} }

  // Rvndb Consumer Init
  let r = (config && config.rvn ? Object.assign({}, config.rvn) : {})
  r.connections = connections
  rvn.init(r)

  // SSE Producer Init
  let s = (config && config.socket ? Object.assign({}, config.socket) : {})
  s.connections = connections
  socket.init(s)

}
module.exports = { init: init }
