const { data: store } = require('@store')
const checkSupply = require('../../supply')
const { isReadyAgg, clearCombi } = require('../fn')
const { isAlr } = require('@tool/message/auto')
const { isExtralrm, isAlrClosed } = require('@tool/message/extralrm')
const { getIdsS } = require('@tool/get/building')
const sm = require('@dict/submode')

// Склад Комби: Запрет работы испарителя
function deniedCombi(bld, sect, clr, bdata, alr, stateCooler, fnChange, obj) {
	const { start, s, se, m, accAuto, supply, automode } = bdata
	store.denied[bld._id] ??= {}
	const idsS = getIdsS(obj.data.section, bld._id)
	// Проверка питания
	const supplySt = checkSupply(bld, sect, clr, idsS, obj.retain)
	// Готов ли агрегат
	const aggr = isReadyAgg(obj.value, bld._id, clr.aggregateListId)
	// Есть ли аварии авторежим (да - разрешение работы холодильника, нет - запрет)
	const alrAuto = isAlr(bld._id, automode)
	// Выведен ли из работы ВНО испарителя
	const fansOff = clr.fan.some((el) => obj.retain?.[bld._id]?.fan?.[sect._id]?.[el._id])
	// Местный режим секции
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	// Режим секции true-Авто
	const sectM = obj.retain?.[bld._id]?.mode?.[sect._id]
	// Настройка "Испаритель холодильного оборудования" = true/false
	const off = (s?.coolerCombi?.on ?? true) === false
	const alrStop = isExtralrm(bld._id, null, 'alarm')
	const alrClosed = isAlrClosed(bld, obj)
	// Кнопка выключения склада
	const bldOff = isExtralrm(bld._id, null, 'bldOff')

    // Авария питания: сигнал склада/секций (supply), батарея (battery), Авария питания.ручной сброс (sb)
		const sb =
        // isExtralrm(bld._id, null, 'supply') ||
        // idsS.some((idS) => isExtralrm(bld._id, idS, 'supply')) ||
        // isExtralrm(bld._id, null, 'battery') ||
        isExtralrm(bld._id, null, 'sb')

	const a = [
		[!start, 'Склад выкл'],
		[alr, 'Аварии extralarm'],
		[!aggr, 'Агрегат не готов'],
		[!supplySt, 'Ожидание агрегата после выключения питания'],
		[!store.toAuto?.[bld._id]?.[sect._id], 'Подготовка секции к авто не пройдена'],
		[!alrAuto, 'Нет аварий авторежима'],
		[automode != 'cooling', 'Склад не в режиме Хранения'],
		[fansOff, 'ВНО испарителей выведены из работы'],
		[stateCooler.fan.state === 'alarm', 'ВНО испарителя в аварии'],
		[local, 'Переключатель на щите'],
		[!sectM, 'Секция не в Авто'],
		[stateCooler?.status === 'alarm', 'Испаритель в аварии'],
		[alrStop, 'alrStop'],
		[alrClosed, 'alrClosed'],
		[off, 'Настройка "Испаритель холодильного оборудования выключен"'],
		[bldOff, 'Кнопка выключения склада'],
		[
			store.alarm.timer?.[bld._id]?.cooling && accAuto.submode?.[0] === sm.cooling[0],
			'Таймер запрета охлаждения',
		],
		[
			store.alarm.timer?.[bld._id]?.heat && accAuto.submode?.[0] === sm.heat[0],
			'Таймер запрета нагрева',
		],
		[
			store.alarm.timer?.[bld._id]?.cure && accAuto.submode?.[0] === sm.cure[0],
			'Таймер запрета лечения',
		],
        [sb,'Авария питания']
	]
	store.denied[bld._id][clr._id] = a.filter((e) => e[0] === true)?.length !== 0
	console.log(
		410,
		clr.name,
		sect.name,
		'работа запрещена combi',
		store.denied[bld._id][clr._id],
		'',
		a.filter((e) => e[0]),
	)
	// Работа испарителя запрещена? false - Нет.
	if (!store.denied[bld._id][clr._id]) return false

	// true - Да (очищаем аккумулятор по испарителю и выключаем его)
	clearCombi(bld._id, sect._id, clr, s, accAuto, fnChange, stateCooler, store, alrAuto, sectM)

	// console.log('\tОстановка из-за ошибок:', store.denied[bld._id][clr._id])
	return true
}

module.exports = deniedCombi
