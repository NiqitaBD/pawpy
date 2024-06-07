import cfg from "./main.js"

$(function () {
  const db = "photos"
  const requestImage = function (i) {
    return new Promise((resolve, reject) => {
      try {
        $.get(`../assets/db/${db}/${db} (${i}).jpg`)
          .done(function () {
            resolve(i)
          }).fail(function () {
            resolve(false)
          })
      } catch (error) {
        console.log(error);        
      }
    })
  }
  const loadImages = async function () {
    let imagesCount = 0;
    const imagesPerColumn = [0, 0, 0];
    for (let i = 1; i < 60; i++) {
      const res = await requestImage(i)
      if (res) {
        const columnIndex = imagesCount % imagesPerColumn.length;
        imagesPerColumn[columnIndex]++;
        imagesCount++;
      } else break
    }
    let imagesUsed = 1
    imagesPerColumn.forEach((count, column) => {
      for (let i = 0; i < count; i++) {
        $(".column").eq(column).append(`
        <div class="column-${column}-image-${i}">
          <img src="../assets/db/${db}/${db} (${imagesUsed}).jpg" alt="${db} (${imagesUsed})" class="imageOpener">
        </div>
        `)
        imagesUsed++
      }
    })
    $("#overlayLoader").fadeOut()
    $(".imageOpener").each(function() {
      $(this).on("click", function() {
        const src = $(this).attr("src")
        if (!src) return 
        cfg["funcs"]["viewImage"](src)
      })
    })
  }
  loadImages()
})
