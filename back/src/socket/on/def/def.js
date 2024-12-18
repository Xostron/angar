const { retainDir } = require('@store')
const { createAndModifySync } = require('@tool/json')
const s_auto_mode = require('./s_auto_mode')
const s_fan = require('./s_fan')
const s_mode = require('./s_mode')
const s_product = require('./s_product')
const s_sens = require('./s_sens')
const s_setting_au = require('./s_setting_au')

const cb = {
	s_auto_mode,
	s_fan,
	s_mode,
	s_product,
	s_sens,
	s_setting_au
}

function fn(code) {
    return function (io, socket) {
        socket.on(code, (obj, callback) => {
			// Создать или сохранить изменения в json
			createAndModifySync(obj, 'data', retainDir, cb[code])
		})
	}
}

module.exports = fn
