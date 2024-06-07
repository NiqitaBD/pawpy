var cfg = {
  ["tax"]: 10,
  ["ip"]: `46.37.113.110`,
  ["responses"]: {
    ["noname"]: "Nume invalid",
    ["noexp"]: "Data de expirare invalidă",
    ["nocvc"]: "Cod CVC / CVV invalid"
  },
  ["dict"]: {
    ["firstname"]: "prenumele",
    ["lastname"]: "numele",
    ["name"]: "numele",
    ["breed"]: "rasa",
    ["age"]: "varsta",
    ["sex"]: "sexul",
    ["email"]: "email-ul",
    ["description"]: "descrierea"
  },
  ["thanker"]: `
  <div class="thanker">
    <div>
      <img src="./assets/objects/paw.svg" alt="Paw Outline" class="paw">
      <img src="./assets/objects/paw.svg" alt="Paw Outline" class="paw">
      <iconify-icon icon="zondicons:close-outline" class="btn-close"></iconify-icon>
      <span><b>Abonare cu succes!</b> <br>
        Vă veți primi actualizări de la noutăți și emailuri cu noi cățeluși! Fiți la curent!
      </span>
    </div>
  </div>
  `,
  ["dropDowns"]: {
    ["age"]: `
      <select name="age" class="sizeDecrease" target="age" id="ageSelector">
        <option value="default" selected disabled hidden>Vârsta</option>
        <option value="Adult">Adult</option>
        <option value="Cățeluș">Cățeluș</option>
        <option value="Tânăr">Tânăr</option>
        <option value="Tânără">Tânără</option>
        <option value="Bătrân">Bătrân</option>
        <option value="Bătrână">Bătrână</option>
      </select>`,
    ["sex"]: `
      <select name="sex" class="sizeDecrease" target="sex" id="sexSelector">
        <option value="default" selected disabled hidden>Gen</option>
        <option value="Masculin">Masculin</option>
        <option value="Feminin">Feminin</option>
      </select>`
  },
  ["funcs"]: {
    ["validateCardNumber"]: function (number) {
      const regex = new RegExp("^[0-9]{13,19}$");
      if (!regex.test(number)) { return false; }
      return cfg["funcs"]["luhnCheck"](number);
    },
    ["luhnCheck"]: function (val) {
      let checksum = 0;
      let j = 1;
      for (let i = val.length - 1; i >= 0; i--) {
        let calc = 0;
        calc = Number(val.charAt(i)) * j;
        if (calc > 9) {
          checksum = checksum + 1;
          calc = calc - 10;
        }
        checksum = checksum + calc;
        if (j == 1) {
          j = 2;
        } else {
          j = 1;
        }
      }
      return (checksum % 10) == 0;
    },
    ["validateCard"]: function (cardnumber) {
      const responses = [];
      responses[0] = "Card necunoscut";
      responses[1] = "Nici un card găsit";
      responses[2] = "Format invalid";
      responses[3] = "Număr invalid";
      responses[4] = "Numărul de cifre invalid";
      const response = (success, message = null, type = null) => ({
        message,
        success,
        type
      });
      const cards = [];
      cards[0] = {
        name: "Visa",
        length: "13,16",
        prefixes: "4",
        checkdigit: true
      };
      cards[1] = {
        name: "MasterCard",
        length: "16",
        prefixes: "51,52,53,54,55",
        checkdigit: true
      };
      cards[2] = {
        name: "DinersClub",
        length: "14,16",
        prefixes: "36,38,54,55",
        checkdigit: true
      };
      cards[3] = {
        name: "CarteBlanche",
        length: "14",
        prefixes: "300,301,302,303,304,305",
        checkdigit: true
      };
      cards[4] = {
        name: "AmEx",
        length: "15",
        prefixes: "34,37",
        checkdigit: true
      };
      cards[5] = {
        name: "Discover",
        length: "16",
        prefixes: "6011,622,64,65",
        checkdigit: true
      };
      cards[6] = {
        name: "JCB",
        length: "16",
        prefixes: "35",
        checkdigit: true
      };
      cards[7] = {
        name: "enRoute",
        length: "15",
        prefixes: "2014,2149",
        checkdigit: true
      };
      cards[8] = {
        name: "Solo",
        length: "16,18,19",
        prefixes: "6334,6767",
        checkdigit: true
      };
      cards[9] = {
        name: "Switch",
        length: "16,18,19",
        prefixes: "4903,4905,4911,4936,564182,633110,6333,6759",
        checkdigit: true
      };
      cards[10] = {
        name: "Maestro",
        length: "12,13,14,15,16,18,19",
        prefixes: "5018,5020,5038,6304,6759,6761,6762,6763",
        checkdigit: true
      };
      cards[11] = {
        name: "VisaElectron",
        length: "16",
        prefixes: "4026,417500,4508,4844,4913,4917",
        checkdigit: true
      };
      cards[12] = {
        name: "LaserCard",
        length: "16,17,18,19",
        prefixes: "6304,6706,6771,6709",
        checkdigit: true
      };
      if (cardnumber.length == 0) { return response(false, responses[1]); }
      cardnumber = cardnumber.replace(/\s/g, "");

      if (!cfg["funcs"]["validateCardNumber"](cardnumber)) { return response(false, responses[2]); }
      let lengthValid = false; let prefixValid = false; let cardCompany = "";
      for (let i = 0; i < cards.length; i++) {
        const prefix = cards[i].prefixes.split(",");
        for (let j = 0; j < prefix.length; j++) {
          const exp = new RegExp("^" + prefix[j]);
          if (exp.test(cardnumber)) {
            prefixValid = true;
          }
        }
        if (prefixValid) {
          const lengths = cards[i].length.split(",");
          for (let j = 0; j < lengths.length; j++) {
            if (cardnumber.length == lengths[j]) {
              lengthValid = true;
            }
          }
        }
        if (lengthValid && prefixValid) {
          cardCompany = cards[i].name;
          return response(true, null, cardCompany);
        }
      }
      if (!prefixValid) { return response(false, responses[3]); }
      if (!lengthValid) { return response(false, responses[4]); };
      return response(true, null, cardCompany);
    },
    ["isNotExpired"]: function (string) {
      if (!string) return false
      const [month, year] = string.split('/');
      const expiration = new Date(`20${year}`, month - 1);
      const difference = (expiration - new Date()) / (1000 * 60 * 60 * 24);
      if (difference > 0) return true
      return false
    },
    ["validateCVC"]: function (num) {
      if (!num) return false
      if (num.toString().length == 3) return true
      return false
    },
    ["setCookie"]: function (cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    ["getCookie"]: function (cname) {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    },
    ["icon"]: function (name) { return `<iconify-icon icon="${name}"></iconify-icon>` },
    ["wait"]: function (ms) { return new Promise(resolve => setTimeout(resolve, ms)); },
    ["request"]: function (string) {
      if (!string) return false
      let resolved = false
      if ($("#request").length > 0) {
        $("#request").remove()
      }
      return new Promise(function (resolve, reject) {
        $("body").append(`
          <div id="request">
            <span>${string}</span>
            <div class="flex">
              <button status="confirm">Confirmă</button>
              <button status="decline">Renunță</button>
            </div>
          </div>
        `)
        $("#request button").each(function () {
          $(this).on("click", function () {
            const status = $(this).attr("status")
            status === "confirm" ? resolve(true) : resolve(false)
            resolved = true
            $("#request").fadeOut(300)
            setTimeout(() => {
              $("#request").remove()
            }, 300);
          })
        })
        setTimeout(() => {
          if (!resolved) resolve(false)
          $("#request").fadeOut(300)
          setTimeout(() => {
            $("#request").remove()
          }, 300);
          return
        }, 30 * 1000);
      })
    },
    ["prompt"]: function (header, val) {
      if (!val) val = ""
      if (!header) return
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          $("body").append(`
          <div id="overlayPrompt">
            <div id="prompt" class="shadow">
              <iconify-icon icon="fontisto:close" class="close"></iconify-icon>
              <div class="header">${header}</div>
              <textarea name="" id="prompt-textarea" placeholder="Text">${val}</textarea>
              <button id="prompt-button">Confirmă</button>
            </div>
          </div>`)
          $("#overlayPrompt").hide().fadeIn()
          $("#prompt .close").on("click", function () {
            $("#overlayPrompt").fadeOut(400, function () { $(this).remove() })
            return resolve(false)
          })
          $("#prompt #prompt-button").on("click", function () {
            $("#overlayPrompt").fadeOut(200)
            setTimeout(() => {
              const text = $("#prompt-textarea").val()
              $("#overlayPrompt").remove()
              if (!text || text.length < 5) return resolve(false)
              resolve(text)
            }, 200);
          })
        }, 100);
      })
    },
    ["upload"]: function (header) {
      if (!header) return
      return new Promise(function (resolve, reject) {
        var localdata = false
        const readImageString = function (image) {
          return new Promise(function (resolve, reject) {
            try {
              const reader = new FileReader()
              reader.onloadend = function () {
                resolve(reader.result)
              }
              reader.readAsDataURL(image)
            } catch (error) {
              console.error(error)
              resolve(false)
            }
          })
        }
        const removeOverlay = function () {
          $("#overlayPrompt").fadeOut(400, function () {
            $(this).remove()
          })
        }

        $("body").append(`
          <div id="overlayPrompt">
            <div id="prompt" class="shadow image">
              <iconify-icon icon="fontisto:close" class="close"></iconify-icon>
              <div class="header">${header}</div>
              <div class="image-preview">
                <input type="file" name="image" id="image-input" accept="image/*">
                <iconify-icon icon="icon-park-solid:upload" class="preview-icon"></iconify-icon>
              </div>
              <button class="image-confirm">Confirmă</button>
            </div>
          </div>
        `)
        $("#overlayPrompt").hide().fadeIn()

        $("#image-input").on("change", async function () {
          const image = await readImageString($(this).prop("files")[0])
          if (image) {
            localdata = image
            $("#prompt .image-preview").css("background-image", 'url("' + image + '")')
          } else {
            cfg["funcs"]["notify"]("Eroare la citirea imaginii.")
          }
        })

        $("#prompt .image-confirm").on("click", function () {
          if (localdata) {
            removeOverlay()
            resolve(localdata)
          } else {
            cfg["funcs"]["notify"]("Eroare la încărcarea imaginii.")
          }
        })

        $("#prompt .close").on("click", function () {
          removeOverlay()
          resolve(false)
        })
      })
    },
    ["notify"]: function (message, timeout) {
      if (!message) return
      if (!timeout) timeout = 3
      if ($("#notification").length > 0) {
        $("#notification").html(`<iconify-icon icon="line-md:bell-alert-loop"></iconify-icon>${message}`)
      } else {
        $("body").append(`
        <div id="notification">
          <iconify-icon icon="line-md:bell-alert-loop"></iconify-icon>${message}
        </div>`)
      }
      setTimeout(() => {
        $("#notification").fadeOut(300)
        setTimeout(() => {
          $("#notification").remove()
        }, 300);
      }, timeout * 1000);
    },
    ["viewImage"]: function (src, timeout) {
      if (!src) return
      if (!timeout) timeout = 15
      if ($("#overlayImage").length > 0) { $("#overlayImage").remove() }
      const random_id = Math.floor(Math.random() * 99999999)
      $("body").append(`
      <div id="overlayImage" class="image-${random_id}">
        <iconify-icon icon="fontisto:close" class="close"></iconify-icon>
        <img src="${src}" class="shadow">
        <div class="loadBar"></div>
      </div>
      `)
      $("#overlayImage").hide().fadeIn()
      $("#overlayImage .close").on("click", function () {
        $("#overlayImage").fadeOut(200)
        setTimeout(() => {
          $("#overlayImage").remove()
        }, 200);
      })
      $("#overlayImage .loadBar").css({ "width": "100%" }).animate({ "width": "0" }, timeout * 1000);
      setTimeout(() => {
        if ($(".image-" + random_id).length > 0) {
          $(".image-" + random_id).fadeOut(200)
          setTimeout(() => {
            $(".image-" + random_id).remove()
          }, 200);
        }
      }, timeout * 1000);
    }
  }
}
$(function () {
  $.ajax({
    url: "/canILogInPlease", type: "post", timeout: 1500, contentType: 'application/json',
    success: function () { },
    error: function () {
      window.location.href = "https://www.google.com"
    }
  })
  $.fn.isInViewport = function () {
    var elementTop = $(this).offset().top;
    var elementBottom = elementTop + $(this).outerHeight();
    var viewportTop = $(window).scrollTop();
    var viewportBottom = viewportTop + $(window).height();
    var viewportCenter = (viewportTop + viewportBottom) / 2;
    var centerRange = 50;
    var isInCenter = elementTop < viewportCenter + centerRange && elementBottom > viewportCenter - centerRange;
    return isInCenter;
  };
  $(window).scroll(function () {
    $(".hide").each(function (index) {
      $(this).addClass("animationTransition")
      if ($(this).isInViewport()) {
        $(this).removeClass("hide")
      }
    })
    $(".stomp").each(function (index) {
      $(this).addClass("animationTransition")
      if ($(this).isInViewport()) {
        $(this).removeClass("stomp")
      }
    })
  })
  var dogBreeds = []
  var dogBreedsData = {}
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
  setTimeout(() => {
    $(".breedSelectorInput").each(function () {
      var input = $(this);
      var lastSearch = "";
      var interval;
      const display = $(".breedDisplayFor" + input.attr("breed-selector-id") + " .content")

      function intervalStep() {
        var val = input.val();
        if (val !== lastSearch) {
          lastSearch = val;
          display.empty()
          var localBreeds = dogBreeds.filter((breed) => breed.toLowerCase().includes(val.toLowerCase()) || breed.toLowerCase() == val.toLowerCase())
          if (localBreeds.length > 0) {
            for (const breed of localBreeds) {
              display.append(`<div class="breed">${breed}</div>`)
            }
            $(".breedDisplayFor" + input.attr("breed-selector-id") + " .content .breed").each(function () {
              $(this).on("click", function () {
                input.val($(this).html())
              })
            })
          } else {
            display.append(`<div class="breed">Nu am gasit nimic.</div>`)
          }
        }
      }
      intervalStep()
      input.on("focus", function () {
        interval = setInterval(intervalStep, 500);
        $(".breedDisplayFor" + input.attr("breed-selector-id")).fadeIn()
      }).on("focusout", function () {
        clearInterval(interval);
        $(".breedDisplayFor" + input.attr("breed-selector-id")).fadeOut()
      });
    });
  }, 1000);
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
  wrappers()
  $(window).on("resize", function () {
    wrappers()
  })
  const cookie = cfg["funcs"]["getCookie"]("cookies")
  if (!cookie) {
    setTimeout(() => {
      $("body").append(`
      <div class="cookies">
        <div class="header flex">
          <iconify-icon icon="iconoir:half-cookie"></iconify-icon>
        </div>
        <div class="content">
          Făcând clic pe „Accept”, sunteți de acord că Pawpy poate stoca cookie-uri pe dispozitivul dvs. 
          și puteți dezvălui informații în conformitate cu politica noastră de cookie-uri. 
        </div>
        <div class="flex">
          <button class="accept-cookies">Accept toate</button>
          <button class="accept-cookies">Doar cele necesare</button>
        </div>
      </div>`)
      $(".cookies").animate({ bottom: "20px" }, 1000)
      $(".cookies .accept-cookies").on("click", function () {
        cfg["funcs"]["setCookie"]("cookies", "true", 30)
        $(".cookies").animate({ bottom: "-100%" }, 1000)
        setTimeout(() => {
          $(".cookies").remove()
        }, 1000);
      })
    }, 0)
  }
})

export default cfg