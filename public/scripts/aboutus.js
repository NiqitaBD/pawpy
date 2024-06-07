$(function () {
  var data = {
    "founder": {
      images: 2,
      current: 1
    },
    "us": {
      images: 8,
      current: 1
    },
    "team": {
      images: 8,
      current: 1
    }
  }
  function preloadImage(url) {
    var img = new Image();
    img.src = url;
  }
  
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
  const setImage = function (db) {
    $(`#${db} .image`).css("background-image", `url('../assets/db/${db}/${db} (${data[db].current}).png')`)
  }
  $("#header-logo").attr("src", "assets/logoBeige.png")
  $(".image").each(function () {
    const image = $(this)
    const db = image.attr("db")

    setImage(db)

    image.append(`
    <div class="arrow" direction="left"><</div>
    <div class="arrow" direction="right">></div>`)
    image.find(".arrow").each(function () {
      $(this).on("click", function () {
        const direction = $(this).attr("direction")
        if (direction === "left") {
          data[db].current === 1 ? data[db].current = data[db].images : data[db].current -= 1;
        } else {
          data[db].current === data[db].images ? data[db].current = 1 : data[db].current += 1;
        }
        setImage(db)
      })
    })
  })
  $.ajax({
    url: "/requestWorkers", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
    success: function (res) {
      $(".worker").each(function () {
        $(this).remove()
      })
      for (let k in res.data) {
        const v = res.data[k]
        if (v) {
          $(".workers").append(`
          <div class="worker hide">
            <img src="${v.image}">
            <span>${v.name}</span>
            ${v.rank}
          </div>`)
        }
      }
      $(".paw").hide()
      $("#overlayLoader").fadeOut()
      setTimeout(() => {
        $(".paw").fadeIn()
      }, 300);
      $(".star").hide()
      $(window).on("scroll", function() {
        if ($("#founder").isInViewport()) {
          $(".star").fadeIn()
        }
      })
    },
    error: function (err) {
      console.log(err)
    }
  })
  for(let k in data) {
    var v = data[k]
    if (v) {
      for (let i = 1; i <= v.images; i++) {
        preloadImage(`assets/db/${k}/${k} (${i}).png`)
      }
    }
  }
  console.log("Prelaoded images succesfully.");
})
