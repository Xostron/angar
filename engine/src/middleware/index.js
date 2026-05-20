module.exports = function (req, res, next) {
	// Проверка авторизации
	// passport.authenticate('jwt', { session: false });
	console.log('req.headers', req.headers);
};
