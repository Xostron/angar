const { isExtralrm } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const { getIdB } = require('@tool/get/building')
const { getAO } = require('@tool/in_out')
const { data: store } = require('@store')
const { isCombiCold } = require('@tool/combi/is')
const _MIN_SP = 20

// Блокировки напорных вентиляторов (обычный склад)
// Если склад выключен, а секция в ручном режиме - не блокировать ВНО
function fan(obj, s) {
	const { value, data, retain, output } = obj
	const once = {}
    // Только по ВНО секциям
	for (const f of data.fan) {
		if (f.type !== 'fan') continue
		if (f.owner.type === 'cooler') continue
		const mdl = f?.module?.id
		if (!output[mdl]) continue

		// Id cклада
		const idB = getIdB(mdl, data.module)
		const bld = data.building.find((el) => el._id == idB)
		// Комби склад в режиме холодильника
		const isCC = isCombiCold(bld, retain?.[idB]?.automode, s)
		const idsS = getIdsS(obj.data.section, idB)
		// Игнор блокировки: включено окуривание или озонатор
		const ignore = s[idB]?.smoking?.on || s[idB]?.ozon?.on
		// Блокировки:
		// Состояние вентилятора: авария / выведен из работы
		const isAlrOff = value?.[f._id]?.state === 'alarm' || value?.[f._id]?.state === 'off' ? true : false
		// местный режим (aCmd.end - флаг о плавном останове вентиляторов)
		const local = isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') && !store.aCmd?.[f.owner.id]?.fan?.end
		// Секция выключена (null)
		let offS = (retain?.[idB]?.mode?.[f.owner.id] ?? null) === null && !ignore
		// Склад выключен и секция в авторежиме
		const lockAuto = !retain?.[idB]?.start && retain?.[idB]?.mode?.[f.owner.id] && !ignore
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		// Низкая температура канала в авто
        const mode = retain?.[idB]?.mode?.[f.owner.id]
        const aLowB = isExtralrm(idB, null, 'alrClosed') && mode===true 
        const aLow = idsS.some((idS) => isExtralrm(idB, idS, 'alrClosed') && (mode===true || mode===undefined) && !isCC) 
		// Низкая температура канала в ручной режим: Однократная блокировка ВНО, для обычного и комби-обычного
		const lowB = isExtralrm(idB, null, 'alrClosed') && mode===false && !store.heap.lock?.[idB]?.low && !isCC
		const low = idsS.some((idS) => isExtralrm(idB, idS, 'alrClosed') && !store.heap.lock?.[idS]?.low && !isCC)
		once[idB] = lowB
		idsS.forEach((idS) => (once[idS] = low))

		console.log(111, f.name, local, isAlrOff, offS, alrStop, lockAuto, bldOff, aLowB, aLow, lowB, low)
		out(obj, output, f, local, isAlrOff, offS, alrStop, lockAuto, bldOff, aLowB, aLow, lowB, low)
		ao(obj, output, f, local, isAlrOff, offS, alrStop, lockAuto, bldOff, aLowB, aLow, lowB, low)
	}
	// Низкая темп канала: ручной режим - флаги 1кратной блокировки
	Object.entries(once).forEach(([id, low]) => {
		if (!low) return
		store.heap.lock[id] ??= {}
		store.heap.lock[id].low = true
	})
	console.log(4402, store.heap.lock)
}
// Блокировки разгонных вентиляторов (обычный склад и холодильник)
function fanAccel(obj, s) {
	const { value, data, retain, output } = obj
	for (const el of data.fan) {
		if (el.type !== 'accel') continue
		if (el.owner.type === 'cooler') continue
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// Блокировки
		// местный режим
		const local = isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Игнор блокировки: включено окуривание или озонатор
		const ignore = s[idB]?.smoking?.on || s[idB]?.ozon?.on
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm') //&& !store.aCmd?.[el.owner.id]?.fan?.end
		// Таймер запрета
		const ban = store.alarm.timer?.[idB]?.accel && !ignore
		// Состояние вентилятора: авария / выведен из работы
		const isAlrState = value?.[el._id]?.state === 'alarm' ? true : false
		// Авария питания
		const battery = isExtralrm(idB, null, 'battery')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, !!ban, alrStop, isAlrState, battery, bldOff)
	}
}

// Блокировки всех обогревов и оттаек
function heating(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.heating) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		const local = isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, bldOff)
	}
}

// Блокировка устройств (СО2, увлажнитель, озонатор)
function device(obj) {
	const { value, data, retain, output } = obj
	for (const el of data.device) {
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		const local = isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// const localB = isExtralrm(idB, null, 'local')
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, bldOff)
	}
}

// Соленоиды подогрева
function fnSolHeat(obj) {
	const { value, data, retain, output } = obj
	const arr = data.heating.filter((el) => el.type === 'channel')
	// По соленоидам подогрева -> owner испаритель -> owner секция
	for (const el of arr) {
		const idS = data.cooler?.find(({ _id }) => _id === el.owner.id)?.sectionId
		const mdl = el?.module?.id
		if (!output[mdl]) continue
		// Id cклада
		const idB = getIdB(mdl, data.module)
		const idsS = getIdsS(obj.data.section, idB)
		// местный режим
		// const local = isExtralrm(idB, idS, 'local')
		// const localB = isExtralrm(idB, null, 'local')
		const local = isExtralrm(idB, null, 'local') || idsS.some((idS) => isExtralrm(idB, idS, 'local'))
		// Нажат аварийный стоп
		const alrStop = isExtralrm(idB, null, 'alarm')
		// Состояние испарителя
		const stateC = value[el?.owner?.id]
		// Состояние агрегата испарителя
		const alrAgg = stateC.aggregate.state === 'alarm'
		// Состояние ВНО испарителя
		const alr_offVNO = stateC.fan.state === 'alarm'
		// Склад выключен
		const offB = retain?.[idB]?.start == false
		// Секция выключена
		let offS = (retain?.[idB]?.mode?.[idS] ?? null) === null
		// Кнопка выключения склада
		const bldOff = isExtralrm(idB, null, 'bldOff')
		out(obj, output, el, local, alrStop, alrAgg, alr_offVNO, offB, offS, bldOff)
	}
}

module.exports = { vlv, fan, fanAccel, heating, device, fnSolHeat }

/**
 *
 * @param {object} obj Глобальные данные PC
 * @param {object} output маска выходов
 * @param {object} o Исполнительный механизм - вентилятор, клапан, обогрев клапана
 * @param  {...boolean} locks сигналы блоlocksкировки
 */
function out(obj, output, o, ...locks) {
	const mdl = o?.module?.id
	if (!output[mdl] || !o) return
	const ch = o?.module?.channel - 1
	const lock = fn(locks)
	// Дискретный выход
	output[mdl].value[ch] = +(output?.[mdl]?.value?.[ch] && !lock)
}

// Сумматор аварий: хотя бы 1 авария  =>return true авария активна
function fn(args) {
	return args.some((el) => el === true)
}

function ao(obj, output, f, localB, local, ...args) {
	const lock = fn(args)
	// Аналоговый выход
	// ВНО имеет аналоговое управление?
	const ao = getAO(obj?.data?.binding, f)
	if (ao && lock) {
		output[ao.moduleId] ??= {}
		output[ao.moduleId].value ??= {}
		output[ao.moduleId].value[ao.channel - 1] = _MIN_SP
	}
	// Местный переключатель => задание ВНО на 100%, DO выкл
	if (ao) {
		if (local || localB) {
			store.heap.fan[f._id] = true
			output[ao.moduleId].value[ao.channel - 1] = 100
		}
		// Перключатель в авто, однократно сбросить АО
		if (store.heap.fan?.[f._id] && !local && !localB) {
			store.heap.fan[f._id] = false
			output[ao.moduleId].value[ao.channel - 1] = _MIN_SP
		}
	}
}
