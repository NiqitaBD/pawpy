import cfg from "./main.js"

$(function () {
  let localData
  $("footer").hide()
  $("#header-logo").attr("src", "assets/logoBeige.png")

  const pageParams = new URLSearchParams(window.location.search);
  const bid = pageParams.get("bid")
  $("#headerLogo").attr("src", "./assets/logoBeige.png")
  if (!bid) window.location.href = "blogs.html"

  $.ajax({
    url: "/getBlogData", timeout: 3000, type: "post", data: JSON.stringify({ pid: bid }), contentType: "application/json",
    success: function (res) {
      const post = res.post
      localData = res.post
      $(".header").text(post.header)
      $(".type").text(post.type)
      $(".data .content .image").css("background-image", `url('${post.image}')`)
      $(".data .content .image").on("click", function() {
        cfg["funcs"]["viewImage"](post.image)
      })
      const date = new Date(post.date)
      const monthNames = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
      "Iulie", "August", "Septembrie", "Octombrie", "Noiembri", "Decembrie"
      ];
      $(".info").text(`${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}, Echipa Pawpy`)
      $(".data img").attr("src", `${post.image}`)
      const splited = post.content.split("\n")
      for (let k in splited) {
        var v = splited[k]
        $(".data .content").append(v + "<br>")
      }
      if (res.random) {
        $(".suggestions").empty()
        for (let k in res.random) {
          var v = res.random[k]
          $(".suggestions").append(`
            <div class="suggestion" target="${v.id}">
              <div class="image" style="background-image: url('${v.image}');"></div>
              <span>${v.header}</span>
            </div>
          `)
        }
        $(".suggestion").each(function (index) {
          $(this).on("click", function () {
            if ($(this).attr("target")) {
              window.location.href = "blog.html?bid=" + $(this).attr("target")
            }
          })
        })
      }

      $(".circle").each(function () {
        $(this).on("click", function () {
          fetch(`/openSideBlog`, {
            method: "POST",
            body: JSON.stringify({ pid: localData.id, type: localData.type, target: $(this).attr("target") }),
            headers: { "Content-type": "application/json; charset=UTF-8" }
          })
            .then(function (response) { return response.json(); })
            .then(function (data) {
              if (data.ok) {
                window.location.href = "blog.html?bid=" + data.id
              } else {
                window.location.href = "error.html"
              }
            })
            .catch(function (error) { console.error("Error:", error); });
        })
      })
      $("#overlayLoader").fadeOut(500)
    }
  })
})