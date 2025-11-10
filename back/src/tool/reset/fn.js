const { data: store } = require('@store')
const { delDebMdl } = require('@tool/message/plc_module')

/**
 * Очистить аварийные сообщения по складу (extralrm) и аварии модулей
 * Информационные сообщения, аварии авторежима - не сбрасываются
 */
function clearAlarm() {
	// По складу: на каком складе была нажата кнопка сброса аварии
	store.reset.forEach((idB) => {
		// Очистка сообщений неисправности модулей
		store.alarm.module[idB] = {}
		delDebMdl()
		// Очистка аварийных сообщений extralrm
		store.alarm ??= {}
		store.alarm.extralrm ??= {}
		store.alarm.extralrm[idB] = {}
		// Очистка аккумуляторов extralrm для того чтобы они не блокировали работу
		const acc = store.acc?.[idB]
		clearAcc(acc, ['stableVno'])
	})
}

/**
 * Рекурсивная очистка аккумулятора склада store.acc[idB]
 * 1. Сброс ключ-значение _alarm (флаги _alarm используются в extralrm для фиксации срабатывания аварии)
 * 2. Сброс ключ-объектов, ключи перечислены в массиве arr (некоторые аккумуляторы, необходимо полностью сбрасывать
 * при сбросе аварии, чтобы обнулить данные зафиксировавшие аварию, и начать слежение заново)
 *
 * @param {object} acc Аккумулятор склада store.acc[idB] (мутирование)
 * @param {string[]} arr Список ключей-объектов которые необходимо обнулить при наличии в нем аварии
 * @param {string} pKey Ключ вложенного аккумулятора родителя (для выполнения п.2)
 * @param {object} pAcc Аккумулятор родитель, acc (вложенный) текущий объект аккумулятор (для выполнения п.2)
 */
function clearAcc(acc, arr, pKey, pAcc) {
	console.log('ENTER')
	// Проверка текущий объект из списка arr? если ключ _alarm=true у данного
	// объекта -> обнуляем данный объект, иначе не трогаем
	if (pKey && arr.includes(pKey)) {
		if (acc._alarm === true) {
			console.log('обнуляем данный объект', pKey, 'так как acc._alarm=true', pAcc[pKey])
			delete pAcc[pKey]
		} else {
			console.log('Не трогаем данный объект', pKey, 'так как acc._alarm=false')
		}
		return
	}
	// Текущий объект не из списка arr
	// По ключам аккумулятора
	for (const key in acc) {
		// Ключ - значение
		if (typeof acc[key] !== 'object') {
			console.log('Ключ-значение', key)
			if (key === '_alarm') console.log('\t найден _alarm', acc[key])
			key === '_alarm' ? (acc[key] = false) : null
			continue
		}
		console.log('Ключ-объект', key)
		// Ключ - объект
		clearAcc(acc[key], arr, key, acc)
	}
}

module.exports = clearAlarm
