const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const { out, ao, force } = require('./index')
const { hasOutput } = require('@tool/get/module')

// Блокировки напорных вентиляторов (обычный склад)
// Если склад выключен, а секция в ручном режиме - не блокировать ВНО
function fan(obj, s) {
	const { value, data, retain, output } = obj
	const once = {}
	// Только по ВНО секциям
	for (const f of data.fan) {
		f.isGroup = isGroup(f, data.fan)
		// Только для напорных ВНО type=fan
		if (f.type !== 'fan') continue
		// Если ВНО испарителя - не блокируем
		if (f.owner.type === 'cooler') continue
		// Если не найден модуль дискретного выхода - не блокируем
		const idM = f?.module?.id
		if (!hasOutput(output, idM)) continue

		// Id cклада
		const idB = getIdB(idM, data.module)
		// Склад
		const bld = data.building.find((el) => el._id == idB)
		// Тип склада: комби-холодильник
		const isCC = isCombiCold(bld, retain?.[idB]?.automode, s)
		// Массив ИД секций склада
		const idsS = getIdsS(obj.data.section, idB)
		// Режим секции текущего ВНО
		const mode = retain?.[idB]?.mode?.[f.owner.id]
		// ПУСК ВНО в ручном режиме
		const man = obj?.value?.[f._id]?.man
		// Игнор блокировки: включено окуривание, озонатор,
		const ignore = s[idB]?.smoking?.on || s[idB]?.ozon?.on || man

		// Разрешить блокировку ВНО по выводу из работы
		const permissionOff = ignoreGroupe(f, data.fan, value)

		// Блокировки:
		// Авария питания: сигнал склада/секций (supply), батарея (battery), Авария питания.ручной сброс (sb)
		const sb =
			// isExtralrm(bld._id, null, 'supply') ||
			// idsS.some((idS) => isExtralrm(bld._id, idS, 'supply')) ||
			// isExtralrm(bld._id, null, 'battery') ||
			isExtralrm(bld._id, null, 'sb')

		// Состояние вентилятора: авария
		const isAlrOff = value?.[f._id]?.state === 'alarm' ? true : false
		// Выведен из работы
		const fanOff = value?.[f._id]?.state === 'off' ? true : false
		// Переключатель на щите (aCmd.end - флаг о плавном останове вентиляторов)
		const local =
			isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') && !store.aCmd?.[f.owner.id]?.fan?.end

		// Секция выключена (null)
		let offS = (retain?.[idB]?.mode?.[f.owner.id] ?? null) === null && !ignore

		// Склад выключен и секция в авторежиме
		const lockAuto = !retain?.[idB]?.start && retain?.[idB]?.mode?.[f.owner.id] && !ignore

		// Кнопка выключения склада (сигнал)
		const bldOff = isExtralrm(idB, null, 'bldOff')

		// Низкая температура канала в авто: aLowB (склад), aLow (секции)
		const aLowB = isExtralrm(idB, null, 'alrClosed') && mode === true
		const aLow = idsS.some(
			(idS) =>
				isExtralrm(idB, idS, 'alrClosed') && (mode === true || mode === undefined) && !isCC,
		)

		// Низкая температура канала в ручном режиме: Однократная блокировка ВНО
		// для обычного и комби-обычного
		const lowB =
			isExtralrm(idB, null, 'alrClosed') &&
			mode === false &&
			!store.heap.lock?.[idB]?.low &&
			!isCC
		const low = idsS.some(
			(idS) =>
				isExtralrm(idB, idS, 'alrClosed') &&
				mode === false &&
				!store.heap.lock?.[idS]?.low &&
				!isCC,
		)
		// Массив однократных блокировок, список блокировок [Низкая температура канала в ручном режиме]
		once[idB] = lowB
		idsS.forEach((idS) => (once[idS] = low))

		if (local && man) {
			force(obj, output, f, 'on')
			ao(obj, output, f, local, false)
			continue
		}
		// console.log(
		// 	111,
		// 	f.name,
		// 	sb,
		// 	local,
		// 	isAlrOff,
		// 	offS,
		// 	alrStop,
		// 	lockAuto,
		// 	bldOff,
		// 	aLowB,
		// 	aLow,
		// 	lowB,
		// 	low,
		// 	'man=',
		// 	man,
		// 	'ignore',
		// 	ignore,
		// )

		out(
			obj,
			output,
			f,
			sb,
			local,
			isAlrOff && permissionOff,
			offS,
			alrStop,
			lockAuto,
			bldOff,
			aLowB,
			aLow,
			lowB,
			low,
			fanOff && permissionOff,
		)
		ao(
			obj,
			output,
			f,
			local,
			sb,
			isAlrOff,
			offS,
			alrStop,
			lockAuto,
			bldOff,
			aLowB,
			aLow,
			lowB,
			low,
			fanOff,
		)
	}
	// Флаги однократных блокировок
	Object.entries(once).forEach(([id, low]) => {
		if (!low) {
			store.heap.lock[id] = {}
			return
		}
		store.heap.lock[id] ??= {}
		store.heap.lock[id].low = true
	})
}

/**
 * Для групп ВНО с общим сигналом управления
 * Является ли ВНО групповым
 * @param {*} fan
 * @param {*} fans
 * @returns
 */
function fnGroup(fan, fans) {
	const key = fan.module.id + fan.module.channel
	// Счетчик одинаковых ВНО (групповых): > 1 (true) - ВНО из группы, ВНО = 1 (false) - обычный ВНО
	let count = 0
	// Группа
	const list = []
	fans.forEach((el) => {
		if (key !== el.module.id + el.module.channel) return
		count++
		list.push(el)
	})
	// has=true - ВНО из группы
	return { has: count > 1, list }
}

// Для групп ВНО с общим сигналом управления
function ignoreGroupe(fan, fans, value) {
	const r = fnGroup(fan, fans)
	// Если ВНО не из группы, то разрешаем блокировку ВНО
	if (!r.has) return true

	// Если все ВНО из группы выведены из работы, то разрешаем блокировку ВНО
	if (r.list.every((el) => value?.[el._id]?.state === 'off')) return true

	return false
}

// Для групп ВНО с общим сигналом управления
function isGroup(fan, fans) {
	const key = fan.module.id + fan.module.channel
	// Счетчик одинаковых ВНО (групповых): > 1 (true) - ВНО из группы, ВНО = 1 (false) - обычный ВНО
	let count = 0
	fans.forEach((el) => {
		if (key !== el.module.id + el.module.channel) return
		count++
	})
	// true - ВНО из группы
	return count > 1
}

module.exports = fan
