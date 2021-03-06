// Output: SSE
const cors = require("cors")
const express = require("express")
const ip = require("ip")
const rvn = require("ravencore-lib")
const defaults = { port: 3001 }
const init = function(config) {
  let app = (config.app ? config.app : express())
  let connections = config.connections
  app.use(cors())
  app.use(function (req, res, next) {
    res.sseSetup = function() {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
        "Connection": "keep-alive",
      })
      res.sseSend({ type: "open", data: [] })
    }
    res.sseSend = function(data) {
      res.write("data: " + JSON.stringify(data) + "\n\n")
    }
    next()
  })
  app.get("/s", async function(req, res) {
    try {
      let query = {
        "v": 3, "q": { "find": {} }
      }

      // ravencoin address as fingerprint
      const privateKey = new rvn.PrivateKey()
      const fingerprint = privateKey.toAddress().toString()

      res.$fingerprint = fingerprint
      connections.pool[fingerprint] = { res: res, query: query }
      console.log("## Opening connection from: " + fingerprint)
      console.log(JSON.stringify(req.headers, null, 2))
      req.on("close", function() {
        console.log("## Closing connection from: " + res.$fingerprint)
        console.log(JSON.stringify(req.headers, null, 2))
        delete connections.pool[res.$fingerprint]
        console.log(".. Pool size is now", Object.keys(connections.pool).length)
      })
    } catch (e) {
      console.log(e)
    }
  })
  app.get(/^\/s\/(.+)/, async function(req, res) {
    try {
      let b64 = req.params[0]

      // ravencoin address as fingerprint
      const privateKey = new rvn.PrivateKey()
      const fingerprint = privateKey.toAddress().toString()

      res.sseSetup()
      let json = Buffer.from(b64, "base64").toString()
      let query = JSON.parse(json)

      res.$fingerprint = fingerprint
      connections.pool[fingerprint] = { res: res, query: query }

      console.log("## Opening connection from: " + fingerprint)
      console.log(JSON.stringify(req.headers, null, 2))
      req.on("close", function() {
        console.log("## Closing connection from: " + res.$fingerprint)
        console.log(JSON.stringify(req.headers, null, 2))
        delete connections.pool[res.$fingerprint]
        console.log(".. Pool size is now", Object.keys(connections.pool).length)
      })
    } catch (e) {
      console.log(e)
    }
  })
  // if no express app was passed in, need to bootstrap.
  if (!config.app) {
    let port = (config.port ? config.port : defaults.port)
    app.listen(port , function () {
      console.log("######################################################################################")
      console.log("#")
      console.log("#  RVNSOCKET: Universal Programmable Ravencoin Push Notifications Network")
      console.log("#  Pushing Ravencoin in realtime through Server Sent Events...")
      console.log("#")
      console.log(`#  API Endpoint: ${ip.address()}:${port}/s`)
      console.log("#")
      console.log("#  Learn more at https://bitsocket.org") // https://developer.ravencoin.online/rvnsocket
      console.log("#")
      console.log("######################################################################################")
    })
  }
}
module.exports = { init: init }
