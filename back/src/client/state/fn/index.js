const { data: store, dataDir, stateDir, retainDir } = require('@store')
const { readTO, readOne } = require('@tool/json')
const fsp = require('fs').promises

/**
 *
 * @returns {object}	data - Рама,
 * 						value - Акутальные значения+retain,
 * 						ref - state.json Мясо (показания датчиков и т.д.)
 * 							опорный объект для вычисления delta изменений,
 * 						poll: {init:Date, last:Date} init - данные в state.json актуальны,
 * 							last краняя передача данных прошла успешна
 */
async function preparing() {
	// Рама
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	// const retain = await readOne('data.json', retainDir)
	const data = await readTO(files)
	// data.retain = retain
	// console.log(data)
	let ref

	// Режим опроса POS-AdminServer активен - true? (переключатель на PC)
	const isPoll = data?.pc?.poll || true
	if (!isPoll) return null

	// TODO Режим опроса: старый вариант /  новый вариант POS-admin
	// TODO Период опроса для каждого склада свой период / для POS (все склады одновременно)

	// Начальные данные из файла (основа для формирования delta изменений)
	if (store?.poll?.init) ref = await readOne('state.json', stateDir)

	// Актуальные значения с датчиков и оборудования
	const value = store.value

	// Последний опрос: true - успешен, false - Не успешен(сервер был перезапущен, ошибка сервера pos)

	return { data, value, ref, poll: store.poll }
}

module.exports = { preparing }
