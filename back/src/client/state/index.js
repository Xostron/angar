const { data: store, dataDir, stateDir, retainDir } = require('@store')
const { delay } = require('@tool/command/time')
const { readTO, readOne } = require('@tool/json')
const fsp = require('fs').promises
const transformPC = require('@routes/api/tenta/read/pc/transform')

async function state() {
	try {
		const o = await collect()
		if (!o) return

		// Формирования delta для каждого склада
		// delta изменений - передается на сервер Админки и сохраняется в ref
		// for (const bld of o.data.building) {
		// console.log(66, bld.type)
		const delta = def.cold(o, null)
		// }

		console.log(661, delta)
		// Данные переданы
		return true
	} catch (error) {
		console.error(666666, error)
	}
}

const def = {
	normal(o, bld, delta) {
		const { data, value, ref, last } = o
		const { retain, alarm, total } = value
		const { section } = data
	},
	cold(o, bld, ) {
		const { data, value, ref, last } = o
		const { section } = data
		return transformPC(data, data.building)
	},
	combi(o, bld, delta) {
		const { data, value, ref, last } = o
	},
}

async function collect() {
	// Рама
	const files = (await fsp.readdir(dataDir)).filter((el) => el.includes('json'))
	const retain = await readOne('data.json', retainDir)
	const data = await readTO(files)
	data.retain = retain
	// console.log(data)
	let ref

	// Режим опроса POS-AdminServer активен - true?
	const isPoll = data?.pc?.poll || true
	if (!isPoll) return null

	// TODO Режим опроса: старый вариант /  новый вариант POS-admin
	// TODO Период опроса для каждого склада свой период / для POS (все склады одновременно)

	// Начальные данные из файла (основа для формирования delta изменений)
	if (store?.poll?.init) ref = await readOne('state.json', stateDir)

	// Актуальные значения с датчиков и оборудования
	const value = store.value

	// Последний опрос: true - успешен, false - Не успешен(сервер был перезапущен, ошибка сервера pos)
	let last = store?.poll?.last
	return { data, value, ref, last }
}

async function loopState() {
	while (true) {
		state()
			.then((ok) =>
				ok
					? console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll - данные POS переданы на сервер ')
					: console.log('\x1b[33m%s\x1b[0m', 'Режим опроса: Poll отключен')
			)
			.catch((err) => {
				// TODO Фиксировать не переданный state
			})
		// отправка состояния каждые 5 минут
		await delay(process.env?.PERIOD_STATE ?? 10000)
	}
}

module.exports = loopState
