const { data: store } = require('@store')
const automode = require('./automode')
const fan = require('./fan')
const section = require('./section')
const product = require('./product')
const sensor = require('./sensor')
const setting = require('./setting')
const start = require('./start')

const cb = {
	// Авторежимы склада
	automode,
	// Ввод/вывод из работы ВНО
	fan,
	// Режимы секции
	section,
	// Продукт
	product,
	// Датчики
	sensor,
	// Настройки
	setting,
	// Вкл/выкл склад + доп настройки
	start,
}

function fnMobile(result) {
	// console.log(4102, 'mobile', store.mobile)
	for (const code in store.mobile) {
		if (cb?.[code]) cb[code](store.mobile[code], result)
	}
	// Очистить аккумулятор
	store.mobile = {}
}

module.exports = fnMobile
