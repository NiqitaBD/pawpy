import cfg from "./main.js"

$(function () {
  $("#header-logo").attr("src", "assets/logoBeige.png")
  $.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    var viewportCenter = (viewportTop + viewportBottom) / 2;
    var centerRange = 50;
    var isInCenter =
      elementTop < viewportCenter + centerRange &&
      elementBottom > viewportCenter - centerRange;
    return isInCenter;
  };

  const h = $(".landing.flex").height() + parseInt($(".landing.flex").css("margin-top").replace(/[^-\d\.]/g, ''))
  $(".wave").css("height", h + 200)
  var dogBreedsTruth = {}
  $.getJSON('../assets/dogs.json', function (data) {
    for(let k in data) {
      var v = data[k]
      if (v) {
        dogBreedsTruth[v] = true
      }
    }
  })

  const wrappers = function () {
    $(".wrapper").each(function () {
      const section = $(this).attr("for")
      const extended = $(this).attr("extended") ? $(this).attr("extended") : 0
      if ($(section).length > 0) {
        $(this).css({
          "height": $(section).height() + parseInt(extended),
          "margin-top": $(section).css("margin-top")
        })
        if (extended > 0) {
          $(this).css("transform", "translateY(" + -extended / 2 + "px)")
        }
        if ($(section).css("background-color") != "transparent") {
          $(this).css("background-color", $(section).css("background-color"))
        } else if ($(section).css("background-image") != "none") {
          $(this).css("background-image", $(section).css("background-image"))
        }
      }
    })
  }
  $(window).on("resize", function () {
    const h = $(".landing.flex").height() + parseInt($(".landing.flex").css("margin-top").replace(/[^-\d\.]/g, ''))
    $(".wave").css("height", h + 200)
  })
  const readImage = function (image) {
    return new Promise(function (resolve, reject) {
      try {
        const reader = new FileReader()
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(image);
      } catch (error) {
        console.log(error);
        resolve(false)
      }
    })
  }
  $("fieldset.age").html(`<legend>Vârsta:</legend> ${cfg["dropDowns"]["age"]}`)
  $("fieldset.sex").html(`<legend>Gen:</legend> ${cfg["dropDowns"]["sex"]}`)
  $(".step").each(function () {
    const step = $(this)
    var opened = false
    step.find(".details").on("click", function () {
      if (opened) {
        opened = false
        step.find(".text").css({ "height": "50px", "--gradient": "var(--beige)" })
        $(this).html(`Mai multe detalii <iconify-icon icon="raphael:arrowdown"></iconify-icon>`)
      } else {
        opened = true
        step.find(".text").css({ "height": "auto", "--gradient": "transparent" })
        $(this).html(`Ascunde <iconify-icon icon="raphael:arrowup"></iconify-icon> `)
      }

    })
  })
  $("#imageSelector").on("change", async function () {
    const image = await (readImage($(this).prop("files")[0]))
    if (image) {
      $("#form .preview").css("background-image", 'url("' + image + '")');
    }
  })
  $("form#form", function () {
    $(this).on("submit", function (e) {
      e.preventDefault()
    })
  })
  $.ajax({
    url: "/getFaq", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: "application/json",
    success: function (res) {
      $("#faq .question").each(function () { $(this).remove() })
      for (let k in res) {
        var v = res[k]
        if (v) {
          $("#faq").append(`
                <div class="question hide animationTransition">
                <div class="flex">
                <iconify-icon icon="mdi:paw"></iconify-icon>
                  <div>
                    <div class="header">${v.header}</div>
                    <div class="content">${v.content}</div>
                  </div>
                </div>
              </div>`)
        }
      }
      wrappers()
      $(".question").each(function () {
        const question = $(this)
        var opened = false;
        var inanim = false
        setTimeout(() => {
          const original_height = $(this).outerHeight()
          $(this).find(".content").hide()
          const new_height = $(this).outerHeight()
          $(this).find(".content").show()
        
          $(this).css("height", new_height + "px")
          $(this).find(".content").fadeOut()
          $("#faq .question .header").css("margin-bottom", "0")

          $(this).on("click", function () {
            if (inanim) return
            inanim = true
            if (opened) {
              // ON CLOSE
              $(this).css("height", new_height + "px")
              $(this).find(".content").hide()
              $("#faq .question .header").css("margin-bottom", "0")
              question.css("background-color", `transparent`)
            } else {
              // ON OPEN
              $(this).css("height", original_height + "px")
              $(this).find(".content").show()
              $("#faq .question .header").css("margin-bottom", "10px")
              question.css("background-color", `rgb(235, 227, 204, .15)`)
            }
            inanim = false
            opened = !opened
          });
        }, 100);
      });
    },
  })
  $.ajax({
    url: "/checkCookie", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
    success: function () {
      $("#btn-confirm").on("click", async function () {
        const image = await readImage($("#imageSelector").prop("files")[0])
        if (!image) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (imagine)!")
        const name = $("#nameSelector").val()
        if (!name) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (nume)!")
        const sex = $("#sexSelector").val()
        if (!sex) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (gen)!")
        const age = $("#ageSelector").val()
        if (!age) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (varsta)!")
        const breed = $("#breedSelector").val()
        if (!breed) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (rasa)!")
        if (!dogBreedsTruth[breed]) return cfg["funcs"]["notify"]("Rasa cățelului este una invalidă")
        const reason = $("#reasonSelector").val()
        if (!reason) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (motiv)!")
        const description = $("#descriptionSelector").val()
        if (!description) return cfg["funcs"]["notify"]("Eroare la introducerea datelor (descriere)!")
        const data = {
          image: image,
          name: name,
          sex: sex,
          age: age,
          breed: breed,
          reason: reason,
          description: description
        }
        $.ajax({
          url: "/addDog", timeout: 3000, type: "post", data: JSON.stringify({ data: data }), contentType: "application/json",
          success: function () {
            cfg["funcs"]["notify"]("Ați adăugat cu succes!")
            $("#form").fadeOut()
          },
          error: function (res) {
            if (res.responseJSON.message) {
              cfg["funcs"]["notify"](res.responseJSON.message)
            } else {
              cfg["funcs"]["notify"]("Eroare!")
            }
          }
        })
      })
    },
    error: function () {
      cfg["funcs"]["notify"]("Pentru a înscrie un cățeluș trebuie să fiți logat!")
    }
  })
  $(".description span").text(`Limita de caractere: 0 / ${$("#descriptionSelector").attr("maxlength")}`)
  $("#descriptionSelector").on("input", function () {
    $(".description span").text(`Limita de caractere: ${$(this).val().length} / ${$(this).attr("maxlength")}`)
    if ($(this).val().length == $(this).attr("maxlength")) {
      $(".description span").css("color", "var(--red)")
    } else {
      $(".description span").css("color", "var(--dark-blue)")
    }
  })
  $(".wrap .data span").css({ "opacity": 0, "top": "-20px" })
  $(".wrap button").css({ "opacity": 0, "bottom": "-20px" })
  $(window).on("scroll", function() {
    if ($(".wrap .data").isInViewport()) {
      $(".wrap .data span").each(function(index) {
        index += 1
        setTimeout(() => {
          $(this).animate({ "opacity": 1, "top": "0" },  300)
        }, index * 200);
      })
      $(".wrap button").animate({ "opacity": 1, "bottom": "0" })
    }
  })
  setTimeout(() => {
    $("#overlayLoader").fadeOut()
  }, 500);
})
