import cfg from "./main.js";
$(function () {
  const pageParams = new URLSearchParams(window.location.search);
  const donate = pageParams.get("donate");
  if (donate) {
    $("html").animate(
      { scrollTop: $(".donation-section").offset().top + 500 }, 800
    );
  }
  let logged = false;
  const manageStars = function () {
    $("#overlay .star").each(function (index) {
      $(this).on("click", function () {
        const value = $(this).attr("count");
        appendStars(value);
      });
    });
  };
  let stars = 0;
  const appendStars = function (value) {
    if (!value) return;
    if (stars == value) value = 0;
    stars = value;
    value = parseInt(value);
    $("#overlay .stars").empty();
    for (let i = 1; i <= value; i++) {
      $("#overlay .stars").append(
        `<img src="assets/star.svg" alt="" count="${i}" class="star fill-star">`
      );
    }
    for (let i = value + 1; i <= 5; i++) {
      $("#overlay .stars").append(
        `<img src="assets/starh.svg" alt="" count="${i}" class="star">`
      );
    }
    manageStars();
  };
  manageStars();
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
  const vhToPixel = Math.round(window.innerHeight);
  $(".landing .data .content").css("padding-top", vhToPixel / 2 - 225 + "px");
  $(window).on("resize", function () {
    const vhToPixel = Math.round(window.innerHeight);
    $(".landing .data .content").css("padding-top", vhToPixel / 2 - 225 + "px");
  });
  const waveW = $(".wave-side-r").width();
  const waveD = 1200 - waveW;
  const waveSizer = function () {
    const w = $(window).width();
    $("#paperContinue").css("height", $(".wave-side-r").height() + "px");
    $(".wave-side-r").css("width", waveD + "px");
    if (w < 950) {
      $(".wave-side-r").css("width", waveD - 150 + "px");
    } else if (w < 1100) {
      $(".wave-side-r").css("width", waveD - 100 + "px");
    }
  };
  window.onresize = waveSizer;
  waveSizer();
  const numImages = $(".carousel .image").length;
  const imageWidth = $(".carousel .image").width();
  $(".carousel .image").css("left", `max(${imageWidth * numImages}px, 100%)`);
  $(".carousel .image").each(function (index) {
    const len = $(".carousel .image").length;
    const str = (30 / len) * (index + 1) * -1;
    $(this).css({
      "animation-delay": str + "s",
      "background-image": `url('assets/db/photos/photos (${index + 1}).jpg')`
    });
    $(this).on("click", function () {
      cfg["funcs"]["viewImage"](`assets/db/photos/photos (${index + 1}).jpg`)
    })
  });
  $(".prompt span").text(`Limita de caractere: 0 / ${$("#content").attr("maxlength")}`)
  $("#content").on("input", function () {
    $(".prompt span").text(`Limita de caractere: ${$(this).val().length} / ${$(this).attr("maxlength")}`)
    if ($(this).val().length == $(this).attr("maxlength")) {
      $(".prompt span").css("color", "var(--red)")
    } else {
      $(".prompt span").css("color", "var(--dark-blue)")
    }
  })

  $.ajax({
    url: "/requestLanding",
    timeout: 3000,
    type: "post",
    data: JSON.stringify({}),
    contentType: "application/json",
    success: function (res) {
      const data = res.data;
      logged = data.logged;
      if (data.data) {
        for (let k in data.data[0]) {
          var v = data.data[0][k]
          if (v) {
            if ($(`#dp-${k}`).length > 0) {
              $(`#dp-${k}`).attr("scope", v)
            }
          }
        }
        var animdone = false
        $(window).on("scroll", function () {
          if (animdone) return
          if ($(".stats").isInViewport()) {
            animdone = true
            const animDur = 2000
            $(".stat").each(function () {
              var start = 0
              var end = parseInt($(this).attr("scope"))
              const stat = $(this)
              var tick = animDur / Math.abs(end - start)
              const step = function () {
                if (start == end) { return clearInterval(interval) }
                if (start > 1000) {
                  start += 10
                } else {
                  start += 1
                }
                stat.find("span").html("+" + start)
              }
              const interval = setInterval(step, tick)
            })
          }
        })
      }
      if (data.dogs) {
        $("#dogs").empty();
        for (let k in data.dogs) {
          var v = data.dogs[k];
          if (v) {
            $("#dogs").append(`
              <div class="dog shadow hide">
                <img src="${v.image}" alt="">
                <div class="name">${v.name}</div>
                <div class="data">
                  <span>Rasa: </span>${v.breed} <br>
                  <span>Vârsta: </span>${v.age} <br>
                  <span>Gen: </span>${v.sex}
                </div>
                <button class="more" dog-id="${v.id}">Mai multe</button>
              </div>
            `);
          }
        }
        $("#dogs .dog button.more").each(function () {
          $(this).on("click", function () {
            const did = $(this).attr("dog-id");
            if (did) {
              window.location.href = "dog.html?did=" + did;
            }
          });
        });
      }

      $("#btn-donate").on("click", function () {
        const name = $("#inp-donate-name").val();
        const value = $("#inp-donate-value").val();
        if (!name || name.length < 5)
          return cfg["funcs"]["notify"]("Numele introdus nu este valid.");
        if (!value || value.length < 1)
          return cfg["funcs"]["notify"]("Suma introdusă nu este validă.");
        window.location.href = `payment.html?name=${name}&value=${value}`;
      });

      if (data.feedbacks) {
        $("#feedbacks .cards").empty();
        for (let k in data.feedbacks) {
          var v = data.feedbacks[k];
          if (v) {
            $("#feedbacks .cards").append(`
            <div class="card">
              <div class="flex">
                <img src="${v.image}" alt="">
                <div class="user-data">
                  <span>${v.header}</span>
                  <div>
                  ${`<img src="./assets/star.svg" alt="Star" class="star">`.repeat(
              parseInt(v.stars)
            )}
                  ${`<img src="./assets/starh.svg" alt="Star" class="star">`.repeat(
              5 - parseInt(v.stars)
            )}      
                  </div>
                </div>
              </div>
              <span class="content">${v.content}</span>
            </div>`);
          }
        }
      }

      $(".fbutton").each(function () {
        $(this).on("click", function () {
          var dir = $(this).attr("direction");
          switch (dir) {
            case "right":
              $("#feedbacks .cards").scrollLeft(
                $("#feedbacks .cards").scrollLeft() + 1000
              );
              break;
            case "left":
              $("#feedbacks .cards").scrollLeft(
                $("#feedbacks .cards").scrollLeft() - 1000
              );
              break;
            default:
              break;
          }
        });
      });
      setTimeout(() => {
        $("#overlayLoader").fadeOut(300);
        $(".primary").each(function(index) {
          index += 1;
          setTimeout(() => {
            $(this).css({
              "bottom": "-35px",
              "opacity": 0
            }).animate({
              "bottom": "0",
              "opacity": 1  
            }, 500);
          }, index * 100);
        });
        setTimeout(() => {
          $(".absoluter").css({
            "top": "-15px",
            "opacity": 0
          }).animate({
            "top": "0",
            "opacity": 1  
          }, 300);
        }, $(".primary").length * 200);
      })
      $(window).on("scroll", function() {
        $(".wrap .item").each(function(index) {
          index += 1
          setTimeout(() => {
            $(this).removeClass("hidden")
          }, index * 100);
        })
      })
      $(window).on("scroll", function () {
        if ($("#feedbacks").isInViewport()) {
          if (logged) {
            $("#overlay").fadeIn();
            $("#overlay .close").on("click", function () {
              $("#overlay").fadeOut();
            });
            $("#overlay .post").on("click", function () {
              const stars = $(".fill-star").length;
              if (!stars)
                return cfg["funcs"]["notify"](
                  "Numărul de steluțe este invalid!"
                );
              const content = $("#overlay #content").val();
              if (!content || content.length < 10 || content.length > 100)
                return cfg["funcs"]["notify"](
                  "Mesajul recenziei nu este valid!"
                );
              $("#overlay .prompt").css({ width: "440px", height: "360px" });
              $("#overlay .prompt").html(`
                <div class="header">Se postează recenzia</div>
                <iconify-icon icon="line-md:loading-loop" style="font-size: 5rem;"></iconify-icon>
              `);
              $.ajax({
                url: "/addFeedback",
                timeout: 3000,
                type: "post",
                data: JSON.stringify({ stars: stars, content: content }),
                contentType: "application/json",
                success: function () {
                  setTimeout(() => {
                    $("#overlay .prompt").html(`
                      <div class="header">Recenzia a fost postată cu succes!</div>
                      <iconify-icon icon="ph:check-bold" style="font-size: 5rem;"></iconify-icon>
                    `);
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }, 200);
                },
                error: function () {
                  setTimeout(() => {
                    $("#overlay .prompt").html(`
                      <div class="header">A intervenit o eroare la postarea recenziei!</div>
                      <iconify-icon icon="bx:error" style="font-size: 5rem;"></iconify-icon>
                    `);
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }, 200);
                },
              });
            });
          } else {
            cfg["funcs"]["notify"](
              "Pentru a lăsa o recenzie trebuie să fiți logat!"
            );
          }
          $(window).unbind("scroll");
        }
      });
    },
  });
});
