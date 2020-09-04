import jsonwebtoken from "jsonwebtoken";
import CONFIG from "../../config/config";

const secret = CONFIG.jwtSecret;
const authService = () => {
	const issue = payload =>
		jsonwebtoken.sign({ data: payload }, secret, {
			expiresIn: CONFIG.jwtTokenExpire
		});

	const verify = (token, cb) => jsonwebtoken.verify(token, secret, cb);

	const decode = token => jsonwebtoken.decode(token);

	return {
		issue,
		verify,
		decode
	};
};

export default authService();
