const { arrCtrlDO, ctrlDO, ctrlADO } = require('@tool/command/module_output')
const { compareTime } = require('@tool/command/time')
const { isExtralrm } = require('@tool/message/extralrm')
const { checklist } = require('../fn/init_data')
const { stasis, fnMean, getIdSbyClr } = require('../fn')
// 10сек
const _delay = 10_000
const _hyst = 10

// Тест вкл ВНО по очереди
function fan(bld, obj, m, checklistPNR, demo, permission, code) {
	// Сейчас в работе другой тест
	if (!permission) {
		// Активен - Тест включения всех ВНО
		if (code == 'allFan') return
		// Активен - Тест испарителей, обычные ВНО отключаем, испарители не трогаем
		if (code == 'coolerCool') return arrCtrlDO(bld._id, m.fanBN, 'off')

		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}

	// Сейчас в работе тест разгонников
	// Если нет разгонников пропускаем данный тест
	if (!m.fanBexc) {
		demo.order++
		demo.timeT = new Date()
		arrCtrlDO(bld._id, m.fanBexc, 'off')
		return
	}

	// Тест
	singleOn(bld, obj, m, checklistPNR, demo)
}

function singleOn(bld, obj, m, checklistPNR, demo) {
	demo.accF ??= {}
	demo.accF.order ??= 0
	// Все ВНО проверены
	demo.accF.time ??= new Date()
	const chk = checklistPNR[demo.order]

	m.fanBexc.forEach((el, i) => {
		// ВНО не равный номеру очереди - dsrk.xftv
		if (demo.accF.order !== i) {
			ctrlADO(el, bld._id, 'off')
			return
		}
		// Текущий ВНО (равный номеру очереди)
		const t = compareTime(demo.accF.time, chk.last)
		// Время прошло
		if (t) {
			ctrlADO(el, bld._id, 'off')
			// Переключение на следующий ВНО с проверкой конца очереди
			demo.accF.order++
			demo.accF.time = new Date()
			// Финиш теста ВНО, очистка аккума, переход к следующему тесту
			if (typeof demo.accF.order == 'number' && demo.accF.order >= m.fanBexc.length) {
				delete demo.accF?.order
				delete demo.accF?.time
				demo.order++
				demo.timeT = new Date()
			}
			return
		}
		// Время не прошло - Включаем ВНО + проверка работы
		ctrlADO(el, bld._id, 'on', 100)
		check(el, bld, obj, demo)
		fnP(el, bld, obj, checklistPNR, demo, m)
	})

	// console.log('test fan', demo.accF)
}

// Проверка вкл/выкл ВНО
function check(el, bld, obj, demo) {
	// Начинаем проверку после 50% пройденного теста данного ВНО
	const t = compareTime(demo.accF.time, checklist?.[demo.order]?.last * 0.5)
	// Время не прошло
	if (!t) return
	// Время прошло - мониторим состояние разгонника

	const v = obj?.value?.[el._id]
	demo.checklist.fan.list[el._id] ??= {}
	// Выбит автомат qf: true - автомат выбит, false - ок, null - неисправен модуль
	if (v?.qf && !demo.checklist.fan.list[el._id].qf) demo.checklist.fan.list[el._id].qf = 'автомат выбит'
	// Перегрев двигателя heat: true - перегрев, false - ок, null - неисправен модуль
	if (v?.heat && !demo.checklist.fan.list[el._id].heat)
		demo.checklist.fan.list[el._id].heat = 'перегрев мотора'
	// Дребезг контактора
	if (isExtralrm(bld._id, el._id, 'debdo') && !demo.checklist.fan.list[el._id].debdo)
		demo.checklist.fan.list[el._id].debdo = 'частое включение'
	// Модуль или Конфигурация
	if (v.state == 'stop' && !demo.checklist.fan.list[el._id].stop)
		demo.checklist.fan.list[el._id].stop = 'ошибка модуля или конфигурации'
	// Превышен ток двигателя
	if (
		v.state == 'run' &&
		v.vai > (+el?.actuator?.current ?? 30) &&
		!demo.checklist.fan.list[el._id].vai
	)
		demo.checklist.fan.list[el._id].vai = 'превышен ток двигателя'
}

function fnP(el, bld, obj, checklistPNR, demo, m) {
	// Нет датчиков давления
	if (!m.pB.length) return

	// Фиксируем давление в канале на данном ВНО, после 50% пройденного теста данного ВНО
	const t = compareTime(demo.accF.time, checklistPNR?.[demo.order]?.last * 0.5)
	// Время не прошло
	if (!t) return
	demo.accF.p ??= {}
	m.pB.forEach((p) => {
		// ВНО и датчик давления из одной секции
		// Поиск секции ВНО
		const ownerSect =
			el.owner.type == 'section' ? el.owner.id : getIdSbyClr(el.owner.id, obj)?.sectionId
		if (ownerSect !== p.owner.id) return
		// Давление для ВНО
		stasis(el._id, obj.value?.[p._id], demo.accF.p)
	})

	// Сохраняем сообщения о давлении ВНО
	for (const idF in demo.accF.p) {
		demo.checklist.fan.list[idF] ??= {}
		if (!demo.checklist.fan.list[idF]?.p) {
			demo.checklist.fan.list[idF].p = `Давление ${demo.accF.p[idF].value} bar`
		}
	}

	// Очередь еще в работе
	if (demo.accF.order < m.fanBexc.length - 1) return

	// Очередь закончилась, все показания по давления для каждого ВНО сняты
	demo.checklist.fan.list[el._id] ??= {}

	// Считаем среднее арифметическое
	const mean = fnMean(demo)

	demo.checklist.fan.p = ''
	if (mean === null && !demo.checklist.fan.p) {
		demo.checklist.fan.p = 'Показания по давлению отсутсвуют'
		return
	}
	// Если хоть у одного ВНО есть отклонение от среднего давления, то пишем ошибку
	const err = Object.values(demo.accF.p ?? {}).some(
		(el) => el.value !== null && (el.value < mean - _hyst || el.value > mean + _hyst),
	)
	if (err && !demo.checklist.fan.p)
		demo.checklist.fan.p = `Давление ВНО не соответсвует среднему давлению в канале ${mean} bar`
}

module.exports = fan
