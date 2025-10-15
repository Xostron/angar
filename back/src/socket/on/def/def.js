const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const s_auto_mode = require('./s_auto_mode')
const s_fan = require('./s_fan')
const s_mode = require('./s_mode')
const s_product = require('./s_product')
const s_sens = require('./s_sens')
const s_setting_au = require('./s_setting_au')
const { data: store } = require('@store')

const cb = {
	s_auto_mode,
	s_fan,
	s_mode,
	s_product,
	s_sens,
	s_setting_au,
}

function fn(code) {
	return function (io, socket) {
		socket.on(code, async (obj, callback) => {
			// Создать или сохранить изменения в json
			await createAndModifySync(obj, 'data', retainDir, cb[code])
			console.log('web: Настройки сохранены', code)
			store.web ??= {}
			store.web[code] = { ...store.web[code], ...obj }
		})
	}
}

module.exports = fn
