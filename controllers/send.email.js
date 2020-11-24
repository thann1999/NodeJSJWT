const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const cryptoRandomString = require('crypto-random-string')

function sendEmail(email) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.TRANSPORT_EMAIL,
      pass: process.env.TRANSPORT_PASSWORD,
    },
  });
  const random = cryptoRandomString({length: 6, type: 'numeric'})
  const code = jwt.sign({ token: random }, process.env.TRANSPORT_TOKEN, {
    expiresIn: "10m",
  });
  const url = `${process.env.CLIENT_URL}/activate/${code}`;
  const mailOptions = {
    from: process.env.TRANSPORT_EMAIL,
    to: email,
    subject: "<Data World> Xác thực email",
    html: `
        <h2>Chào mừng bạn đến với Data World. Mã kích hoạt của bạn là: </h2>
        <p>${code}</p>
        <p>Mã kích hoạt sẽ hết hạn sau 10 phút. Vui lòng không reply email này.</p> `,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = { sendEmail: sendEmail };
