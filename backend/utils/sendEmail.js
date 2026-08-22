import nodemailer from 'nodemailer';

const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'انتخابات پورٹل - OTP تصدیقی کوڈ',
    text: `آپ کا OTP کوڈ ہے: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;