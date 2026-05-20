const login = require('./login');

function auth(router, db) {
	// Авторизация
	router.post('/auth/login', login(db));
}

module.exports = auth;
