const cfg = require("./funcs.js")
const emailfuncs = require("./email.js")
const { initializeSocket, TriggerClientEvent, TriggerPageEvent } = require('./socket.js');
const { createServer } = require('node:http');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql")
const encrypt = require("encryptjs");
const cookieParser = require('cookie-parser')
const fs = require("fs")
const path = require("path")
const multer = require("multer");
const request = require("request");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads")
  },
  filename: function (req, file, cb) {
    const fileName = Date.now() + cfg["funcs"]["requestSalt"]() + path.extname(file.originalname);
    console.log("Added image -> " + fileName);
    cb(null, fileName);
    req.fileName = fileName;
  }
})
const upload = multer({ storage: storage })
const port = 80
const db = mysql.createConnection({
  host: "localhost",
  user: "niq",
  password: "V71GlO0pM1MYgAIddf6kIxn",
  database: "pawpy",
});
const theKey = "NiqitaRegele";
const domain = ""
const imgString = ["profile1.png", "profile2.png", "profile3.png", "profile4.png", "profile5.png", "profile6.png", "profile7.png", "profile8.png", "profile9.png", "profile10.png",
  "profile11.png", "profile12.png", "profile13.png", "profile14.png",]

const app = express();
const server = createServer(app);
const writeFileAsync = fs.promises.writeFile;
const unlinkAsync = fs.promises.unlink;

initializeSocket(server)
console.succes = function (type, string) {
  if (!type || !string) return
  console.log("\x1b[32m%s\x1b[0m", `[${type}]`, string);
}
console.decline = function (type, string) {
  if (!type || !string) return;
  console.log("\x1b[31m%s\x1b[0m", `[${type}]`, string);
}

db.connect((error) => {
  if (error) { return console.log(error); }
  console.succes("PAWPY DB", "Conectat cu succes la baza de date!")
});

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 500,
  message: 'Prea multe cereri de la acest IP, vă rugăm să încercați din nou după 15 minute'
});

try {
  // console.succes("PAWPY RATELIMIT", "Limita de cereri activată!")
  // app.use(limiter);
} catch (error) {
  console.error(error)
}
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'))
app.use(cookieParser())

var admins = {}

const sendToLogs = function (type, message) {
  db.query("INSERT INTO logs (type, content, date) VALUES (?, ?, ?)", [type, message, cfg["funcs"]["getDateFormated"]()], function (err, ress) {
    if (err) return console.error("Eroare la trimiterea în jurnale: " + err)
    console.succes("PAWPY LOGS", "Trimis în jurnale: " + type + " - " + message)
  })
}

db.query("SELECT * FROM users WHERE admin <>0", function (err, ress) {
  if (err) return console.error("Eroare la încărcarea conturilor de admin: " + err)
  for (let k in ress) {
    var v = ress[k]
    if (v) {
      admins[v.id] = v.admin
    }
  }
  console.succes("PAWPY ADMINS", "Conturi de admin încărcate!")
})
app.post("/", function (req, res) {
  console.log("hello");
  res.send("Hello World")
})

app.post("/requestLanding", function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  var data = {}
  var logged = false; var uid = undefined
  if (req.cookies.connection) {
    [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  }
  db.query("SELECT * FROM dogs WHERE verified <>0 ORDER BY id DESC LIMIT 4", function (err, ress) {
    if (err) return exit()
    if (!ress) return exit()
    data["dogs"] = ress.map(function (dog) {
      dog.image = `${domain}/uploads/${dog.image}`
      return dog
    })
    db.query("SELECT * FROM posts WHERE category = 'feedback' ORDER BY id DESC LIMIT 7", function (err, ress) {
      if (err) return exit()
      if (!ress) return exit()
      var feedbacks = ress
      const feedIdS = feedbacks.map(feedback => feedback.uid);
      db.query("SELECT id, firstname, lastname, image FROM users WHERE id IN (?)", [feedIdS], function (err, ress) {
        if (err) return exit()
        if (!ress[0]) return exit()

        var users = {}
        for (const user of ress) {
          users[user.id] = {
            username: `${user.firstname} ${user.lastname[0]}.`,
            image: `${domain}/uploads/${user.image}`
          };
        }

        mappedFeedbacks = feedbacks.map(function (feedback) {
          return {
            image: users[feedback.uid].image,
            header: users[feedback.uid].username,
            stars: feedback.type,
            content: feedback.content
          }
        })

        data["feedbacks"] = mappedFeedbacks
        data["logged"] = logged
        db.query("SELECT * FROM data", function (err, ress) {
          if (err) return exit()
          if (!ress) return exit()
          data["data"] = ress

          return res.json({
            ok: true,
            data: data
          })
        })
      })
    })
  })
})

app.post("/requestDogs", function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')); };
  var logged = false; uid = undefined
  if (req.cookies.connection) {
    [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  }
  db.query("SELECT * FROM dogs", function (err, result) {
    if (err) return exit();
    const dogs = result.map(function (dog) {
      dog.image = `${domain}/uploads/${dog.image}`;
      return dog;
    });
    res.json({ ok: true, dogs: dogs });
  });
});

app.post("/requestBlogs", function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')); };
  var localdata = {}

  db.query("SELECT * FROM posts WHERE category = 'question' ORDER BY id DESC", function (err, ress) {
    if (err) { return exit(); }
    localdata["questions"] = ress;

    db.query("SELECT * FROM posts WHERE category = 'blog' ORDER BY id DESC", function (err, ress) {
      if (err) { return exit(); }

      localdata["blogs"] = ress.map(function (blog) {
        blog.image = `${domain}/uploads/${blog.image}`
        return blog
      })

      res.json({ ok: true, questions: localdata["questions"], blogs: localdata["blogs"] });
    });
  });
});

app.post("/removeBlog", function (req, res) {
  const exit = function () { res.sendStatus(500) }
  const id = req.body.id
  const cookie = req.cookies.connection
  if (!id || !cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  if (!admins[uid]) return exit()
  if (admins[uid] < 2) return exit()
  db.query("DELETE FROM posts WHERE id = ?", [id], async function (err, ress) {
    if (err) return exit()
    res.sendStatus(200)
    await TriggerPageEvent("account", "adminRefreshBlogs", id)
    var localdata = {}
    db.query("SELECT * FROM posts WHERE category = 'question' ORDER BY id DESC", function (err, ress) {
      if (err) return
      localdata["questions"] = ress;
      db.query("SELECT * FROM posts WHERE category = 'blog' ORDER BY id DESC", async function (err, ress) {
        if (err) return
        localdata["blogs"] = ress.map(function (blog) {
          blog.image = `${domain}/uploads/${blog.image}`
          return blog
        })
        await TriggerPageEvent("blogs", "refreshBlogs", localdata)
      })
    })
  })
})

app.post("/getBlogData", function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')); };
  const { pid } = req.body
  if (!pid) { return exit() }

  db.query("SELECT * FROM posts WHERE id = ?", [pid], function (err, ress) {
    if (err) { return exit() }
    if (!ress[0] || !ress[0].image) return exit()
    ress[0].image = `${domain}/uploads/${ress[0].image}`
    let post = ress[0]

    db.query("SELECT * FROM posts WHERE category = 'blog' ORDER BY RAND() LIMIT 4", function (err, ress) {
      if (err) { console.error(err); res.sendFile(path.join(__dirname, 'public/error.html'));; return }

      const mappedBlogs = ress.map(function (blog) {
        blog.image = `${domain}/uploads/${blog.image}`
        return blog
      })

      res.json({ ok: true, post: post, random: mappedBlogs })

    })

  })
})

app.post("/tryConnect", function (req, res) {
  const name = req.body.email
  const password = req.body.password
  const exit = function () { return res.json({ ok: false }) };

  db.query("SELECT password, id FROM users WHERE email = ?", [name], function (err, ress) {
    if (err) return exit()
    if (!ress[0] || !ress[0].password) return exit()
    if (password === ress[0].password) {
      const data = { keyWord: "SecretWord", id: ress[0].id }
      const encryptedStuff = encrypt.encrypt(JSON.stringify(data), theKey, 256)
      return res.json({
        ok: true,
        val: encryptedStuff
      })
    }
    return exit()
  })
})

app.post("/tryRegister", function (req, res) {
  const firstname = req.body.firstname
  const lastname = req.body.lastname
  const email = req.body.email
  const password = req.body.password
  console.log(firstname, lastname, email, password);
  const exit = function (reason) {
    if (reason) {
      return res.status(500).json({ val: reason })
    } else {
      return res.status(500).json({ val: "Eroare la baza de date" })
    }
  };

  if (!firstname || !lastname || !email || !password) return exit()

  db.query("SELECT id FROM users WHERE email = ?", [email], function (err, ress) {
    if (err) return exit()

    if (ress.length > 0) return exit("Email-ul este deja folosit!")

    db.query("INSERT INTO users ( firstname, lastname, password, email ) VALUES ( ?, ?, ?, ? )", [
      firstname, lastname, password, email
    ], function (err, ress) {
      if (err) return exit()
      emailfuncs.register(email, firstname, lastname)
      return res.json({ ok: true })
    })
  })
})

app.post("/getFaq", function (_, res) {
  db.query("SELECT * FROM posts WHERE category='question'", function (err, ress) {
    if (err) return
    res.json(ress)
  })
})

app.post("/removeFaq", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const faq_id = req.body.id
  if (!faq_id) return exit()
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return
  db.query("DELETE FROM posts WHERE id = ?", [faq_id], function (err, _) {
    if (err) return exit()
    sendToLogs("FAQ", `Utilizatorul UID: ${uid} a șters întrebarea ID: ${faq_id}`)
    return res.sendStatus(200)
  })
})

app.post("/addFaq", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const cookie = req.cookies.connection
  const header = req.body.header
  const content = req.body.content
  if (!cookie || !header || !content) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged || !uid) return exit()
  if (admins[uid] < 2) return exit()
  db.query("INSERT INTO posts (header, content, category) VALUES (?, ?, 'question')", [header, content], function (err, result) {
    if (err) return exit();
    db.query("SELECT LAST_INSERT_ID() AS id", function (err, result) {
      if (err) return exit();
      const faqId = result && result[0] && result[0].id ? result[0].id : null;
      if (!faqId) return exit();
      res.status(200).json({ id: faqId });
      var localdata = {}
      db.query("SELECT * FROM posts WHERE category = 'question' ORDER BY id DESC", function (err, ress) {
        if (err) return
        localdata["questions"] = ress;
        db.query("SELECT * FROM posts WHERE category = 'blog' ORDER BY id DESC", async function (err, ress) {
          if (err) return
          localdata["blogs"] = ress.map(function (blog) {
            blog.image = `${domain}/uploads/${blog.image}`
            return blog
          })
          await TriggerPageEvent("blogs", "refreshBlogs", localdata)
        })
      })
    });
  });
})


app.post("/checkCookie", function (req, res) {
  const exit = function (reason) { return res.status(500).json({ message: reason }) }
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  db.query("SELECT firstname, lastname, image FROM users WHERE id = ?", [parseInt(uid)], function (err, ress) {
    if (err) return exit()
    if (ress.length == 0) return exit("delete")
    ress[0].image = `${domain}/uploads/${ress[0].image}`
    res.json({ val: ress[0] })
  })
})

app.post("/addDog", function (req, res) {
  const data = req.body.data
  if (!data) return res.sendStatus(500)
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  if (!logged) return res.status(500).json({ message: "Nu sunteți logat." })
  const base64Data = data["image"].replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = Date.now() + cfg["funcs"]["requestSalt"]() + ".png";
  fs.writeFile(path.join(__dirname, '/public/uploads/', fileName), buffer, (err) => {
    if (err) {
      console.error('Error:', err);
      return res.sendStatus(500)
    } else {
      console.log('File saved successfully! ' + fileName);
      const exit = function (reason) {
        fs.unlink(path.join(__dirname, '/public/uploads/', req.fileName), (err) => {
          if (err) { console.error(err); } else {
            console.log('File is deleted.');
          }
        });
        if (reason) {
          return res.sendStatus(500)
        } else {
          return res.status(500).json({ message: reason })
        }
      }
      db.query("INSERT IGNORE INTO dogs (uid, name, breed, age, sex, `description`, image, date) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?)",
        [uid, data.name, data.breed, data.age, data.sex, data.description, fileName, new Date()],
        function (err, ress) {
          if (err) { return exit() }
          db.query("UPDATE data SET possession = possession + 1")
          res.sendStatus(200)
        })
    }
  });
})

app.post("/addBlog", function (req, res) {
  const header = req.body.header
  const content = req.body.content
  const image = req.body.image
  const type = req.body.type
  if (!header || !content || !image || !type) return res.sendStatus(500)
  const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = Date.now() + cfg["funcs"]["requestSalt"]() + ".png";
  fs.writeFile(path.join(__dirname, '/public/uploads/', fileName), buffer, (err) => {
    if (err) {
      console.error('Error:', err);
      return res.sendStatus(500)
    } else {
      console.log('File saved successfully! ' + fileName);
      const exit = function (reason) {
        console.log(reason);
        fs.unlink(path.join(__dirname, '/public/uploads/', fileName), (err) => {
          if (err) { console.error(err); } else {
            console.log('File is deleted.');
          }
        });
        return res.sendStatus(500)
      }
      db.query("INSERT INTO posts (header, content, type, image, date) VALUES (?, ?, ?, ?, ?)", [ header, content, type, fileName, new Date() ], function (err, ress) {
        if (err) return exit(err)
        res.sendStatus(200)
        db.query("SELECT LAST_INSERT_ID() AS id", async function (err, ress) {
          await TriggerPageEvent("account", "adminAddBlog", {
            image: `${domain}/uploads/${fileName}`,
            header: header,
            id: ress && ress[0] && ress[0].id ? ress[0].id : null,
          })
          var localdata = {}
          db.query("SELECT * FROM posts WHERE category = 'question' ORDER BY id DESC", function (err, ress) {
            if (err) return
            localdata["questions"] = ress;
            db.query("SELECT * FROM posts WHERE category = 'blog' ORDER BY id DESC", async function (err, ress) {
              if (err) return
              localdata["blogs"] = ress.map(function (blog) {
                blog.image = `${domain}/uploads/${blog.image}`
                return blog
              })
              await TriggerPageEvent("blogs", "refreshBlogs", localdata)
            })
          })
        })
      })
    }
  });
})

app.post("/getDogData", function (req, res) {
  const { id, cookie } = req.body;
  const exit = () => res.json({ ok: false });

  if (!id) return exit();

  db.query("SELECT * FROM dogs WHERE id = ?", [id], (err, ress) => {
    if (err) return exit();
    const dog = ress[0];
    const cookie = req.cookies.connection
    if (!dog) return exit();
    if (!dog.image) return exit();

    db.query("SELECT firstname, lastname FROM users WHERE id = ?", [dog.uid], (err, ress) => {
      if (err) return exit();
      dog.ownerdata = ress[0].firstname + " " + ress[0].lastname;
      dog.image = `${domain}/uploads/${dog.image}`;
      dog.owner = false;
      dog.date = cfg["funcs"]["getDateString"](dog.date)
      if (!cookie) {
        return res.json({ ok: true, data: dog });
      } else {
        const [logged, uid] = cfg["funcs"]["validateCookie"](cookie);
        if (logged) {
          if (uid == dog.uid) {
            dog.owner = true;
          }
          db.query("SELECT liked FROM users WHERE id = ?", [uid], (err, ress) => {
            if (err) return exit();
            const arr = JSON.parse(ress[0].liked);
            if (arr.includes(id)) {
              dog.liked = true;
            }
            res.json({ ok: true, data: dog });
          });
        } else {
          res.json({ ok: true, data: dog });
        }
      }
    })
  });
});

app.post("/verifyDog", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const id = req.body.id
  const cookie = req.cookies.connection
  if (!id || !cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  if (!admins[uid]) return exit()
  db.query("UPDATE dogs SET verified = 1 WHERE id = ?", [id], function (err, ress) {
    if (err) return exit()
    res.sendStatus(200)
    emailfuncs.sendAll(emails)
    sendToLogs("verify", "Verificare pentru câinele cu id-ul " + id + " a fost efectuată de către ID: " + uid)
    db.query("SELECT * FROM dogs", async function (err, ress) {
      if (err) return exit()
      ress.map((dog) => {
        dog.image = `${domain}/uploads/${dog.image}`
        return dog;
      });
      await TriggerPageEvent("dogs", "refreshDogs", ress)
      await TriggerPageEvent("account", "adminRefreshDogs", id)
    });
  })
})
app.post("/likePost", function (req, res) {
  const data = req.body
  const exit = function (err) {
    if (err) {
      return res.status(500).json({ message: err })
    } else {
      return res.status(500).json({ message: "Eroare la baza de date" })
    }
  }
  if (!data.did) return exit("Nu ați selectat nici un post.")
  if (data.did == "undefined") return exit("Nu ați selectat nici un post.")
  const cookie = req.cookies.connection
  if (!cookie) return exit("Nu sunteți logat.")
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit("Nu sunteți logat.")
  db.query("SELECT liked FROM users WHERE id = ?", [uid], function (err, ress) {
    if (err) return exit(err)
    try {
      var arr = JSON.parse(ress[0].liked)
      if (arr.includes(data.did)) {
        arr = arr.filter(function (item) {
          return item !== data.did
        })
        db.query("UPDATE users SET liked = ? WHERE id = ?", [JSON.stringify(arr), uid], function (err, ress) {
          if (err) return exit(err)
          res.status(200).json({ bool: false })
        })
      } else {

        arr.push(data.did)
        db.query("UPDATE users SET liked = ? WHERE id = ?", [JSON.stringify(arr), uid], function (err, ress) {
          if (err) return exit(err)
          res.status(200).json({ bool: true })
        })
      }
    } catch (error) {
      return exit()
    }
  })
})

app.post("/requestUserData", function (req, res) {
  const cookie = req.cookies.connection
  const exit = function () { res.sendStatus(500) }

  if (!cookie) return exit()

  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  let data = { "posts": [], "dogs": [] }
  db.query("SELECT * FROM posts WHERE uid = ? ORDER BY id DESC", [uid], function (err, ress) {
    if (err) return exit()
    data["posts"] = ress
    db.query("SELECT * FROM dogs WHERE uid = ? ORDER BY id DESC", [uid], function (err, ress) {
      if (err) return exit()
      data["dogs"] = ress.map(function (dog) {
        dog.image = `${domain}/uploads/${dog.image}`
        return dog
      })
      data["profiles"] = imgString.map(img => { return img = { name: img, image: `${domain}/uploads/${img}` } })
      db.query("SELECT image, verified, firstname, lastname, liked FROM users WHERE id = ? ORDER BY id DESC", [uid], function (err, ress) {
        if (err) return exit()
        if (!ress[0]) return exit()
        const arr = JSON.parse(ress[0].liked)
        data["userImage"] = `${domain}/uploads/${ress[0].image}`
        data["username"] = `${admins[uid] ? "[ Admin " + admins[uid] + " ]" : ""} ${ress[0].firstname} ${ress[0].lastname}`
        data["verified"] = ress[0].verified
        data["admin"] = admins[uid]
        db.query("SELECT * FROM donations WHERE uid = ?", [uid], function (err, ress) {
          if (err) return exit()
          data["donations"] = ress
          if (arr.length > 0) {
            db.query("SELECT * FROM dogs WHERE id IN (?)", [arr], function (err, ress) {
              if (err) return exit()
              data["liked"] = ress.map(function (dog) {
                dog.image = `${domain}/uploads/${dog.image}`
                return dog
              })
              res.json({ ok: true, data: data })
            })
          } else {
            res.json({ ok: true, data: data })
          }
        })
      })
    })
  })
})

app.post("/setUserImage", function (req, res) {
  const { profile } = req.body
  const cookie = req.cookies.connection
  const exit = function () { res.sendStatus(500) }
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  db.query("UPDATE users SET image = ? WHERE id = ?", [profile, uid], function (err, ress) {
    if (err) return exit()
    res.status(200).json({ image: `${domain}/uploads/${profile}` })
  })
})

app.post("/setUserCustomImage", upload.single("image"), function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  const data = req.body
  const base64Data = data["image"].replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const fileName = Date.now() + cfg["funcs"]["requestSalt"]() + ".png";
  if (!logged) return exit()
  fs.writeFile(path.join(__dirname, '/public/uploads/', fileName), buffer, (err) => {
    db.query("UPDATE users SET image = ? WHERE id = ?", [fileName, uid], function (err, ress) {
      if (err) {
        console.error('Error:', err);
        return res.sendStatus(500)
      } else {
        if (err) return exit()
        res.status(200).json({ image: `${domain}/uploads/${fileName}` })
      }
    })
  })
});

app.post("/changeDogImage", upload.single("image"), function (req, res) {
  const { did } = req.body
  const exit = function (data) { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  if (!logged) return exit()

  db.query("SELECT uid FROM dogs WHERE id = ?", [did], function (err, ress) {
    if (err) return exit()
    if (ress[0].uid == uid) {
      db.query("UPDATE dogs SET image = ? WHERE id = ?", [req.fileName, did], function (err, ress) {
        if (err) return exit()
        res.sendFile(path.join(__dirname, 'public/succes.html'));
      })
    } else return exit()
  })
})

app.post("/addFeedback", function (req, res) {
  const data = req.body
  const exit = function () { return res.sendStatus(500) }
  if (!data.stars || !data.content) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  if (!logged) return exit()
  db.query("SELECT * FROM posts WHERE uid = ? AND category = 'feedback'", [uid], function (err, ress) {
    if (err) return exit()
    if (ress.length > 0) { exit(); TriggerClientEvent(uid, "notify", "You already gave feedback!"); return }
    db.query("INSERT INTO posts (uid, content, type, category) VALUES (?, ?, ?, 'feedback')", [
      uid, data.content, data.stars
    ], function (err, ress) {
      if (err) return exit()
      return res.sendStatus(200)
    })
  })
})

app.post("/changeDogData", function (req, res) {
  const { id, cookie, action, value } = req.body
  const exit = function () { return req.json({ ok: false }) }

  if (!id || !cookie || !action || !value) return exit()

  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()

  db.query("SELECT uid FROM dogs WHERE id = ?", [id], function (err, ress) {
    if (err) return exit()
    if (ress[0].uid === uid) {
      db.query("UPDATE dogs SET ?? = ? WHERE id = ?", [action, value, id], function (err, ress) {
        if (err) return exit()
        res.json({ ok: true })
      })
    } else return exit()
  })
})

app.post("/discardDog", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const data = req.body
  if (!data) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection)
  if (!logged) return exit()
  db.query("SELECT uid FROM dogs WHERE id = ?", [data.id], function (err, ress) {
    if (err) return exit()
    const localdata = ress[0]
    if (localdata) {
      if (localdata.uid === uid) {
        db.query("DELETE FROM dogs WHERE id = ?", [data.id], function (err, ress) {
          if (err) return exit()
          db.query("UPDATE data SET adopted = adopted + 1, possession = possession - 1", function (err, ress) {
            if (err) return exit()
            res.sendStatus(200)
            db.query("SELECT * FROM dogs", async function (err, ress) {
              if (err) return
              ress = ress.map(function (dog) {
                dog.image = `${domain}/uploads/${dog.image}`
                return dog
              })
              await TriggerPageEvent("dogs", "refreshDogs", ress)
              await TriggerPageEvent("account", "adminRefreshDogs", data.id)
            })
          })
        })
      } else return exit()
    } else return exit()
  })
})


app.post("/removeDogAdmin", async function (req, res) {
  const exit = () => res.sendStatus(500);
  const [logged, uid] = cfg["funcs"]["validateCookie"](req.cookies.connection);
  if (!logged || !admins[uid]) return exit();
  db.query("DELETE FROM dogs WHERE id = ?", [req.body.id], function (err, ress) {
    if (err) return exit()
    db.query("SELECT * FROM dogs", async function (err, ress) {
      if (err) return
      ress = ress.map(function (dog) {
        dog.image = `${domain}/uploads/${dog.image}`
        return dog
      })
      sendToLogs("verify", "Stergere cainelui cu id-ul " + req.body.id + " de la admin ID: " + uid)
      await TriggerPageEvent("dogs", "refreshDogs", ress)
      await TriggerPageEvent("account", "adminRefreshDogs", req.body.id)
    })
    res.sendStatus(200)
  })
})

app.post("/openSideBlog", function (req, res) {
  const { pid, type, target } = req.body
  const exit = function () { return res.json({ ok: false }) }
  if (!pid || !type || !target) return exit()
  if (target == "left") {

    db.query("SELECT id FROM posts WHERE id < ? AND type = ? LIMIT 1", [pid, type], function (err, ress) {
      if (err) return exit()
      if (!ress[0]) { console.log(`Could not din blog [ Direction: ${target} ] | [ Bid: ${pid} ]`); exit(); return }
      res.json({ ok: true, id: ress[0].id })
    })

  } else if (target == "right") {

    db.query("SELECT id FROM posts WHERE id > ? AND type = ? LIMIT 1", [pid, type], function (err, ress) {
      if (err) return exit()
      if (!ress[0]) { console.log(`Could not din blog [ Direction: ${target} ] | [ Bid: ${pid} ]`); exit(); return }
      res.json({ ok: true, id: ress[0].id })
    })

  } else { return exit() }
})

var emails = []
db.query("SELECT email FROM subscribers", function (err, ress) {
  if (err) return console.error(err)
  emails = ress.map(function (email) { return email.email })
})

app.post("/subscribe", function (req, res) {
  const exit = function (err) {
    if (err) {
      res.status(500).json({ message: err })
    } else res.sendStatus(500)
  }
  const email = req.body.email
  if (!email) return exit()
  if (emails.includes(email)) return exit("Email already exists!")
  db.query("INSERT INTO subscribers (email) VALUES (?)", [email], function (err, ress) {
    if (err) return exit()
    emails.push(email)
    res.sendStatus(200)
  })
})

app.post("/ping", function (req, res) {
  var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || "Error";
  const drum = path.join(__dirname, 'text.txt');
  fs.appendFile(drum, "New device enterd with IP: " + ip + "\n", err => {
    if (err) return console.error(err);
    console.log("User saved x2!");
  });
})

const dict = {
  'Nume': 'lastname',
  'Prenume': 'firstname',
  'Email': 'email',
  'Parola': 'password'
}
app.post("/updateUserData", function (req, res) {
  const data = req.body
  const exit = function () { res.sendStatus(500) }
  if (!data.data) return exit()
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  for (let k in data.data) {
    if (data.data[k]) {
      db.query("UPDATE users SET ?? = ? WHERE id = ?", [dict[k], data.data[k], uid], function (err, ress) {
        if (err) return exit()
      })
      if (dict[k] == "email") {
        db.query("UPDATE users SET verified = 0 WHERE id = ?", [uid], function (err, ress) {
          if (err) return exit()
        })
      }
    }
  }
  res.sendStatus(200)
})

var deleteQueries = {}

app.post("/removeUser", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  db.query("SELECT email, verified, firstname FROM users WHERE id = ?", [uid], function (err, ress) {
    if (err) return exit()
    const email = ress[0].email
    const verified = ress[0].verified
    if (!email) return exit()
    if (!verified) {
      db.query("DELETE FROM users WHERE id = ?", [uid], function (err, ress) {
        if (err) return exit()
        return res.status(200).json({ message: "done" })
      })
    } else {
      const salt = cfg["funcs"]["requestSalt"](64)
      deleteQueries[salt] = uid
      emailfuncs["deleteUser"](email, salt, ress[0].firstname)
      return res.sendStatus(200)
    }
  })
})

app.get("/delete", function (req, res) {
  const vid = req.query.q
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  if (!vid) return exit()
  if (deleteQueries[vid]) {
    db.query("DELETE FROM users WHERE id = ?", [deleteQueries[vid]], function (err, ress) {
      if (err) return exit()
      deleteQueries[vid] = null
      res.sendFile(path.join(__dirname, 'public/succes.html'))
    })
  } else return exit()
})

var verifyingData = {}

app.post("/requestVerification", function (req, res) {
  const cookie = req.cookies.connection
  const exit = function () { return res.sendStatus(500) }
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  const vid = cfg["funcs"]["requestSalt"](64)
  verifyingData[vid] = uid
  db.query("SELECT email FROM users WHERE id = ?", [uid], async function (err, ress) {
    if (err) return exit()
    const mail = ress[0].email
    const response = await emailfuncs.verify(mail, vid)
    if (response) {
      setTimeout(() => {
        verifyingData[vid] = null
      }, 5 * 60 * 1000);
      res.sendStatus(200)
    }
  })
})

app.get("/verify", function (req, res) {
  const vid = req.query.verifyid
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  if (!vid) return exit()
  if (verifyingData[vid]) {
    db.query("UPDATE users SET verified = 1 WHERE id = ?", [verifyingData[vid]], function (err, ress) {
      if (err) return exit()
      verifyingData[vid] = null
      res.sendFile(path.join(__dirname, 'public/succes.html'))
    })
  } else return exit()
})

app.post("/requestForgotPassword", function (req, res) {
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  if (!req.body.email) return exit()
  db.query("SELECT id FROM users WHERE email = ?", [req.body.email], async function (err, ress) {
    if (err) return exit()
    if (!ress[0].id) return exit()
    const uid = ress[0].id
    const vid = cfg["funcs"]["requestSalt"](64)

    verifyingData[vid] = uid

    const mail = req.body.email
    const response = await emailfuncs.reset(mail, vid)
    if (response) {
      res.sendFile(path.join(__dirname, 'public/succes.html'))
      setTimeout(() => {
        verifyingData[vid] = null
        return
      }, 5 * 60 * 1000);
    }
  })
})

app.get("/resetPass", function (req, res) {
  const vid = req.query.verifyid
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  if (!vid) return exit()
  if (!verifyingData[vid]) return exit()
  res.sendFile(path.join(__dirname, 'public/resetpass.html'))
})

app.post("/confirmResetPass", function (req, res) {
  const data = req.body
  const exit = function () { return res.sendFile(path.join(__dirname, 'public/error.html')) }
  if (!data.vid || !data.pass) return exit()
  if (!verifyingData[data.vid]) return exit()
  db.query("UPDATE users SET password = ? WHERE id = ?", [data.pass, verifyingData[data.vid]], function (err, ress) {
    if (err) return exit()
    verifyingData[data.vid] = null
    return res.sendFile(path.join(__dirname, "public/succes.html"))
  })
})

app.post("/payment", function (req, res) {
  const data = req.body;

  const exit = function (err) {
    if (err) {
      return res.status(500).json({ message: err });
    } else {
      return res.sendStatus(500);
    }
  };

  const cookie = req.cookies.connection;
  if (!cookie) return exit("Trebuie să fiți logat");

  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie);
  if (!logged) return exit("Trebuie să fiți logat");

  const datestring = cfg["funcs"]["getDateFormated"]();
  db.query("INSERT INTO donations (uid, provider, sum, currency, date) VALUES (?, ?, ?, ?, ?)",
    [uid, data.method, data.value, data.currency, datestring], function (err, ress) {
      if (err) return exit("Eroare la inserarea donației în baza de date");
      return res.sendStatus(200);
    });
});


app.post("/requestUser", function (req, res) {
  const data = req.body
  const exit = function () { return res.sendStatus(500) }
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  if (!admins[uid]) return exit()
  if (admins[uid] < 2) return exit()
  if (typeof data.query === "string") {
    if (data.query.includes("@")) {
      db.query("SELECT * FROM users WHERE email = ?", [data.query], function (err, ress) {
        if (err) return exit()
        const user = ress[0]
        if (user) {
          user.image = `${domain}/uploads/${user.image}`
          return res.json({ data: ress })
        }
      })
    } else {
      db.query("SELECT * FROM users WHERE firstname = ?", [data.query], function (err, ress) {
        if (err) return exit()
        if (!ress[0]) {
          db.query("SELECT * FROM users WHERE lastname = ?", [data.query], function (err, ress) {
            if (err) return exit()
            ress.map((user) => user.image = `${domain}/uploads/${user.image}`)
            return res.json({ data: ress })
          })
        } else {
          ress.map((user) => user.image = `${domain}/uploads/${user.image}`)
          return res.json({ data: ress })
        }
      })
    }
  } else {
    db.query("SELECT * FROM users WHERE id = ?", [data.query], function (err, ress) {
      if (err) return exit()
      ress.map((user) => user.image = `${domain}/uploads/${user.image}`)
      return res.json({ data: ress })
    })
  }
})

app.post("/setAdmin", function (req, res) {
  const data = req.body
  const exit = function (err) {
    if (err) return res.status(500).json({ message: err })
    else return res.sendStatus(500)
  }
  const cookie = req.cookies.connection
  if (!cookie) return exit("Trebuie să fiți logat.")
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit("Trebuie să fiți logat.")
  if (!admins[uid]) return exit("Trebuie să fii admin.")
  if (admins[uid] < 2) return exit("Acces interis la acest grad.")
  if (uid === data.tid) return exit("Nu poți seta rankul de admin pentru tine.")
  if (data.tid == 1) return exit("Nu poți seta rankul de admin pentru tine.")
  admins[data.tid] = data.alevel
  TriggerClientEvent(data.tid, "notify", "Rankul tău de Admin a fost setat la " + data.alevel + " !")
  db.query("UPDATE users SET admin = ? WHERE id = ?", [data.alevel, data.tid], function (err, ress) {
    if (err) return exit()
    res.sendStatus(200)
    sendToLogs("admin", "Setarea rankului de admin TID: " + data.tid + " la " + data.alevel + " a fost efectuata de catre ID: " + uid)
  })
})

app.post("/requestLogs", function (req, res) {
  const exit = function (err) {
    if (err) {
      return res.status(500).json({ message: err });
    } else return res.sendStatus(500);
  }
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit("Trebuie să fiți logat.")
  if (!admins[uid]) return exit("Trebuie să fii admin.")
  if (admins[uid] < 2) return exit("Acces interis la acest grad.")
  const log = req.body.log
  if (!log) return exit("Nu ai acces la acest grad.")
  db.query("SELECT * FROM logs WHERE type = ? ORDER BY id DESC", [log], function (err, ress) {
    if (err) return exit("Eroare la preluarea logurilor.")
    return res.json({ data: ress })
  })
})

app.post("/requestDogsUnverified", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  const cookie = req.cookies.connection
  if (!cookie) return exit()
  const [logged, uid] = cfg["funcs"]["validateCookie"](cookie)
  if (!logged) return exit()
  if (!admins[uid]) return exit()
  db.query("SELECT * FROM dogs WHERE verified <>1", function (err, ress) {
    if (err) return exit()
    ress = ress.map(function (dog) {
      dog.image = `${domain}/uploads/${dog.image}`
      return dog
    })
    res.json({ data: ress })
  })
})

var currencies = {}

app.post("/convertCurrency", function (req, res) {
  const data = req.body
  const exit = function () { return res.sendStatus(500) }
  if (!data.currency) return exit()
  if (currencies[data.currency]) return res.json({ data: currencies[data.currency] })
  request(`https://v6.exchangerate-api.com/v6/377434c104103fe09cc5ad09/latest/${data.currency}`, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      console.succes("PAWPY CURRENCY", "Succesfully converted currency " + data.currency)
      body = JSON.parse(body)
      currencies[data.currency] = body
      res.json({ data: body })
    } else return exit()
  })
})

app.post("/requestWorkers", function (req, res) {
  const exit = function () { return res.sendStatus(500) }
  db.query("SELECT * FROM workers", function (err, ress) {
    if (err) return exit()
    ress = ress.map(function (worker) {
      worker.image = `${domain}/uploads/${worker.image}`
      return worker
    })
    return res.json({ data: ress })
  })
})

server.listen(port, function () { console.succes("PAWPY PORT", `Succesfully listening on PORT ( ${port} )`) })