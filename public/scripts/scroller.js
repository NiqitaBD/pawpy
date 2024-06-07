$(function(){
  $("body").append(`<div id="scrollButton" class="fadeIn"><img src="assets/objects/fillRightArrow.png" class="arrow"></div>`)
  $("#scrollButton").hide()
  $("#scrollButton").on("click", function(){
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  })
  $(window).on("scroll", function(){
    if(window.scrollY > 1200) {
      $("#scrollButton").fadeIn()
    } else {
      $("#scrollButton").fadeOut()
    }
  })
})