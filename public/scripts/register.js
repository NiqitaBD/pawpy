import cfg from "./main.js";

$(function () {
  var shown = false
  $(".eye").on("click", function() {
    if (!shown) {
      $(this).attr("icon", "iconamoon:eye-off-bold")
      $("#password").attr("type", "text")
    } else {
      $(this).attr("icon", "iconamoon:eye")
      $("#password").attr("type", "password")
    }
    shown = !shown
  })
  $("form").on("submit", function (event) {
    event.preventDefault();
    const firstname = $("#firstname").val()
    const lastname = $("#lastname").val()
    const email = $("#email").val()
    const password = $("#password").val()
    $.ajax({
      url: "/tryRegister", type: "post", data: JSON.stringify({ firstname: firstname, lastname: lastname, email: email, password: password }), contentType: 'application/json',
      success: function (data) {
        cfg["funcs"]["notify"]("Înregistrat cu succes...")
        setTimeout(() => {
          window.location.href = "index.html"
        }, 2500);
      },
      error: function (error) {
        cfg["funcs"]["notify"]("Eroare: " + error.responseJSON.val);
      }
    })
  })
})