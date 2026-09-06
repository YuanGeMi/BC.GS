import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "mail.bc.gs",
  port: 465,
  secure: true,
  auth: {
    user: "register@bc.gs",
    pass: "Aa112211=*",
  },
  logger: true,
  debug: true,
});

try {
  const verified = await transporter.verify();
  console.log("verify():", verified);

  const info = await transporter.sendMail({
    from: "register@bc.gs",
    to: "vitorlopes079@gmail.com",
    subject: "SMTP test",
    text: "This is a test.",
  });

  console.log("sendMail() result:");
  console.log(JSON.stringify(info, null, 2));
} catch (error) {
  console.error("SMTP test failed");
  console.error("name:", error?.name);
  console.error("message:", error?.message);
  console.error("code:", error?.code);
  console.error("command:", error?.command);
  console.error("response:", error?.response);
  console.error("responseCode:", error?.responseCode);
  console.error("stack:", error?.stack);
  process.exitCode = 1;
}
