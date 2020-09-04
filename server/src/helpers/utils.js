const _ = require("lodash");
const nodemailer = require("nodemailer");

const utils = () => {
	const getValuesByKey = (dataObj, index) => _.map(dataObj, index);

	const getReqValues = req => _.pickBy(_.extend(req.body, req.params, req.query), _.identity);

	const checkValidJSON = str => {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	};

	const getRandomOTP = () => {
		return Math.floor(1000 + Math.random() * 9000);
	};

	const mailOptions = () => (function(mails, message, subject) {
		const userAdminEmail = process.env.SMTP_EMAIL;
		const userAdminPassword = process.env.SMTP_PWD;
		const smtpTransport = nodemailer.createTransport({
			service: "gmail",
			host: "smtp.gmail.com",
			auth: {
				user: userAdminEmail,
				pass: userAdminPassword
			}
		});

		const maillist = mails;
		const msg = {
			from: "******",
			subject,

			// text: message,
			cc: "*******",
			html: message // html body
		};

		maillist.forEach((to, i, array) => {
			msg.to = to;
			smtpTransport.sendMail(msg, err => {
				if (err) {
					console.log("Email error");
					console.log(`Sending to ${to} failed: ${err}`);
					return;
				}
				console.log(`Sent to ${to}`);

				if (i === maillist.length - 1) {
					msg.transport.close();
				}
			});
		});
	});

	return {
		getValuesByKey,
		getReqValues,
		checkValidJSON,
		getRandomOTP,
		mailOptions
	};
};

export default utils;
