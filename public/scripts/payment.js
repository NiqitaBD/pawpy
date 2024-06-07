import cfg from "./main.js";
$(function () {
  $("footer").hide()
  $("#header-logo").attr("src", "assets/logoBeige.png")

  const tax = cfg["tax"] ? cfg["tax"] : 0
  const pageParams = new URLSearchParams(window.location.search);
  const name = pageParams.get("name") ? pageParams.get("name") : ""
  const value = pageParams.get("value") ? pageParams.get("value") : 0
  var currenciesdata = {}
  var lastcurrency = "MDL"
  var paymentdata = {
    type: null,
    value: null,
    currency: "MDL"
  }
  const prices = [50, 100, 200, 500, 800, 1000]
  $(".hallow").each(function () { $(this).remove() })
  prices.forEach(p => {
    $(".grid").append(`<button class="hallow" value="${p}">${parseFloat(p).toFixed(1)} MDL</button>`)
  });
  const setCurrency = function (currency) {
    paymentdata["currency"] = currency
    $.ajax({
      url: "/convertCurrency", type: "post", data: JSON.stringify({ currency: currency }), contentType: 'application/json',
      success: function (data) {
        const v = data.data.conversion_rates["MDL"]
        $(".hallow").each(function () {
          $(this).html(`${($(this).attr("value") / v).toFixed(1)} ${currenciesdata[currency].symbol}`)
        })
        if ($("#input-zone input").val() && $("#input-zone input").val() != 0) {
          $("#input-zone input").val(`${($("#input-zone input").val() / data.data.conversion_rates[lastcurrency]).toFixed(1)}`)
        }
        lastcurrency = currency
      },
      error: function () {
        cfg["funcs"]["notify"]("A intervenit o problemă cu conversia de valută, selectează altă valută.")
      }
    })

    $(".hallow").each(function () {
      $(this).on("click", function () {
        $(".hallow").removeClass("selected")
        $(this).addClass("selected")
        $("#input-zone input").val($(this).html().match(/\d+/)[0])
      })
    })
  }
  const checkValue = function () {
    const val = $("#value").val()
    if (!val) return
    const formatedVal = parseFloat(val).toFixed(1)
    $("button.hallow").each(function () {
      const buttonText = $(this).html()
      const numberFromButtonText = buttonText.split(' ')[0]
      if (numberFromButtonText === formatedVal) {
        $(this).addClass("selected");
      } else {
        $(this).removeClass("selected");
      }

    })
  };


  $("#donation").remove()
  $("#cardname").val(name)
  $("#value").val(value); checkValue()
  $(".color").css("height", $("header").height() + 60)
  $.getJSON("assets/currencies.json", function (data) {
    $("select").empty()
    currenciesdata = data
    setCurrency("MDL")
    for (var i in data) {
      $("select").append(`<option value="${i}" ${i == "MDL" ? "selected" : ""}>${i} - ${data[i].name}</option>`)
    }
    $("select").on("change", function () {
      setCurrency($(this).val())
    })
    $("#overlayLoader").fadeOut()
  });
  $("#value").on("input", function () { checkValue() })
  $(".paymentdur").each(function () {
    $(this).on("click", function () {
      $(".paymentdur").removeClass("selected")
      $(this).addClass("selected")
      const type = $(this).attr("type")
      paymentdata["type"] = type
    })
  })
  $("#overview").hide()
  $("#overview #card").hide()
  $("#questions .header").each(function () {
    $(this).on("mouseover", function () {
      $(this).find(".text").fadeToggle()
    })
    $(this).on("mouseout", function () {
      $(this).find(".text").fadeToggle()
    })
  })
  $("#btn-donate").on("click", function () {
    paymentdata["value"] = parseFloat($("#input-zone input").val())
    if (!paymentdata["type"]) return cfg["funcs"]["notify"]("Selectează o modalitate de plată")
    if (!paymentdata["value"]) return cfg["funcs"]["notify"]("Selectează o sumă de plată")
    if (!paymentdata["currency"]) return cfg["funcs"]["notify"]("Selectează o valută")
    $("#overview .value").html(`${paymentdata["value"]} ${currenciesdata[paymentdata["currency"]].symbol}`)
    $("#overview").fadeIn()
    $("#overview #card").hide()
  })
  $("#overview .display .close").on("click", async function () {
    const res = await cfg["funcs"]["request"]("Ești sigur că dorești să ieși.")
    if (res) {
      $("#overview").fadeOut()
    }
  })
  $("#overview #card .close").on("click", async function () {
    const res = await cfg["funcs"]["request"]("Ești sigur că dorești să ieși.")
    if (res) {
      $("#overview").fadeOut()
      $("#overview #card").hide()
      $("#overview .data").show()
    }
  })
  $("#overview #card .back").on("click", function () {
    $("#overview #card").fadeOut(400)
    setTimeout(() => {
      $("#overview .data").fadeIn()
    }, 400);
  })
  $("#taxes").on("change", function () {
    if ($(this).is(":checked")) {
      const value = parseFloat(paymentdata["value"] * (1 + tax / 100)).toFixed(1);
      const formattedValue = `${value} ${currenciesdata[paymentdata["currency"]].symbol}`;
      $("#overview .value").html(formattedValue);
    } else {
      const formattedValue = `${paymentdata["value"]} ${currenciesdata[paymentdata["currency"]].symbol}`;
      $("#overview .value").html(formattedValue);
    }
  })
  $(".paymentmethod").each(function () {
    $(this).on("click", function () {
      paymentdata["method"] = $(this).attr("type")
      const value = parseFloat(paymentdata["value"] * (1 + tax / 100)).toFixed(1);
      paymentdata["tax"] = value
      if (!paymentdata["method"]) return cfg["funcs"]["notify"]("Selectează o modalitate de plată")
      if (paymentdata["method"] == "Card") {
        $("#overview .data").fadeOut(500)
        setTimeout(function () {
          $("#overview #card").fadeIn()
        }, 500)
      } else {
        $.ajax({
          url: "/payment", type: "post", data: JSON.stringify(paymentdata), contentType: 'application/json',
          success: function (data) {
            cfg["funcs"]["notify"]("Plata a fost efectuată cu succes")
            setTimeout(function () {
              window.location.href = "/"
            }, 1000)
          },
          error: function (data) {
            if (data.responseJSON) {
              cfg["funcs"]["notify"](data.responseJSON.message)
            } else {
              cfg["funcs"]["notify"]("A intervenit o problemă cu plata, te rugăm să reîncearci.")
            }
          }
        })
      }
    })
  })
  $("#overview #card .finish-card").on("click", function () {
    const card = $("#overview #card")
    const cardnumber = card.find("#cardnumber").val()
    const cardname = card.find("#cardname").val()
    const cardexpiration = card.find("#cardexpiration").val()
    const cardcvv = card.find("#cardcvv").val()
    if (!cardnumber || !cardname || !cardexpiration || !cardcvv) return cfg["funcs"]["notify"]("Te rugăm să completezi toate câmpurile")
    if (!cfg["funcs"]["validateCard"](cardnumber)) return cfg["funcs"]["notify"]("Cardul este invalid")
    if (!cfg["funcs"]["isNotExpired"](cardexpiration)) return cfg["funcs"]["notify"]("Cardul este expirat")
    if (!cfg["funcs"]["validateCVC"](cardcvv)) return cfg["funcs"]["notify"]("CVV-ul este invalid")
    $.ajax({
      url: "/payment", type: "post", data: JSON.stringify(paymentdata), contentType: 'application/json',
      success: function (data) {
        cfg["funcs"]["notify"]("Plata a fost efectuată cu succes")
        setTimeout(function () {
          window.location.href = "/"
        }, 1000)
      },
      error: function (data) {
        if (data.responseJSON) {
          cfg["funcs"]["notify"](data.responseJSON.message)
        } else {
          cfg["funcs"]["notify"]("A intervenit o problemă cu plata, te rugăm să reîncearci.")
        }
      }
    })
  })
})
