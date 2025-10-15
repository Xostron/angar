const { data: store } = require('@store')
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
	s_setting_au,
}

function fnWeb(result) {
	console.log(4101, store.web)
	for (const code in store.web) {
		if (cb?.[code]) cb[code](store.web[code], result)
	}
	// Очистить аккумулятор
	// store.web = {}
}

// 8. Режимы секции
// 9. Авторежимы склада
// 10. Вкл/выкл склад
// 11. Продукт
// 12. Датчики
// 13. Настройки

module.exports = fnWeb
