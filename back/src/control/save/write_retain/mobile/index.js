const { data: store } = require('@store')
const section = require('./section')
const automode = require('./automode')
const start = require('./start')
const product = require('./product')
const sensor = require('./sensor')
const setting = require('./setting')
const cb = {
	// Авторежимы склада

	// Ввод/вывод из работы ВНО

	// Режимы секции
	
	// Продукт

	// Датчики

	// Настройки

	// Вкл/выкл склад

	section,
	automode,
	start,
	product,
	sensor,
	setting,
}

function fnMobile(result) {
	console.log(4102, store.mobile)
	for (const code in store.mobile) {
		if (cb?.[code]) cb[code](store.mobile[code], result)
	}
	// Очистить аккумулятор
	store.mobile = {}
}

// 8. Режимы секции
// 9. Авторежимы склада
// 10. Вкл/выкл склад
// 11. Продукт
// 12. Датчики
// 13. Настройки

module.exports = fnWeb
