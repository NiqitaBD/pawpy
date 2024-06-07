const encrypt = require("encryptjs");
const monthNames = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
"Iulie", "August", "Septembrie", "Octombrie", "Noiembri", "Decemberie"
];

const theKey = "NiqitaRegele";
const cfg = {
  ["funcs"]: {
    ["validateCookie"]: function (cookie) {
      if (!cookie) return
      if (cookie.length < 5) return
      var bool = false
      var id = undefined
      try {
        const decrypted = encrypt.decrypt(cookie, theKey, 256)
        if (decrypted) {
          const decoded = JSON.parse(decrypted)
          if (decoded) {
            if (decoded.keyWord == "SecretWord") {
              if (parseInt(decoded.id))
              bool = true
              id = decoded.id
            }
          }
        }
      } catch (error) {
        console.error("Error on validating Cookie, Error: " + error)
      }
      return [bool, id]
    },
    ["requestSalt"]: function (length) {
      if (!length) { length = 12 }
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let randomString = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
      }
      return randomString;
    },
    ["getDateFormated"]:  function() {
      const date = new Date();
      const datestring = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      return datestring
    },
    ["getDateString"]: function(str) {
      if (!str) return
      const date = new Date(str)      
      return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`
    }
  }
};

module.exports = cfg;

