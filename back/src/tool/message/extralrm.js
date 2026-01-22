const { data: store } = require('@store')
const { readAcc } = require('@store/index')
const { getIdBS } = require('@tool/get/building')

// Получить extralrm аварию
function isExtralrm(idB, idS, code) {
	return idS
		? !!store.alarm?.extralrm?.[idB]?.[idS]?.[code]
		: !!store.alarm?.extralrm?.[idB]?.[code]
}

// Записать в extralrm (доп. аварии)
function wrExtralrm(idB, idS, code, o) {
	store.alarm.extralrm ??= {}
	store.alarm.extralrm[idB] ??= {}
	if (!idS) {
		!isExtralrm(idB, idS, code)
			? (store.alarm.extralrm[idB][code] = o)
			: (store.alarm.extralrm[idB][code].msg = o.msg)
		return
	}
	store.alarm.extralrm[idB][idS] ??= {}
	!isExtralrm(idB, idS, code)
		? (store.alarm.extralrm[idB][idS][code] = o)
		: (store.alarm.extralrm[idB][idS][code].msg = o.msg)
}
// Удалить из extralrm (доп. аварии)
function delExtralrm(idB, idS, code) {
	if (!idS) {
		delete store.alarm?.extralrm?.[idB]?.[code]
		return
	}
	delete store.alarm?.extralrm?.[idB]?.[idS]?.[code]
}

/**
 *  Аварии возникающие в секции, но останавливающие работу всего склада
 * @param {object} building склад
 * @param {object} obj глобальные данные о складах
 * @returns {boolean} Наличие аварий секции
 */
function sumExtralrmSection(building, obj) {
	const section = obj.data.section.filter((el) => el.buildingId == building._id)
	let alrS = false
	//Список аварий: Авария низкой температуры
	const list = ['alrClosed', 'overVlv', 'antibliz', 'local']
	// id секций склада
	const secIds = section.map((el) => el._id)
	// аварии склада
	const alrSect = store.alarm?.extralrm?.[building._id]
	// Поиск аварий из списка
	// По секциям
	for (const sId in alrSect) {
		if (!secIds.includes(sId)) continue
		// по авариям в секции
		for (const alrId in store.alarm?.extralrm?.[building._id]?.[sId]) {
			// авария не найдена
			if (!list.includes(alrId)) continue
			// авария найдена, тут же выходим
			alrS = true
			break
		}
		if (alrS) break
	}
	return alrS
}


/**
 * Авария низкой температуры останавливает склад, если возникла авария в
 * секции в авторежиме. Если секция выключена или в ручном,
 * то весь склад не останавливается
 * @param {*} bld Склад
 * @param {*} obj
 * @returns true - авария активна
 */
function isAlrClosed(bld, obj) {
	const idBS = getIdBS(obj?.data?.section, bld._id)
	// Читаем аккумулятор аварии низкой темп, и собираем ключи acc.result
	//  - это итоговый сигнал аварии с учетом режима секции, также здесь учитывается
	// авария низкой темп, которая принадлежит складу
	const sum = idBS.map(
		(ownerId) =>
			readAcc(
				bld._id,
				bld._id === ownerId ? 'building' : ownerId,
				bld._id === ownerId ? 'alrClosedB' : 'alrClosed'
			)?.result
	)
	console.log(4400, sum)
	if (sum.some((el) => !!el)) return true
	return false
}

module.exports = { isExtralrm, wrExtralrm, delExtralrm, sumExtralrmSection, isAlrClosed }
