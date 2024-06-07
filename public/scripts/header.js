import cfg from "./main.js";

$(function () {
  $("header").html(`
  <div class="navigation">
    <a href="index.html" class="no-after"><img src="assets/logo.svg" alt="Pawpy Logo" id="header-logo"></a>
    <div class="options">
      <a href="dogs.html">Servicii</a>
      <a href="blogs.html">Blog</a>
      <a href="aboutus.html">Despre Noi</a>
      <a href="account.html">Cont</a>
    </div>
  </div>
  <div class="connectivity">
    <a href="login.html">Conectare</a>
    <a href="register.html" class="borderer no-after">Înscrie-te</a>
  </div>
  <div class="responsiveHeader">
    <a href="index.html"><img src="./assets/logoBeige.png" alt="Pawpy Logo" id="headerLogo"></a>
    <iconify-icon icon="flowbite:bars-solid" class="openHeader"></iconify-icon>
  </div>
`)
  $("body").append(`
  <div class="responsiveOptions">
    <a href="index.html" class="logo"><img src="./assets/logoBeige.png" alt="Pawpy Logo" id="headerLogo"></a>
    <iconify-icon icon="ic:twotone-close" class="closeHeader" style="color: var(--beige) !important;"></iconify-icon>
    <div class="options">
      <a href="dogs.html" class="responsoveOption fadeRight">Servicii</a>
      <a href="blogs.html" class="responsoveOption fadeRight">Blog</a>
      <a href="account.html" class="responsoveOption fadeRight">Cont</a>
      <a href="aboutus.html" class="responsoveOption fadeRight">Despre Noi</a>
      <a href="login.html" class="loginButton responsoveOption fadeRight">Conectare</a>
      <a href="login.html" class="loginButton responsoveOption fadeRight">Înscrie-te</a>
    </div>
  </div>`)
  $(".openHeader").on("click", function () {
    $("header").fadeOut()
    $(".responsiveOptions").show()
    $(".responsiveOptions").css({ "right": "-100%" }).animate({ "right": "0" }, 500);
    $("body").addClass("overlay-active")
    setTimeout(() => {
      $.each($(".responsoveOption"), function (index) {
        $(this).addClass("animationTransition")
        const $el = $(this)
        setTimeout(function () {
          $el.removeClass('fadeRight');
        }, index * 200);
      });
    }, 300);
  })
  $(".closeHeader").on("click", function () {
    $(".responsiveOptions").css({ "right": "0" }).animate({ "right": "-100%" }, 500);
    $("header").fadeIn()
    setTimeout(() => {
      $(".responsiveOptions").hide()
      $("body").removeClass("overlay-active")
      $(".responsoveOption").each(function () { $(this).addClass("fadeRight") })
    }, 500);
  })
  $("body").append(`
    <div id="donation" style="opacity: 0;"><a href="payment.html"><iconify-icon icon="mdi:heart"></iconify-icon> Donează<div></div></a></div>
    <footer>
      <section>
        <a href="index.html" class="footer-logo-a"><img src="assets/logoOrange.png" alt="" class="footerLogo"></a>
        <div class="contentDiv">
          <div class="header">Moldova, Chișinău</div>
          <span>
            <a href="mailto:pawpy@gmail.com" target="_blank">pawpy@gmail.com</a> <br>
            <a href="tel:+373 69987654" target="_blank">+373 69987654</a> <br>
            <a href="https://www.google.com/maps/search/Mircea+Cel+Batrin,+Chișinău/@47.0552519,28.8814586,15z/data=!3m1!4b1?entry=ttu" target="_blank">Mircea cel Bătrân, 20</a> <br>
          </span>
        </div>
        <div class="contentDiv">
          <div class="header">Pawpy</div>
          <span>
            <a href="dogs.html">Servicii</a> <br>
            <a href="blogs.html">Blog</a> <br>
            <a href="account.html">Cont</a> <br>
            <a href="aboutus.html">Despre Noi</a> <br>
          </span>
        </div>
        <div class="subsDiv">
          <span style="font-size: 18px;">Înscrie-te pentru noutăți</span>
          <form class="flex" action="/subscribe" method="POST" enctype="multipart/form-data" id="subsForm">
            <input type="email" name="email" placeholder="Adresa ta de email"  maxlength="30" required>
            <button class="fillButton">Abonează-te</button>
          </form>
          <div class="credsDiv">
            <span>Urmărește-ne</span>
            <div class="flex">
              <a href="https://www.facebook.com/profile.php?id=61560237203628" target="_blank"><iconify-icon icon="uil:facebook"></iconify-icon> </a>
              <a href="https://www.instagram.com/pawpy_shelter?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank"><iconify-icon icon="ri:instagram-fill"></iconify-icon> </a>
              <a href="https://www.tiktok.com/@pawpy.shelter" target="_blank"><iconify-icon icon="mingcute:tiktok-fill"></iconify-icon> </a>
            </div>
          </div>
        </div>
        <img src="assets/dogsFooter.png" alt="Dogs looking Down" class="footerDogs">
      </section>
    </footer>
  `)
  $("#donation").css({"right": "-10%", "opacity": 0}).animate({"right": "0", "opacity": 1}, 1000)
  
  $("#subsForm").on("submit", function (e) {
    e.preventDefault()
    const email = $("#subsForm input[type='email']").val()
    $.ajax({
      url: "/subscribe", timeout: 3000, type: "post", data: JSON.stringify({ email: email }), contentType: 'application/json',
      success: function (res) {
        $("body").append(`
        <div id="thanker">
          <iconify-icon icon="mdi:email-heart-outline"></iconify-icon>
          <span>Abonare cu succes!</span>
        </div>
        `)
        $("#thanker").hide()
        $("#thanker").fadeIn(500)
        setTimeout(() => {
          $("#thanker").fadeOut(500)
        }, 3000);
      },
      error: function (res) {
        if (res.responseJSON.message) {
          cfg["funcs"]["notify"](res.responseJSON.message)
        } else {
          cfg["funcs"]["notify"]("Server error!")
        }
      }
    })
  })
})

