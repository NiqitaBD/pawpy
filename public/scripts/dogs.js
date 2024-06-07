import cfg from "./main.js";
import socket from "./socket.js";
$(function () {
  const pageParams = new URLSearchParams(window.location.search);
  const scroll = pageParams.get("scroll")
  if (scroll) {
    window.scrollTo({
      top: $("#scrollTo").offset().top,
      behavior: 'smooth'
    })
  }
  var pageSize = 14
  var localDogsDataToWorkWith = []
  var originalDogs = []
  var data = {
    dogs: []
  }
  var dogBreeds = []
  var dogBreedsData = {}

  const checkSocketConnected = setInterval(() => {
    if (socket.connected) {
      clearInterval(checkSocketConnected);
      socketConnected();
    }
  }, 250);

  const socketConnected = function () {
    socket.emit("connectToPageSocket", "dogs")
    socket.on("refreshDogs", function (arg) {
      data.dogs = arg
      originalDogs = arg
      cfg["funcs"]["notify"]("A fost o schimbare la postări, se încarcă cele noi!")
      loadPosts()
    })
  };

  async function fetchData() {
    try {
      const response = await $.ajax({
        url: "../assets/dogs.json",
        dataType: "json"
      });
      return response;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }
  async function loadData() {
    try {
      const data = await fetchData();
      dogBreeds = data;
      for (const breed of dogBreeds) { dogBreedsData[breed] = true }
    } catch (error) {
      console.error("Failed to load data:", error);
      window.location.href = "index.html"
    }
  }
  loadData();
  $("#headerLogo").attr("src", "./assets/logoBeige.png")
  $("#imageCover").css("height", $(".land").height() + "px")

  const loadPosts = function () {
    $("#dogs").empty()
    localDogsDataToWorkWith = []
    for (let k in data.dogs) {
      var v = data.dogs[k]
      if (localDogsDataToWorkWith.length < pageSize) {
        addDog(v, v.id)
      }
      localDogsDataToWorkWith.push(v)
    }
    buildPagination()
    manageButtons()
  }
  const addDog = function (data, index) {
    if (!data || index === undefined || index === null) return;
    $("#dogs").append(`
      <div class="dog hide">
        <div class="image">
          ${data.verified ? "" : `<div class="tarp"></div>`}
          <img src="${data.image}">
        </div>
        <div class="name">${data.name}</div>
        <div class="info">
          <span class="type">Rasa: </span> <span class="detail">${data.breed}</span><br>
          <span class="type">Vârsta: </span> <span class="detail">${data.age}</span><br>
          <span class="type">Gen: </span> <span class="detail">${data.sex}</span><br>
        </div>
        <button class="fillButton ${data.verified ? "btn-more" : ""}" target="${index}">Mai multe</button>
        ${data.verified ? "" : `<div class="tarp"><iconify-icon icon="material-symbols:hourglass-outline"></iconify-icon> &nbsp Neconfirmat</div>`}
      </div>
    `)
  }
  const buildPagination = function () {
    $(".pagination").empty()
    for (let i = 1; i <= Math.ceil(localDogsDataToWorkWith.length / pageSize); i++) {
      $(".pagination").append(`<div class="number">${i}</div>`)
    }
    if ($(".number").first()) {
      $(".number").first().addClass("selected")
    }
    listeners("page")
  }
  const listeners = function (type) {
    if (!type) return
    switch (type) {
      case "page":
        $(".number").each(function (index) {
          $(this).on("click", function () {
            $(".number").each(function (index) { $(this).removeClass("selected") })
            $(this).addClass("selected"); openPage($(this).text())
          })
        })
        break;
      default:
        break;
    }
  }
  const openPage = function (num) {
    if (!num) return
    num = num - 1
    $("#dogs").empty()
    var num = parseInt(num)
    for (let i = (num * pageSize); i < (num * pageSize) + pageSize; i++) {
      var v = localDogsDataToWorkWith[i]
      if (v) {
        addDog(v, v.id)
      }
    }
    manageButtons()
    $(".back")[0].scrollIntoView({ behavior: "smooth", block: "start" });
  }
  const manageButtons = function () {
    document.querySelectorAll(".btn-more").forEach(function (i) {
      i.addEventListener("click", function () { openDog(this.getAttribute("target")) })
    })
    $(".btn-more").each(function (index) {
      $(this).on("click", function () { openDog($(this).attr("target")) })
    })
  }
  const openDog = function (id) { if (id) window.location.href = `dog.html?did=${id}` }
  $("#overlay").hide()
  $("#btn-close").on("click", function () {
    $("#overlay").fadeOut(300)
    $("body").removeClass('overlay-active');
  })
  $("section.land").css("padding-top", ($("section.land").height() - $(".container").height()) / 2 + 50 + "px")
  $.post(`/requestDogs`, { request: "dogs" }, function (event) {
    if (event.ok) {
      data.dogs = event.dogs
      originalDogs = event.dogs
      loadPosts()
      $("#headerLogo").attr("src", "./assets/logoBeige.png")
      $(".paperContinuous").css("height", $(".paper").height() + "px")
      setTimeout(() => {
        $("#overlayLoader").fadeOut(300);

        $(".primary").each(function(index) {
          index += 1;
          setTimeout(() => {
            $(this).css({
              "top": "-35px",
              "opacity": 0
            }).animate({
              "top": "0",
              "opacity": 1  
            }, 500);
          }, index * 100);
        });
        setTimeout(() => {
          $(".header-button-dogs").css({
            "bottom": "-15px",
            "opacity": 0
          }).animate({
            "bottom": "0",
            "opacity": 1  
          }, 300);
        }, $(".primary").length * 200);

      })
      // $(".container").addClass("fromRight")
      $(".dohouse").addClass("fromLeft")
    }
  });
  $("#inp-image").on("change", function () {
    var input = document.getElementById('inp-image');
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function (e) { $('.side .image').css('background-image', 'url("' + e.target.result + '")'); };
      reader.readAsDataURL(input.files[0]);
    }
  })
  $("#form").on("submit", function (event) { location.reload() });
  $(".dropdowns").html(`
    <div>
      <span>Vârsta:</span>
      ${cfg["dropDowns"]["age"]}
    </div>
    <div>
      <span>Gen:</span>
      ${cfg["dropDowns"]["sex"]}
    </div>
  `)

  $("#filters .side.first").html(`
    ${cfg["dropDowns"]["age"]}
    <input type="text" placeholder="Rasa" class="breedSelectorInput" breed-selector-id="2" maxlength="50" target="breed">
    ${cfg["dropDowns"]["sex"]}
  `)

  $("#filters .display").hide()
  $("#filters .menu").hide()
  $("#filters .settings").on("click", function () {
    $(this).fadeOut(400)
    setTimeout(() => {
      $(this).hide()
      $("#filters").css("margin-bottom", "15px")
      $("#filters .display").fadeIn(400)
    }, 400);
  })
  $("#filters .button.orange").on("click", function () { $("#filters .menu").fadeIn() })
  var filters = {}
  const updateByFilters = function () {
    data.dogs = originalDogs;
    for (let filter in filters) {
      const value = filters[filter];
      if (value) {
        data.dogs = data.dogs.filter(function (dog) {
          return dog[filter] === value;
        });
      }
    }
    if (data.dogs.length < 1) { return $("#dogs").html(`<div class="header" style="text-align: center;">Nu am găsit nici un cățeluș</div>`) }
    loadPosts();
  };

  $("#filters .menu .apply").on("click", function () {
    $("#filters .side.first select").each(function () {
      const value = $(this).val()
      const type = $(this).attr("target")
      if (value && type && value !== "default" && value !== null && value !== "null") {
        filters[type] = value
      } else {
        delete filters[type];
      }
    })
    if ($("#filters .menu input").val().length > 3) {
      const value = $("#filters .menu input").val()
      const type = $("#filters .menu input").attr("target")
      if (value && type) {
        filters[type] = value
      }
    }
    $("#filters .display .filter").each(function () { $(this).fadeOut() })

    for (let filter in filters) { $("#filters .display").append(`<div class="button filter" type="${filter}">${filters[filter]} <iconify-icon icon="ep:close-bold"></iconify-icon></div>`) }
    updateByFilters()
    $("#filters .display .filter").each(function () {
      $(this).on("click", function () {
        const type = $(this).attr("type")
        $(this).fadeOut(400)
        setTimeout(() => {
          $(this).remove()
        }, 400);
        if (type) {
          delete filters[type];
          if ($(`#filters select[target="${type}"]`).val()) {
            $(`#filters select[target="${type}"]`).val("default");
          } else if ($(`#filters input[target="${type}"]`).val()) {
            $(`#filters input[target="${type}"]`).val("");
          }
          updateByFilters()
        }
      })
    })
    $("#filters .menu").fadeOut()
  })
})