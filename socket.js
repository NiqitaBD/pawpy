const cfg = require("./funcs.js")
const { Server } = require("socket.io");
const { join } = require('node:path');

var source = {}
var inPage = {}
let io

function removeFromPages(socket) {
  Object.keys(inPage).forEach(page => {
    if (inPage[page] === socket) {
      delete inPage[page];
      console.log(`Socket removed from page: ${page}`);
    }
  });
}

const initializeSocket = function (server) {
  io = new Server(server);
  io.on('connection', (socket) => {
    let uid = undefined
    socket.on("ping", function (arg) {
      const device_id = arg.device_id
      const [logged, uid] = cfg["funcs"]["validateCookie"](arg.cookie)
      if (logged) {
        if (source[uid]) {
          if (device_id !== source[uid].device_id) {
            source[uid].s.emit("notify", "Cineva s-a conectat pe acest cont!")
            source[uid].s.emit("lockdown", "S-a conectat cineva pe contul acesta! Ne pare rău.")
            // SCHIMBĂ LA SURSA NOUĂ
            source[uid] = {
              s: socket,
              device_id: device_id
            }
            source[uid].s.emit("notify", "Cineva deja era conectat pe acest cont!")
            console.log("User " + uid + " connected on another device!");
          } else {
            source[uid] = {
              s: socket,
              device_id: device_id
            }
            console.log("User " + uid + " connected on same device!");
          }
        } else {
          console.log("User " + uid + " connected!");
          source[uid] = {
            s: socket,
            device_id: device_id
          }
        }
      }
    })
    socket.on('disconnect', () => {
      if (uid) {
        source[uid] = null
        if (inDogs[uid]) {
          inDogs[uid] = null
        }
      }
      removeFromPages(socket);
      console.log('User ' + (uid ? uid : '') + ' disconnected');
    });
    socket.on("connectToPageSocket", function (arg) {
      if (!inPage[arg]) { inPage[arg] = [] }
      inPage[arg].push(socket)
      if (arg == "account") { console.log("User connected to account"); }
    })
  });
}

const TriggerClientEvent = function (uid, event, params) {
  if (!uid || !event || !params) return
  if (!source[uid]) return
  const s = source[uid].s
  if (!s) return
  s.emit(event, params)
}

const TriggerPageEvent = function (page, event, param) {
  return new Promise(function(resolve, reject) {
    if (!page || !event || !param) return
    for (let k in inPage[page]) {
      if (inPage[page][k]) {
        const s = inPage[page][k]
        if (s) {
          s.emit(event, param)
        }
      }
    }
    resolve(true)
  })
}

module.exports = {
  initializeSocket,
  TriggerClientEvent,
  TriggerPageEvent
};