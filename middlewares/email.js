const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "datawiztech00@gmail.com",
    pass: "vkdg dupo mlkn llxc",
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

function MailSending(options) {
  const mailOptions = {
    from: "datawiztech@gmail.com",
    to: options.email,
    subject: options.subject,
    // text: options.text,
    html: options.message,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error.message);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
}

module.exports = { MailSending };
