
const nodemailer = require("nodemailer");
require("dotenv").config(); 

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,      // Dummy Gmail
        pass: process.env.EMAIL_PASS,       // App password
    }
});

function sendOTP(toEmail, otp) {
    const mailOptions = {
        from: `"EduPredict" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Your OTP for EduPredict",
        text: `Your OTP is: ${otp}`
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) reject(err);
            else resolve(info.response);
        });
    });
}

module.exports = sendOTP;
