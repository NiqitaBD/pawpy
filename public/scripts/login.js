import cfg from "./main.js";

$(function() {
  const w = (($(window).width() - 1200 ) / 2) + ( 1200 - ($(".content").width() + $(".wave").width())) + 50;
  $(".color").css("width", w);
  window.onresize = function() {
    const w = (($(window).width() - 1200 ) / 2) + ( 1200 - ($(".content").width() + $(".wave").width())) + 50;
    $(".color").css("width", w);
  }
  var shown = false;
  $(".eye").on("click", function() {
    if (!shown) {
      $(this).attr("icon", "iconamoon:eye-off-bold");
      $("#password").attr("type", "text");
    } else {
      $(this).attr("icon", "iconamoon:eye");
      $("#password").attr("type", "password");
    }
    shown = !shown;
  });
  $("form").on("submit", function(event){
    event.preventDefault();
    const email = $("input[type=email]").val();
    const password = $("#password").val();
    $.ajax({
      url: "/tryConnect", type: "post", data: JSON.stringify({ email: email, password: password }), contentType: 'application/json',
      success: function(data) {
        if (data.ok) {
          cfg["funcs"]["setCookie"]("connection", data.val);
          cfg["funcs"]["notify"]("Conectat cu succes", 3000);
          setTimeout(function() {
            window.location.href = "/";
          }, 3000);
        } else {
          cfg["funcs"]["notify"]("Eroare la conectare", 3000);
        }
      }, 
      error: function(data) {
        cfg["funcs"]["notify"]("Eroare la baza de date.")
        console.log(data);
      }
    });
  });
  $(".forgot-password").on("click", function() {
    const email = $("input[type=email]").val();
    if (!email || email.length < 5) return cfg["funcs"]["notify"]("Introdu adresa de Email în caseta respectivă!");
    $.ajax({
      url: "/requestForgotPassword", type: "post", data: JSON.stringify({ email: email }), contentType: 'application/json',
      success: function() {
        cfg["funcs"]["notify"]("Verifică adresa de Email pentru a continua.");
      },
      error: function() {
        cfg["funcs"]["notify"]("Eroare la baza de date.");
      }
    });
  });
});
