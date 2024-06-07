const { promisify } = require('util');
const fs = require('fs');
const readFileAsync = promisify(fs.readFile);
const domain = "http://192.168.100.13:1611"
var nodemailer = require('nodemailer');
var templates = {}
const loadTemplates = async () => {
  templates['register'] = await readFileAsync("./templates/register.html", 'utf-8')
  console.succes("EMAILS", "Templates loaded")
}
console.succes = function (type, string) {
  if (!type || !string) return
  console.log("\x1b[32m%s\x1b[0m", `[${type}]`, string);
}

loadTemplates()

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'admin@pawpy.website',
    pass: 'aqce ggbs ijfn wafz'
  }
});

const send = {
  verify: function(email, vid) {
    return new Promise(function(resolve, reject){
      const mailOptions = {
        from: 'admin@pawpy.website',
        to: email,
        subject: 'Link pentru confirmarea emailului!',
        html: `
        <strong>Intră pe linkul de mai jos pentru a confirma adresa de email!</strong>
        <a href="${domain}/verify?verifyid=${vid}" target="_blank">Verifică</a>\n`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return reject()
        } else {
          console.log('Email sent: ' + info.response);
          return resolve(true)
        }
      });
    })
  },
  reset: function(email, vid) {
    return new Promise(function(resolve, reject){
      const mailOptions = {
        from: 'admin@pawpy.website',
        to: email,
        subject: 'Link pentru resetarea parolei!',
        text: `Intră pe linkul de mai jos pentru a schimba parola!
        ${domain}/resetPass?verifyid=${vid}
        `
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          return reject()
        } else {
          console.log('Email sent: ' + info.response);
          return resolve(true)
        }
      });
    })
  },
  register: function(email, firstname, lastname) {
    if (!email || !firstname || !lastname) return
    const mailOptions = {
      from: 'admin@pawpy.website',
      to: email,
      subject: 'Ai creat un cont pe Pawpy!',
      html: `
      Bună ziua și bun venit în comunitatea Pawpy!<br><br>

      Suntem extrem de bucuroși că te-ai alăturat familiei noastre și că împărtășim aceeași dragoste pentru câini. Fiecare înscriere aduce un zâmbet pe fețele câinilor noștri și o speranță în plus pentru găsirea unui cămin iubitor.<br><br>

      Îți mulțumim că ești alături de noi în această misiune de a oferi o viață mai bună prietenilor noștri blănoși. Te invităm să explorezi site-ul nostru pentru a descoperi cum poți ajuta și cum poți face parte din poveștile fericite de adopție.<br><br>

      Cu prietenie și multe lăbuțe,<br><br>
      Echipa Pawpy 🐾<br><br>

      PS: Dacă ai întrebări sau dorești să afli mai multe despre cum poți contribui, nu ezita să ne contactezi. Suntem aici pentru tine și pentru câinii noștri!<br><br>
      <img src="cid:welcomer">
      `,
      attachments: [{
        filename: 'welcome.png',
        path: './public/uploads/welcome.png',
        cid: 'welcomer'
      }]
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  },
  sendAll: function(emails) {
    emails.forEach(email => {
      const mailOptions = {
        from: 'admin@pawpy.website',
        to: email,
        subject: 'A fost adăugat un nou cățeluș pe Pawpy!',
        text: `A fost adăugat un cățeluș nou pe pawpy.website!`
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    });
  },
  deleteUser: function(email, salt, firstname) {
    const mailOptions = {
      from: 'admin@pawpy.website',
      to: email,
      subject: 'Ne pare rău că pleci!',
      html: `
      Dragă ${firstname}, <br><br>

      Ne pare rău să te vedem plecând și dorim să îți mulțumim pentru timpul petrecut alături de noi la Pawpy. Contul tău a fost șters cu succes. Sperăm că experiența ta pe site-ul nostru a fost plăcută și îți suntem recunoscători pentru sprijinul acordat adăpostului nostru de câini.<br><br>

      Dacă ai orice întrebări sau nelămuriri, nu ezita să ne contactezi. Ușa noastră va fi întotdeauna deschisă pentru tine, iar noi vom continua să lucrăm din greu pentru bunăstarea animalelor noastre dragi.<br><br>

      Cu sinceritate,<br><br>
      Echipa Pawpy<br><br>
      Pentru a continua, te rugăm să apeși <a href="${domain}/delete?q=${salt}">aici</a>! <br><br>
      <img src="cid:bye">`,
      
      attachments: [{
        filename: 'bye.png',
        path: './public/uploads/bye.png',
        cid: 'bye'
      }]

    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}

module.exports = send