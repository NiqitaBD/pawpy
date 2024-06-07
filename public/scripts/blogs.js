import socket from "./socket.js";
import cfg from "./main.js"
$(function(){
  const checkSocketConnected = setInterval(() => {
    if (socket.connected) {
      clearInterval(checkSocketConnected);
      socketConnected();
    }
  }, 250);

  const socketConnected = function () {
    socket.emit("connectToPageSocket", "blogs")
    socket.on("refreshBlogs", function (arg) {
      data.blogs = arg.blogs
      data.questions = arg.questions
      managePosts()
      manageButtons()
      loadLead()
      cfg["funcs"]["notify"]("A fost o schimbare la postări, se încarcă cele noi!")
    })
  };

  var pageSize = 9; var selected;
  var data = { blogs: [], questions: [] }
  var blogs = []
  let item = $(".manager .option").first()
  if (!$(".manager .selected")) {
    selected = item.text().toLowerCase();
    item.addClass("selected")
  } else { selected = item.text().toLowerCase(); item.addClass("selected") }
  const addBlog = function (v, k) {
    if (!v || !k) return
    $("#cards").append(`
    <div class="card hide">
      <img src="${v.image}">
      <div class="header">${v.header}</div>
      <button class="btn-more" bid="${v.id}">Citește</button>
    </div>`)}
    // <div class="subHeader">${v.content}</div>
  const lead = function (action) {
    switch (action) {
      case "hide": $(".lead").hide(); break;
      case "show": $(".lead").show(); break;
      default: break;
    }
  }
  const loadLead = function() {
    const leader = data.blogs[0]
    if (leader){
      $("section .lead").html(`
      <img src="${leader.image}">
      <div class="content">
        <span class="orange">${leader.type}</span>
        <div class="header">${leader.header}</div>
        <div class="message">${leader.content}</div>
          <button class="btn-more" bid="${leader.id}">Citește</button>
        </div> `)
        $(".btn-more").on("click", function(){ openBlog($(this).attr("bid")) })
    }
  }
  const managePosts = function () {
    if (!selected) return
    if (!data.blogs) return
    blogs = []
    resetContent(); 
    if (selected == "toate") { lead("show") } else { lead("hide") }
    for (let k in data.blogs) {
      var v = data.blogs[k]
      if (selected == "toate") {
        blogs.push(v);
        if (blogs.length <= pageSize) { addBlog(v, k); }
      } else {
        if (v.type == selected) {
          blogs.push(v);
          if (blogs.length <= pageSize) { addBlog(v, k); }
        }
      }
    }
    manageButtons()
    managePagination()
  }
  const managePagination = function () {
    $(".pagination").empty()
    for (let i = 1; i <= Math.ceil(blogs.length / pageSize); i++) {
      $(".pagination").append(`<div class="number">${i}</div>`)
    }
    var first = $(".number").first()
    if (first) {
      first.addClass("selected")
    }
    manageNumber()
  }
  const managePage = function (arg) {
    if (!arg) return
    resetContent()
    var num = parseInt(arg) - 1
    for (let i = (num * pageSize) + 1; i < (num * pageSize) + pageSize + 1; i++) {
      var v = blogs[i]
      addBlog(v, i)
    }
    manageButtons()
  }
  const manageNumber = function () {
    $(".number").each(function(index){
      $(this).on("click", function(){
        $(".number").each(function(index){ $(this).removeClass("selected") })
        $(this).addClass("selected")
        if ($(this).text() == 1) { lead("show") } else { lead("hide") }
        $(".manager")[0].scrollIntoView({ behavior: "smooth", block: "start" });
        managePage($(this).text())
      })
    })
  }
  const resetContent = function () { $("#cards").empty(); $("#questions").empty() }
  const manageQuestions = function () {
    resetContent(); lead("hide")
    for (let k in data.questions) {
      var v = data.questions[k]
      $("#questions").append(`
      <div class="question hide animationTransition">
        <div class="flex"> <img src="./assets/objects/pawFill.svg" alt="Paw Icon" class="questionPaw"> ${v.header} </div>
        <div class="content"> ${v.content} </div>
      </div>`) }
    $(".question").each(function(){ $(this).on("click", function(){ $(this).toggleClass("opened") }) })
  }
  const manageButtons = function () {
    $(".btn-more").each(function(index) {
      $(this).on("click", function(){ openBlog($(this).attr("bid")) })
    })
  }
  const openBlog = function (bid) { window.location.href = `blog.html?bid=${bid}`; }
  $(".option").each(function(index){
    $(this).on("click", function(){
      selected = $(this).text().toLowerCase()
      if (selected == "întrebări") {
        manageQuestions();
        $(".pagination").fadeOut()
      } else { managePosts(); $(".pagination").fadeIn() }      
      $(".option").each(function(index){ $(this).removeClass("selected") })
      $(this).addClass("selected")
    })
  })  
  // manageQuestions()
  $("#inp-search").on("change", function(){
    const value = $(this).val().toLowerCase()
    blogs = []; resetContent()
    for (let k in data.blogs) {
      var v = data.blogs[k]
      if (v.header.toLowerCase().includes(value)) {
        blogs.push(v);
        if (blogs.length <= pageSize) { addBlog(v, k); }
      }
    }
    managePagination()
    manageButtons()
    if (value) { lead("hide") } else { lead("show") }
  })
  $.post(`/requestBlogs`, function(event){
    if (event.ok) {
      data.blogs = event.blogs
      data.questions = event.questions
      managePosts()
      manageButtons()
      loadLead()
      $(".inputArea").css({
        "opacity": 0,
        "bottom": "20px"
      })
      $("#overlayLoader").fadeOut(500)
      setTimeout(() => {
        $(".inputArea").animate({
          "opacity": 1,
          "bottom": "0"
        }, 500)
      }, 500);
    }
  });
})