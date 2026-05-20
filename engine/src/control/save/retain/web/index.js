const { data: store } = require('@store')
const s_auto_mode = require('./s_auto_mode')
const s_fan = require('./s_fan')
const s_mode = require('./s_mode')
const s_product = require('./s_product')
const s_sens = require('./s_sens')
const s_setting_au = require('./s_setting_au')
const s_start = require('./s_start')

const cb = {
	// Авторежимы склада
	s_auto_mode,
	// Ввод/вывод из работы ВНО
	s_fan,
	// Режимы секции
	s_mode,
	// Продукт
	s_product,
	// Датчики
	s_sens,
	// Настройки
	s_setting_au,
	// Вкл/выкл склад
	s_start,
}

function fnWeb() {
	for (const code in store.web) {
		if (cb?.[code]) cb[code](store.web[code], store.retain)
	}
	// Очистить аккумулятор
	store.web = {}
}

module.exports = fnWeb
