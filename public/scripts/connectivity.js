import cfg from "./main.js";

$(function () {
  $.ajax({
    url: "/checkCookie", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
    success: function (res) {
      $(".connectivity").html(`
        <img src="${res.val.image}" alt="Profil Utilizator" class="UserProfile">
        <a href="account.html" style="color: var(--orange);">Bun venit, ${res.val.firstname} </a>
      `)
      $(".loginButton").html("Deconectează-te")
      $(".loginButton").eq(1).remove()
      $(".loginButton").on("click", function () { cfg["funcs"]["setCookie"]("connection", "", 100) })
    },
    error: function (err) {
      if (err.responseJSON) {
        if (err.responseJSON.message == "delete") {
          window.location.href = "index.html"
          document.cookie = "connection" + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
      }
    }
  })
})