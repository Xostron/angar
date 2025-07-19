const login = require('./login');
// const logout = require('./logout');
// const refresh = require('./refresh');
// const reset = require('./reset');

function auth(router, db) {
	// Авторизация
	// router.get('/auth/refresh', refresh(db));
	// router.post('/auth/refresh', refresh(db));
	// router.post('/auth/logout', logout(db));
	router.post('/auth/login', login(db));
	// router.patch('/auth/reset', reset(db));
}

module.exports = auth;
