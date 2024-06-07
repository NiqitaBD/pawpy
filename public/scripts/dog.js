import cfg from "./main.js"

$(function () {
  $("#overlay").hide()
  $(".hallowButton").addClass("hallowButtonBlue")
  const pageParams = new URLSearchParams(window.location.search)
  const did = pageParams.get("did")
  const pen = pageParams.get("pen") == "true" ? true : false
  let localData
  const closePage = function () { window.location.href = "dogs.html" }
  const openPrompt = function (action, name) {
    if (!action || !name) return
    const stringed = JSON.stringify(localData)
    const destringed = JSON.parse(stringed)
    if (cfg["dropDowns"][action]) {
      $("#overlay .prompt").html(`
      <span>Dorești să schimbi datele?</span>
      ${cfg["dropDowns"][action]}
      <div class="flex">
        <button class="confirm">Salvează</button>
        <button class="cancel">Renunță</button>
      </div>`)
      $("#overlay .prompt span").text(`Schimbă ${name}`)
      $("#overlay .confirm").attr("action", action)
      $("#overlay").fadeIn()
    } else if (action != "description") {
      $("#overlay .prompt").html(`
      <span>Schimbare ${name}</span>
      <input type="text" placeholder="Valoare:" maxlength="50">
      <div class="flex">
        <button class="confirm">Salvează</button>
        <button class="cancel">Renunță</button>
      </div> `)
      $("#overlay .prompt span").text(`Schimbă ${name}`)
      $("#overlay .confirm").attr("action", action)
      $(".prompt input").val(destringed[action]);
      $("#overlay").fadeIn()
    } else {
      $("#overlay .prompt").html(`
      <span>Schimbare ${name}</span>
      <textarea name="description" placeholder="Lorem ipsum dolor sit amet consectetur. Sem leo viverra dapibus consectetur nunc rhoncus suscipit. Egestas egestas fermentum mattis interdum. Pulvinar ultrices magna in aliquet eget." required></textarea>
      <div class="flex">
        <button class="confirm">Salvează</button>
        <button class="cancel">Renunță</button>
      </div> `)
      $("#overlay .prompt span").text(`Schimbă ${name}`);
      $("#overlay .confirm").attr("action", action);
      $(".prompt textarea").val(destringed[action]);
      $("#overlay").fadeIn()
    }
    manageButtons()
  }
  if (!did) {
    window.location.href = "dogs.html"
    return
  } else {
    fetch(`/getDogData`, {
      method: "POST",
      body: JSON.stringify({ id: did, cookie: cfg["funcs"]["getCookie"]("connection") }),
      headers: { "Content-type": "application/json; charset=UTF-8" }
    })
      .then(function (response) { return response.json(); })
      .then(function (data) {
        if (data.ok) {
          const v = data.data
          if (v) {
            localData = v
            $(".data").empty()
            $(".data").append(`
              <div class="like"><iconify-icon icon="bx:heart" dog-id="${v.id}"></iconify-icon></div>
              <div class="name ${v.owner && pen ? 'changeable' : ''}" action="name">${v.name}</div>
              <div class="detail ${v.owner && pen ? 'changeable' : ''}" action="breed"><span>Rasa: </span>${v.breed}</div>
              <div class="detail ${v.owner && pen ? 'changeable' : ''}" action="age"><span>Vârsta: </span>${v.age}</div>
              <div class="detail ${v.owner && pen ? 'changeable' : ''}" action="sex"><span>Gen: </span>${v.sex}</div>
              <div class="detail ${v.owner && pen ? 'changeable' : ''}" action="description"><span>Descriere: </span>${v.description}</div>
              <div class="absolute">Postat de ${v.ownerdata}, pe ${v.date}</div>
              <a href="tel:+37379013713"><div class="blueButton">Contactați-ne</div></a>
            `)

            if (v.liked) {
              $(".like").html(`<iconify-icon icon="bxs:heart" dog-id="${v.id}"></iconify-icon>`)
            } else {
              $(".like").html(`<iconify-icon icon="bx:heart" dog-id="${v.id}"></iconify-icon>`)
            }
            const likedListener = function () {
              $(".like iconify-icon").on("click", function () {
                if (!$(this).attr("dog-id")) return
                $(".like").html(`<iconify-icon icon="line-md:loading-loop"></iconify-icon>`)
                $.ajax({
                  url: "/likePost", timeout: 3000, type: "post", data: JSON.stringify({ did: $(this).attr("dog-id") }), contentType: 'application/json',
                  success: function (res, data) {
                    setTimeout(() => {
                      if (res.bool) {
                        cfg["funcs"]["notify"]("Ați adăugat cățelul la favorite!")
                        $(".like").html(`<iconify-icon icon="bxs:heart" dog-id="${v.id}"></iconify-icon>`)
                      } else {
                        cfg["funcs"]["notify"]("Ați scos cățelul de la favorite!")
                        $(".like").html(`<iconify-icon icon="bx:heart" dog-id="${v.id}"></iconify-icon>`)
                      }
                      likedListener()
                    }, 300);
                  },
                  error: function (res, data) {
                    if (res.responseJSON.message) {
                      cfg["funcs"]["notify"](res.responseJSON.message)
                    } else {
                      cfg["funcs"]["notify"]("A intervenit o eroare, reîncercăm.")
                    }
                    $(".like").html(`<iconify-icon icon="bx:heart" dog-id="${v.id}" class="shake"></iconify-icon>`)
                    $(".like").removeClass("shake")
                    likedListener()
                  }
                })
              })
            }
            likedListener()
            if (pen && v.owner) {
              $(".detail").each(function () {
                $(this).html(`<iconify-icon icon="tabler:edit"></iconify-icon> ${$(this).html()}`)
              })
              $(".image").addClass("after")
              $(".image").append(`
                <form action="/changeDogImage" method="POST" enctype="multipart/form-data" id="dogImageForm">
                  <input type="file" name="image" id="inp-image" accept="image/*" required>
                  <input type="number" name="did" id="inp-did" required>
                </form>          
                <img src="${v.image}" class="dog">
              `)
              $("#inp-did").val(v.id)
              $("#inp-image").on("change", function () {
                $("#dogImageForm").submit();
              });
              if (v.owner) {
                $(".changeable").each(function (index) {
                  $(this).on("click", function () {
                    const action = $(this).attr("action")
                    openPrompt(action, cfg["dict"][action])
                  })
                })
              }
            } else {
              $(".image").append(`
              <img src="${v.image}" class="dog">
            `)
              $(".image").on("click", function() {
                cfg["funcs"]["viewImage"](v.image)
              })
            }

            $(".data-section").hide()
            $(".paw").hide()
            $(".blueButton").css({
              "opacity": 0,
              "right": "50px"
            })
            $("#overlayLoader").fadeOut(300)
            setTimeout(() => {
              $(".data-section").fadeIn()
              setTimeout(() => {
                $(".paw").fadeIn()
                setTimeout(() => {
                  $(".blueButton").animate({
                    "opacity": 1,
                    "right": "0"
                  })    
                }, 200);
              }, 300);
            }, 300);
          } else closePage()
        } else closePage()
      })
      .catch(function (error) { console.error("Error:", error); });
  }
  const manageButtons = function () {
    $("#overlay .confirm").on("click", function () {
      const action = $(this).attr("action")
      let value
      if ($("#overlay input").val()) {
        value = $("#overlay input").val()
      } else if ($("#overlay select").val()) {
        value = $("#overlay select").val()
      } else if ($("#overlay textarea").val()) {
        value = $("#overlay textarea").val()
      }
      if (!action || !value) return
      fetch(`/changeDogData`, {
        method: "POST",
        body: JSON.stringify({ id: did, cookie: cfg["funcs"]["getCookie"]("connection"), action: action, value: value }),
        headers: { "Content-type": "application/json; charset=UTF-8" }
      })
        .then(function (response) { return response.json(); })
        .then(function (data) { })
        .catch(function (error) { console.error("Error:", error); });
        if (pen) {
          window.location.href = `dog.html?did=${did}&pen=true`
        } else {
          window.location.href = "dog.html?did=" + did
        }
      })
    $("#overlay .cancel").on("click", function () { $("#overlay").fadeOut() })
  }
  $("footer").hide()
})