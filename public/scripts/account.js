import cfg from "./main.js"
import socket from "./socket.js"
$(function () {
  const checkSocketConnected = setInterval(() => {
    if (socket.connected) {
      clearInterval(checkSocketConnected);
      socketConnected();
    }
  }, 250);

  const socketConnected = function () {
    socket.emit("connectToPageSocket", "account")
    socket.on("adminRefreshDogs", function (arg) {
      $("#verify" + arg).fadeOut(400, function () { $(this).remove() })
    })
    socket.on("adminRefreshBlogs", function (arg) {
      $("#blog" + arg).fadeOut(400, function () { $(this).remove() })
    })
    socket.on("adminAddBlog", function(data) {
      console.log(data);
      $(".slide#blogs > :first-child").after(`
      <div class="general-container" id="blog-${data.id}">
        <div class="flex data">
          <img src="${data.image}" alt="Blog Image">
          <div class="flex column">
            <div class="header">${data.header}</div>
            <div class="flex buttons">
              <a href="blog.html?bid=${data.id}" target="_blank"><button class="open-blog">Detalii</button></a>
              <button class="remove-blog" blog-id="${data.id}">Șterge</button>
            </div>
          </div>
        </div>
      </div>`)
    })
  };
  $(".icons").hide()
  $("footer").hide()
  $(".slide").each(function () { $(this).hide() })
  var oslide = ""
  var inanim = false
  const openSlide = function (slide) {
    if (!slide) return
    if (inanim) return
    if (oslide === slide) return
    inanim = true
    oslide = slide
    $(".slide").each(function () { $(this).fadeOut(200) })
    setTimeout(() => {
      $(".slide#" + slide).fadeIn(200)
      setTimeout(() => {
        updateColorSize()
        inanim = false
      }, 200);
    }, 200);
  }
  $(window).on("resize", function () {
    updateColorSize()
  })
  const vhToPixel = Math.round(window.innerHeight);
  const pagepadding = function () {
    var padding = (vhToPixel - $(".union .content").height()) / 2
    if (padding < 150) padding = 150
    $(".union").css("padding", `${padding}px 0 0 0`)
    $(".slide").css("padding", `${padding + $(".content .name").height() + 22}px 0 0 0`)
  }
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
  const updateColorSize = function () {
    $(".color").css("height", $(".page").height() + 40 + "px");
  }
  var lastH = 0
  setInterval(() => {
    const h = $(".page").height()
    if (lastH != h) {
      lastH = h
      updateColorSize()
    }
  }, 1000);
  pagepadding()
  openSlide("setari")
  $.ajax({
    url: "/requestUserData", type: "post", data: JSON.stringify(), contentType: 'application/json',
    success: function (res) {
      const data = res.data
      $(".userImage").css("background-image", `url(${data.userImage})`)
      $(".union .name").html(`Salut, ${data.username}`)
      $(".union .name").css({
        "opacity": 0,
        "bottom": "20px"
      })
      $(".page .union .icons .icon").each(function () { $(this).remove() })
      for (let profile of data.profiles) {
        $(".page .union .icons").append(`<div class="icon" target="${profile.name}" style="background-image: url(${profile.image})"></div>`)
      }

      $(".slide#anchete").empty()
      if (data.dogs.length > 0) {
        for (let dog of data.dogs) {
          $(".slide#anchete").append(`
          <div class="dog" id="dog-id${dog.id}" dog-id="${dog.id}" ${dog.verified ? "" : `skip="true"`}>
            <div class="image">
              ${dog.verified ? "" : `<div class="tarp"></div>`}
              <img src="${dog.image}">
            </div>
            <div class="name">${dog.name}</div>
            <div class="info">
              <span class="type">Rasa: </span> <span class="detail">${dog.breed}</span><br>
              <span class="type">Vârsta: </span> <span class="detail">${dog.age}</span><br>
              <span class="type">Gen: </span> <span class="detail">${dog.sex}</span><br>
            </div>
            ${dog.verified ? "" :
              `<div class="tarp">
              <iconify-icon icon="material-symbols:hourglass-outline"></iconify-icon>
              <div> 
                <span>Ancheta este în procesare</span><br>
                Ancheta ta va fi verificată de către un lucrător Pawpy în decurs de o zi.
                <button class="discard" dog-id="${dog.id}">Renunță</button>
              </div>
            </div>
            `}
          </div>
        `)
        }

      } else {
        $(".slide#anchete").append(`
          <span style="width: 100%; text-align: center; font-size: 18px;">Se pare că nu ai nimic aici!</span>
        `)
      }
      $(".discard").each(function () {
        $(this).on("click", async function () {
          const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să ștergi postarea?")
          if (!bool) return
          const id = $(this).attr("dog-id")
          if (id) {
            $.ajax({
              url: "/discardDog", timeout: 3000, type: "post", data: JSON.stringify({ id: id }), contentType: 'application/json',
              success: function () {
                cfg["funcs"]["notify"]("Ai șters cu succes postarea!")
                $(`#dog-id${id}`).fadeOut(300)
                setTimeout(() => {
                  $(`#dog-id${id}`).remove()
                  updateColorSize()
                }, 300);
              },
              error: function () {
                cfg["funcs"]["notify"]("Server Error!")
              }
            })
          }
        })
      })
      if (data.liked) {
        $(".slide#favourites").empty()
        for (let dog of data.liked) {
          $(".slide#favourites").append(`
            <div class="dog likedDog" dog-id=${dog.id}>
              <div class="image">
                <img src="${dog.image}">
              </div>
              <div class="name">${dog.name}</div>
              <div class="info">
                <span class="type">Rasa: </span> <span class="detail">${dog.breed}</span><br>
                <span class="type">Vârsta: </span> <span class="detail">${dog.age}</span><br>
                <span class="type">Gen: </span> <span class="detail">${dog.sex}</span><br>
              </div>
            </div>
          `)
        }
        $(".likedDog").each(function () {
          $(this).on("click", function () {
            const id = $(this).attr("dog-id")
            if (!id) return
            window.location.href = `dog.html?did=${id}`
          })
        })
      } else {
        $(".slide#favourites").append(`
          <span style="width: 100%; text-align: center; font-size: 18px;">Se pare că nu ai nimic aici!</span>
        `)
      }

      $(".slide#anchete .dog").each(function () {
        let edits = false
        const dog = $(this)
        if ($(this).attr("skip")) return
        const info = $(this).find(".info")
        var infoHTML = info.html()
        $(this).on("click", function () {
          if (!edits) {
            info.addClass("edits")
            info.html(`
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>`)
            info.find(".edit").on("click", function () {
              window.location.href = `dog.html?did=${dog.attr("dog-id")}&pen=true`
            })
            info.find(".delete").on("click", async function () {
              const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să ștergi câinele?")
              if (bool) {
                const id = dog.attr("dog-id")
                if (id) {
                  $.ajax({
                    url: "/discardDog", timeout: 3000, type: "post", data: JSON.stringify({ id: id }), contentType: 'application/json',
                    success: function () {
                      cfg["funcs"]["notify"]("Ai șters cu succes postarea!")
                      dog.fadeOut(300)
                      setTimeout(() => {
                        dog.remove()
                        updateColorSize()

                      }, 300);
                    },
                    error: function () {
                      cfg["funcs"]["notify"]("Server Error!")
                    }
                  })
                }
              } else {
                cfg["funcs"]["notify"]("Ați renunțat")
              }
            })
          } else {
            info.removeClass("edits")
            info.html(infoHTML)
          }
          edits = !edits
        })
      })
      $(".page .union .icons .icon").each(function () {
        $(this).on("click", function () {
          $(".icons").fadeOut()
          $.ajax({
            url: "/setUserImage", timeout: 3000, type: "post", data: JSON.stringify({ profile: $(this).attr("target") }), contentType: 'application/json',
            success: function (res, data) {
              $(".userImage").css("background-image", `url('${res.image}')`)
              $(".UserProfile").attr("src", res.image)
            },
            error: function () {
              cfg["funcs"]["notify"]("A intervenit o eroare.")
            }
          })

        })
      })
      $("#imageForm").on("submit", async function (e) {
        e.preventDefault()
        const image = await readImage($(this).find("input").prop("files")[0])
        if (image) {
          $.ajax({
            url: "/setUserCustomImage", timeout: 3000, type: "post", data: JSON.stringify({ image: image }), contentType: 'application/json',
            success: function (res) {
              setTimeout(() => {
                cfg["funcs"]["notify"]("Acțiune cu succes!")
                $(".userImage").css("background-image", `url('${res.image}')`)
                $(".UserProfile").attr("src", res.image)
              }, 250);
            },
            error: function () {
              cfg["funcs"]["notify"]("A intervenit o eroare")
            }
          })
        }
      })
      if (data.donations.length > 0) {
        $(".slide#donatii").empty()
        for (const donation of data.donations) {
          $(".slide#donatii").append(`
          <div class="donation">
          <iconify-icon icon="fluent:money-24-regular" class="icon"></iconify-icon>
            <div class="content">
              <span>Suma:</span> ${donation.sum} ${donation.currency} <br>
              <span>Data:</span> ${donation.date} <br>
              <span>Metoda de plata:</span> ${donation.provider}
            </div>
          </div>`)
        }
      }

      if (data.verified) {
      } else {
        $("body").append(`<div id="verified">Contul Dvs. nu este verificat, pentru a îl verifica accesați <span class="requestVerification">email-ul</span></div>`)
        $(".requestVerification").on("click", function () {
          $("#verified").html(`Se încarcă!`)
          $.ajax({
            url: "/requestVerification", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
            success: function () {
              $("#verified").html(`Pașii au fost trimiși la adresa de Email!`)
            },
            error: function () {
              $("#verified").html(`Eroare la expedierea mesajului!`)
            }
          })
        })
      }
      var admindata = {}
      if (data.admin) {
        $(".page .union .content").append(`<div class="slideSelector" slide="dogs"><span>Anchete neverificate</span></div>`)
        if (data.admin >= 2) {
          $(".page .union .content").append(`<div class="slideSelector" slide="users"><span>Utilizatori</span></div>`)
          $(".page .union .content").append(`<div class="slideSelector" slide="blogs"><span>Blogs</span></div>`)
          $(".page .union .content").append(`<div class="slideSelector" slide="faq"><span>FAQ</span></div>`)
          $(".page .union .content").append(`<div class="slideSelector" slide="logs"><span>Logs</span></div>`)
          $(".logselector").each(function () {
            $(this).on("click", function () {
              const log = $(this).attr("log")
              if (log) {
                $.ajax({
                  url: "/requestLogs", timeout: 3000, type: "post", data: JSON.stringify({ log: log }), contentType: 'application/json',
                  success: function (res) {
                    const data = res.data
                    if (!data) return cfg["funcs"]["notify"]("Nu am gasit nimic.")
                    if (data.length < 1) return cfg["funcs"]["notify"]("Nu am gasit nimic.")
                    $(".slide#logs .log").each(function () { $(this).fadeOut(300) })
                    for (let k in data) {
                      var v = data[k]
                      if (v) {
                        $(".slide#logs").append(`<div class="log">${v.content} | <span>${v.date}</span></div>`)
                      }
                    }
                    updateColorSize()
                  },
                  error: function () {
                    cfg["funcs"]["notify"]("Server Error!")
                  }
                })
              }
            })
          })
          $.ajax({
            url: "/getFaq", timeout: 3000, type: "post", contentType: 'application/json',
            success: function (data) {
              $(".slide#faq .general-container").remove()
              $.each(data, function (k, v) {
                $(".slide#faq").append(`
                <div class="general-container" id="faq-${v.id}">
                  <div class="header">${v.header}</div>
                  ${v.content}
                  <button class="remove-faq" faq-id="${v.id}">Șterge</button>
                </div>`)
              })
              $(".slide#faq .remove-faq").each(function () {
                $(this).on("click", function () {
                  const id = $(this).attr("faq-id")
                  if (id) {
                    $.ajax({
                      url: "/removeFaq", timeout: 3000, type: "post", data: JSON.stringify({ id: id }), contentType: 'application/json',
                      success: function () {
                        cfg["funcs"]["notify"]("Întrebarea a fost ștearsă cu succes!")
                        $("#faq-" + id).fadeOut()
                        updateColorSize()
                      },
                      error: function () {
                        cfg["funcs"]["notify"]("A intervenit o eroare!")
                      }
                    })
                  }
                })
              })
            },
            error: function (res) {
              if (res.responseJSON) {
                cfg["funcs"]["notify"](res.responseJSON.message)
              } else cfg["funcs"]["notify"]("Nu am putut lua FAQ.")
            }
          })
          $(".slide#faq .add-faq").on("click", async function () {
            const header = await cfg["funcs"]["prompt"]("Titlul întrebării")
            await cfg["funcs"]["wait"](200)
            const content = await cfg["funcs"]["prompt"]("Răspunsul întrebării")
            console.log(header + " " + content);
            if (!header || !content) return cfg["funcs"]["notify"]("Valori invalide")
            $.ajax({
              url: "/addFaq", timeout: 3000, type: "post", data: JSON.stringify({ header: header, content: content }), contentType: 'application/json',
              success: function (res) {
                if (res.id) {
                  $(".slide#faq").append(`
                  <div class="general-container" id="faq-${res.id}">
                    <div class="header">${header}</div>
                    ${content}
                    <button class="remove-faq" faq-id="${res.id}">Șterge</button>
                  </div>`)
                  updateColorSize()
                } else {
                  cfg["funcs"]["Întrebarea a fost adăugată dar a intervenit o eroare și trebuie Refresh la pagina!", 10]
                }
              },
              error: function () {
                cfg["funcs"]["notify"]("A intervenit o eroare.")
              }
            })
          })
          $.ajax({
            url: "/requestBlogs", timeout: 3000, type: "post", contentType: 'application/json',
            success: function (data) {
              for (let k in data.blogs) {
                const v = data.blogs[k]
                if (v) {
                  $(".slide#blogs").append(`
                  <div class="general-container" id="blog-${v.id}">
                    <div class="flex data">
                      <img src="${v.image}" alt="Blog Image">
                      <div class="flex column">
                        <div class="header">${v.header}</div>
                        <div class="flex buttons">
                          <a href="blog.html?bid=${v.id}" target="_blank"><button class="open-blog">Detalii</button></a>
                          <button class="remove-blog" blog-id="${v.id}">Șterge</button>
                        </div>
                      </div>
                    </div>
                  </div>`)
                }
              }
              $(".remove-blog").each(function () {
                $(this).on("click", async function () {
                  const id = $(this).attr("blog-id")
                  if (!id) return
                  const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să ștergi blog-ul?")
                  if (!bool) return
                  $.ajax({
                    url: "/removeBlog", timeout: 3000, type: "post", data: JSON.stringify({ id: id }), contentType: 'application/json',
                    success: function () {
                      cfg["funcs"]["notify"]("Ai șters cu succes blog-ul!")
                      $(`#blog-${id}`).fadeOut(400, function () { $(this).remove() })
                    },
                    error: function () {
                      cfg["funcs"]["notify"]("Eroare la baza de date!")
                    }
                  })
                })
              })
              $(".add-blog").on("click", async function () {
                const header = await cfg["funcs"]["prompt"]("Titlul blogului")
                if (!header) return cfg["funcs"]["notify"]("Titlul este invalid.")

                const content = await cfg["funcs"]["prompt"]("Conținutul blogului")
                if (!content) return cfg["funcs"]["notify"]("Conținutul este invalid.")

                const type = await cfg["funcs"]["prompt"]("Tipul blogului", "adopție / noutăți")
                if (!type) return cfg["funcs"]["notify"]("Tipul este invalid.")
                if (type !== "noutăți" && type !== "adopție") return cfg["funcs"]["notify"]("Nu există așa tip.")

                const image = await cfg["funcs"]["upload"]("Imaginea blogului")
                if (!image) return cfg["funcs"]["notify"]("Imaginea este invaliă")
                $.ajax({
                  url: "/addBlog", timeout: 5000, type: "post", data: JSON.stringify({ header: header, content: content, image: image, type: type }), contentType: 'application/json',
                  success: function () {
                    cfg["funcs"]["notify"]("Blog ul a fost adăugat cu succes!")
                  },
                  error: function () {
                    cfg["funcs"]["notify"]("Eroare la baza de date!")
                  }
                })
              })
            },
            error: function () {
              cfg["funcs"]["notify"]("Eroare la încărcarea blogurilor!")
            }
          })
        }
        pagepadding()

        $(".slide#users .search").on("click", function () {
          var val = $(".slide#users .inputSearch").val()
          if (val || val.length > 0) {
            if (parseInt(val)) { val = parseInt(val) }
            $.ajax({
              url: "/requestUser", timeout: 3000, type: "post", data: JSON.stringify({ query: val }), contentType: 'application/json',
              success: function (res) {
                $(".slide#users .user").each(function () { $(this).fadeOut(300) })
                setTimeout(() => {
                  const data = res.data
                  if (data.length > 0) {
                    for (let k in data) {
                      var v = data[k];
                      if (v) {
                        $(".slide#users").append(`
                          <div class="user flex" id="user${v.id}" style="display: none;">
                            <img src="${v.image}" alt="">
                            <div class="content">
                              <span>Nume:</span> ${v.firstname} ${v.lastname}<br>
                              <span>Email:</span> ${v.email} <br>
                              <span>Admin:</span> 
                              <select name="" id="select" uid="${v.id}"> 
                                <option value="0" ${v.admin === 0 ? 'selected="selected"' : ''}>0</option> 
                                <option value="1" ${v.admin === 1 ? 'selected="selected"' : ''}>1</option> 
                                <option value="2" ${v.admin === 2 ? 'selected="selected"' : ''}>2</option> 
                              </select>
                            </div>
                          </div>
                        `);
                        $(`#user${v.id}`).fadeIn(300)
                      }
                    }
                    $(".slide#users select").each(function () {
                      $(this).on("change", async function () {
                        const val = parseInt($(this).val())
                        const tid = parseInt($(this).attr("uid"))
                        if (!tid) return
                        const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să schimbi Admin Level în " + val)
                        if (!bool) return cfg["funcs"]["notify"]("Ai renuntat.")
                        $.ajax({
                          url: "/setAdmin", timeout: 3000, type: "post", data: JSON.stringify({ tid: tid, alevel: val }), contentType: 'application/json',
                          success: function () {
                            cfg["funcs"]["notify"]("Ai schimbat cu succes Admin Level!")
                          },
                          error: function (res) {
                            if (res.responseJSON) return cfg["funcs"]["notify"](res.responseJSON.message)
                            cfg["funcs"]["notify"]("Server Error!")
                          }
                        })
                      })
                    })
                  } else {
                    $(".slide#users").append(`<div class="user">No users found</div>`)
                  }
                }, 300);
              },
              error: function () {
                cfg["funcs"]["notify"]("Eroare!")
              }
            })
          } else return cfg["funcs"]["notify"]("Date invalide!")
        })
        $.ajax({
          url: "/requestDogsUnverified", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
          success: function (res) {
            var data = res.data
            if (data.length >= 1) {
              for (let k in data) {
                var v = data[k]
                if (v) {
                  $(".slide#dogs").append(`
                  <div class="dog" id="verify${v.id}">
                    <div class="image">
                      <img src="${v.image}" alt="">
                    </div>
                    <div class="name">${v.name}</div>
                    <div class="info">
                      <button class="details" dog-id="${v.id}">Detalii</button> <br> <br>
                      <button class="verifyDog" dog-id="${v.id}">Acțiuni</button>
                    </div>
                  </div>
                  `)
                }
              }
              $(".dog .details").each(function () {
                $(this).on("click", function () {
                  const did = $(this).attr("dog-id")
                  if (did) { window.location.href = `dog.html?did=${did}` }
                })
              })
              $(".dog .verifyDog").each(function () {
                $(this).on("click", async function () {
                  const did = parseInt($(this).attr("dog-id"))
                  if (did) {
                    const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să confirmi această postare ( prin renunțare se v-a șterge )?")
                    if (!bool) {
                      $.ajax({
                        url: "/removeDogAdmin", timeout: 3000, type: "post", data: JSON.stringify({ id: did }), contentType: 'application/json',
                        success: function () {
                          cfg["funcs"]["notify"]("Ai șters ancheta cu succes!")
                          $(`#verify${did}`).fadeOut(400)
                          setTimeout(() => {
                            $(`#verify${did}`).remove()
                            updateColorSize()

                          }, 400);
                        },
                        error: function () {
                          cfg["funcs"]["notify"]("Server Error!")
                        }
                      })
                      return
                    }
                    $.ajax({
                      url: "/verifyDog", timeout: 3000, type: "post", data: JSON.stringify({ id: did }), contentType: 'application/json',
                      success: function () {
                        cfg["funcs"]["notify"]("Ai confirmat ancheta cu succes!")
                        $(`#verify${did}`).fadeOut(400)
                        setTimeout(() => {
                          $(`#verify${did}`).remove()
                          updateColorSize()

                        }, 400);
                      },
                      error: function () {
                        cfg["funcs"]["notify"]("Server Error!")
                      }
                    })
                  }
                })
              })
            } else {
              $(".slide#dogs").html(`
                <span style="width: 100%; text-align: center; font-size: 18px;">Se pare că nu ai nimic aici!</span>
              `)
            }
          },
          error: function () {
            cfg["funcs"]["notify"]("Error on loading unverified dogs.")
          }
        })
      }

      var changed = {}
      $(".slide#setari input").each(function () {
        $(this).on("change", function () {
          const name = $(this).attr("placeholder")
          if (!name) return
          if ($(this).val().length < 1) return changed[name] = null
          changed[name] = $(this).val()
        })
      })
      $(".slide#setari .save").on("click", async function () {
        var str = `Esti sigur ca doresti sa schimbi: \n`
        var ex = false
        for (let k in changed) {
          if (changed[k]) {
            ex = true
            str += `${k}: ${changed[k]}\n`
          }
        }
        if (!ex) return cfg["funcs"]["notify"]("Nu ai schimbat nimic.")
        const bool = await cfg["funcs"]["request"](str)
        if (bool) {
          $.ajax({
            url: "/updateUserData", timeout: 3000, type: "post", data: JSON.stringify({ data: changed }), contentType: 'application/json',
            success: function () {
              cfg["funcs"]["notify"]("Schimbarile au fost salvate!")
              setTimeout(() => {
                window.location.reload()
              }, 1500);
            },
            error: function () {
              cfg["funcs"]["notify"]("A intervenit o eroare. Reincearca!")
            }
          })
        } else return cfg["funcs"]["notify"]("Ai renutat.")
      })
      $(".slide#setari .delete-account").on("click", async function () {
        const bool = await cfg["funcs"]["request"]("Ești sigur că dorești să ștergi contul?")
        if (bool) {
          $.ajax({
            url: "/removeUser", timeout: 3000, type: "post", data: JSON.stringify({}), contentType: 'application/json',
            success: function (res) {
              if (res.message && res.message == "done") {
                cfg["funcs"]["notify"]("Contul dvs. a fost șters!")
              } else {
                cfg["funcs"]["notify"]("Pentru a continua verifică email-ul!")
              }
            },
            error: function () {
              cfg["funcs"]["notify"]("A intervenit o eroare. Reincearca!")
            }
          })
        }
      })

      $(".slideSelector").each(function () {
        $(this).on("click", function () {
          openSlide($(this).attr("slide").toLowerCase())
        })
      })
      if (data) {
        setTimeout(() => {
          $("#overlayLoader").fadeOut(300)
          setTimeout(() => {
            $(".union .name").animate({
              "opacity": 1,
              "bottom": 0
            })
          }, 300);
        }, 250);
      }
    },
    error: function (res) {
      window.location.href = "index.html"
    },

  })


  var opened = false
  $(".iconsOpener").on("click", function () {
    if (opened) {
      opened = !opened
      $(".icons").fadeOut()
    } else {
      opened = !opened
      $(".icons").fadeIn()
    }
  })

  $(document).click(function (event) {
    var classClicked = $(event.target).attr("scope")
    if (classClicked !== "icons") {
      $(".icons").fadeOut()
      opened = false
    }
  })

  $(".logOut").on("click", async function () {
    const bool = await cfg["funcs"]["request"]("Esti sigur ca doresti sa te deconectezi?")
    if (bool) {
      cfg["funcs"]["notify"]("Te-ai deconectat cu succes.")
      setTimeout(() => {
        cfg["funcs"]["setCookie"]("connection", "", 100)
        window.location.reload()
      }, 1000);
    } else {
      cfg["funcs"]["notify"]("Ai renuntat.")
    }
  })

  $('form input').on('change', function () {
    $(this).closest('form').submit();
  });

})