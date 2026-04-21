const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const { out, ao, outV, fn } = require('./index')

// Блокировки напорных вентиляторов (обычный склад)
// Если склад выключен, а секция в ручном режиме - не блокировать ВНО
function fan(obj, s) {
	const { value, data, retain, output } = obj
	const once = {}
	// Только по ВНО секциям
	for (const f of data.fan) {
		// Только для напорных ВНО type=fan
		if (f.type !== 'fan') continue
		// Если ВНО испарителя - не блокируем
		if (f.owner.type === 'cooler') continue
		// Если не найден модуль дискретного выхода - не блокируем
		const mdl = f?.module?.id
		if (!output[mdl]) continue

		// Id cклада
		const idB = getIdB(mdl, data.module)
		// Склад
		const bld = data.building.find((el) => el._id == idB)
		// Тип склада: комби-холодильник
		const isCC = isCombiCold(bld, retain?.[idB]?.automode, s)
		// Массив ИД секций склада
		const idsS = getIdsS(obj.data.section, idB)
		// Режим секции текущего ВНО
		const mode = retain?.[idB]?.mode?.[f.owner.id]
		// Игнор блокировки: включено окуривание или озонатор
		const ignore = s[idB]?.smoking?.on || s[idB]?.ozon?.on

		// Блокировки:

		// Авария питания: сигнал склада/секций (supply), батарея (battery), Авария питания.ручной сброс (sb)
		const sb =
			// isExtralrm(bld._id, null, 'supply') ||
			// idsS.some((idS) => isExtralrm(bld._id, idS, 'supply')) ||
			// isExtralrm(bld._id, null, 'battery') ||
			isExtralrm(bld._id, null, 'sb')

		// Состояние вентилятора: авария / выведен из работы
		const isAlrOff =
			value?.[f._id]?.state === 'alarm' || value?.[f._id]?.state === 'off' ? true : false

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

		console.log(
			111,
			f.name,
			sb,
			local,
			isAlrOff,
			offS,
			alrStop,
			lockAuto,
			bldOff,
			aLowB,
			aLow,
			lowB,
			low,
		)
		out(
			obj,
			output,
			f,
			sb,
			local,
			isAlrOff,
			offS,
			alrStop,
			lockAuto,
			bldOff,
			aLowB,
			aLow,
			lowB,
			low,
		)
		ao(
			obj,
			output,
			f,
			sb,
			local,
			isAlrOff,
			offS,
			alrStop,
			lockAuto,
			bldOff,
			aLowB,
			aLow,
			lowB,
			low,
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
	// console.log(4402, store.heap.lock)
}

module.exports = fan
