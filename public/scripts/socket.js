import cfg from "./main.js";

$("body").append(`<script src="/socket.io/socket.io.js"></script>`)

const socket = io();

var client_device_id = localStorage.getItem('client_device_id');
if (!client_device_id) {
    client_device_id = Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36);
    localStorage.setItem('client_device_id', client_device_id);
}

const cookie = cfg["funcs"]["getCookie"]("connection")
if (cookie) {
  socket.emit("ping", {cookie: cookie, device_id: client_device_id})
}

socket.on("notify", (arg) => {
  cfg["funcs"]["notify"](arg)
});

socket.on("lockdown", (arg) => {
  $("body").html(`
      <div id="overlayLockdown">
        <strong>${arg}</strong>
      </div>
    `)
})

export default socket

