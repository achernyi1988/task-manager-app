const sgMail = require('@sendgrid/mail');
const { log, log_err, log_warn } = require("../../utils/logs")

const apiKey = 

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {
   sgMail.send({
      to: email,
      from: "stockidea2020@gmail.com",
      subject: "Thanks for joining in",
      text: `Welcome to the app, ${name}. Let me know how you get alone with the app. `
   }).catch((err) => {
      log_err(err)
   })

}

const sendGoodBuyEmail = (email, name) => {
   sgMail.send({
      to: email,
      from: "stockidea2020@gmail.com",
      subject: "Farewell message",
      text: `Good-bye, ${name}. Is there anything we can do to keep you on board? `
   }).catch((err) => {
      log_err(err)
   })

}


module.exports = {
   sendWelcomeEmail,
   sendGoodBuyEmail
}
// sgMail.send({
//    to: "stockidea2020@gmail.com",
//    from: "stockidea2020@gmail.com",
//    subject: "write a code",
//    text: "we are here"
// })