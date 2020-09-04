const bcrypt = require("bcrypt");
const saltRounds = 10;

const bcryptService = () => {
	const password = pass => {
		const salt = bcrypt.genSaltSync(saltRounds);
		const hash = bcrypt.hashSync(pass, salt);

		return hash;
	};

	const comparePassword = (pw, hash) => bcrypt.compareSync(pw, hash);

	const updatePassword = pass => {
		const salt = bcrypt.genSaltSync(saltRounds);
		const hash = bcrypt.hashSync(pass, salt);
		return hash;
	};

	return {
		password,
		comparePassword,
		updatePassword
	};
};

export default bcryptService;
