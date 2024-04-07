import nodemailer from 'nodemailer';



const sendEmail = async (email, link) => {
    try {
        //  create transporter
        const transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: process.env.NODEMAILER_PORT,
            secure: process.env.NODEMAILER_SECURE,
            service: process.env.NODEMAILER_SERVICE,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
            },
            tls: { rejectUnauthorized: false },
        });

        const info = {
        from: process.env.NODEMAILER_EMAIL,
        to: email,
        subject: 'Email verification',
        html: `
        <div>
        <h1>Thank you for registering on our website.</h1>
        <a href=${link}>Click here to verify your email</a>
        </div>
        `,
        };

        await transporter.sendMail(info)

        // await transporter.sendMail(info)

  } catch (error) {
    console.log(error);
  }
};

export { sendEmail };
