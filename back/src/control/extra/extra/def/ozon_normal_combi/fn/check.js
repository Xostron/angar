const { arrCtrlDO } = require('@tool/command/module_output')
const { data: store } = require('@store')
const soft = require('@tool/smoking_ozon/soft')
const { delExtra, wrExtra } = require('@tool/message/extra')

/**
 * Проверка готовности озонатора
 * @param {*} bld
 * @param {*} s
 * @param {*} prepare
 * @returns true - все ок
 */
function checkReady(bld, s, prepare) {
	const { oacc, oz, fanA, fan, accelMode, stg, idsS } = prepare
	// Выключение озонации и очистка аккумуляторов, склад остается выключенным
	// 1. Если Окуривание включено
	// 2. Озонатор не готов И включен оператором И еще не начал работу по таймеру
	if (s?.smoking?.on || (!oz.ready && stg?.on && !oacc.work)) {
		// Выключение озонации в настройках retain
		store.retain[bld._id].setting ??= {}
		store.retain[bld._id].setting.ozon ??= {}
		store.retain[bld._id].setting.ozon.on = false
		// Очистка аккумуляторов
		clear(bld._id, oacc)
		// Выкл озонатора
		arrCtrlDO(bld._id, oz.arr, 'off')
		return false
	}
	return true
}

/**
 * Запрет работы озонатора: нет настроек, озонация выкл, склад вкл
 * @param {*} bld
 * @param {*} obj
 * @param {*} s
 * @param {*} prepare
 * @returns true - все ок
 */
function checkOn(bld, obj, s, prepare) {
	const { oacc, oz, fanA, fan, accelMode, stg, idsS } = prepare
	if (!stg || !stg?.on) {
		clear(bld._id, oacc)
		// Если режим разгонных ВНО не ВКЛ - то блокируем выключение
		if (accelMode !== 'on') arrCtrlDO(bld._id, fanA, 'off')
		soft(bld._id, idsS, fan, obj, s, false)
		arrCtrlDO(bld._id, oz.arr, 'off')
		return false
	}
	return true
}

module.exports = { checkReady, checkOn }

/**
 * Очистка аккумуляторов и сообщений
 * @param {*} idB
 * @param {*} doc
 * @param {*} mod
 * @returns
 */
function clear(idB, doc, mod = null) {
	// Удаляем аккумулятор плавного пуска по завершению окуривания
	delete store?.heap?.ozon
	delExtra(idB, null, 'ozon1')
	delExtra(idB, null, 'ozon2')
	if (mod === null) {
		// Нормальное окончание озонирования
		// при null - происходит запись в retain (склад вкл, озонация выкл)
		doc.work = null
		doc.wait = null
		return
	}
	// при undefined - запись в retain не осуществляется
	// необходимо если озонаторы не готовы или она была выключена в настройках
	delete doc.work
	delete doc.wait
}
