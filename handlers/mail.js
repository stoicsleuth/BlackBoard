const nodemailer= require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText= require('html-to-text');
const promisify= require('es6-promisify');

const transport= nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

const generateHTML = (filename, options) =>{
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
    const inlinedHTML=juice(html);
    return inlinedHTML;
};

exports.send = async(options) =>{
    const html = generateHTML(options.filename, options);
    const text=htmlToText.fromString(html);
    const mailOptions={
        from: 'BlackBoard<noreply@blackboard.com>',
        to: options.user.email,
        subject: options.subject,
        html,
        text
    };
    const sendEmail = promisify(transport.sendMail, transport);
    return sendEmail(mailOptions);

};