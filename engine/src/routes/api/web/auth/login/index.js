const jwt = require('jsonwebtoken')
const users = {
	root: {
		id: 1,
		pwd: '3750',
		fio: 'Сервис',
		role: ['root'],
	},
	admin: {
		id: 2,
		pwd: '9988',
		fio: 'Админ',
		role: ['admin'],
	},
	emp: {
		id: 3,
		pwd: '1242',
		fio: 'Сотрудник',
		role: ['employee'],
	},
}

/**
 *
 * @returns
 */
function login() {
	return function (req, res, next) {
		const { login, password } = req?.body
		console.log('login, password', login, password)

		if (users[login] && password === users[login].pwd) {
			console.log('authentication OK')
			const payload = users[login]
			payload.login = login

			const access = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
				expiresIn: process.env.ACCESSS_EXPIRE,
			})
			const refresh = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
				expiresIn: process.env.REFRESH_EXPIRE,
			})

			res.json({ access, refresh, name:users[login].fio })
		} else {
			console.log('wrong credentials')
			res.status(401).end()
		}
	}
}

module.exports = login
