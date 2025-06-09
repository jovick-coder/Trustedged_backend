const { MailtrapClient } = require("mailtrap");
require("dotenv").config();

const client = new MailtrapClient({ token: process.env.MAILTRAP_API_TOKEN });

const sender = {
  email: process.env.MAILTRAP_SENDER_EMAIL,
  name: "Nexas Bank",
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await client.send({
      from: sender,
      to: [{ email: to }],
      subject,
      html: htmlContent,
      category: "Banking Notifications",
    });

    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error.message);
    return false;
  }
};

module.exports = sendEmail;
