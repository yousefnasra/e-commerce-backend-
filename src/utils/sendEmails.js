import nodemailer from "nodemailer"
export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    //sender
    const tarnsporter = nodemailer.createTransport({
        host: "localhost",
        service: "gmail",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASS,
        },
        tls: { rejectUnauthorized: false },
    });

    //recevier
    let info;
    if (html) {
        info = await tarnsporter.sendMail({
            from: `"E-commerce Application" <${process.env.EMAIL}>`,
            to,
            subject,
            html,
        });
    } else {
        info = await tarnsporter.sendMail({
            from: `"E-commerce Application" <${process.env.EMAIL}>`,
            to,
            subject,
            attachments,
        });
    }

    if (info.rejected.length > 0) return false;
    return true;
}