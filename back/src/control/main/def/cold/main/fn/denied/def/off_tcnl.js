const { isAllStarted } = require('@store/index')
const { compareTime, remTime } = require('@tool/command/time')

/**
 * Выключение соленоида испарителя по температуре канала
 * ВНО испарителя вкл/выкл в зависимости от задания влажности s.mois.humidity
 * доп:
 * @param {*} idB
 * @param {*} mS
 * @param {*} s
 * @param {*} fnChange
 * @param {*} accAuto
 * @param {*} alrAuto
 * @param {*} sectM
 */
function offByTcnl(idB, mS, s, se, fnChange, accAuto, alrAuto, sectM) {
	const wait = (s?.coolerCombi?.allStarted ?? 60) * 1000
	mS.coolerS.forEach((clr) => {
		// Комби: Флаг для отключения испарителя, true - все вспомагательные механизмы подогрева канала запущены -> можно отключать испаритель
		// + доп задержка для защиты двигателя от частого включения
		accAuto.cold ??= {}
		accAuto.cold[clr.sectionId] ??= {}
		// Все э-ты подогрева включены: фиксируем точку отсчета для выключения испарителя
		if (isAllStarted(clr.sectionId)) accAuto.cold[clr.sectionId].allStarted ??= new Date()
		else {
			accAuto.cold[clr.sectionId].allStarted = null
			// Сброс состояния regulQ (вкл/выкл ВНО по заданию влажности)
			accAuto.cold[clr.sectionId].onQ = 0
		}

		// Точки отсчета нет -> канал еще прогревается (испаритель не отключаем)
		if (!accAuto?.cold?.[clr.sectionId]?.allStarted)
			return console.log('\t offByTcnl: канал еще прогревается')

		// Точка отсчета есть -> - начинаем отсчет времени "Настройка Холодильник С"
		const time = compareTime(accAuto?.cold?.[clr.sectionId]?.allStarted, wait)
		// Ждем
		if (!time) {
			// Принудительно оставляем ВНО включенным, так как Шахин переходя в ожидание,
			// выключает этот ВНО и остается работать один соленоид холода,
			// и испаритель получает обледенение и начинает оттайку
			fnChange(null, 1, 0, 0, null, clr)
			return console.log(
				'\t',
				clr.name,
				accAuto?.cold?.[clr.sectionId]?.allStarted,
				wait,
				'Низкая температура канала, отключение испарителя через',
				remTime(accAuto?.cold?.[clr.sectionId]?.allStarted, wait),
			)
		}

		// Время истекло
		// Испаритель выключить, но ВНО испарителя не выключать если:
		// 1. Склад в режиме обычного
		// 2. Секция в ручном режиме
		// 3. Включено окуривание
		// 4. Включено озонирование
		// 5. Настройка: Выключено оборудование испарителя
		const a = [
			[!alrAuto, 'В режиме обычного склада (аварии авторежима)'],
			[sectM === false, 'Секция в ручном режиме'],
			[s?.smoking?.on, 'окуривание'],
			[s?.ozon?.on, 'озонирование'],
			[!s?.coolerCombi?.on, 'Выключено оборудование испарителя'],
		]

		a.filter((e) => e[0] === true)?.length !== 0
			? fnChange(0, null, 0, 0, null, clr)
			: regulQ(s, se, fnChange, accAuto, clr)

		console.log(
			'\tНизкая температура канала, испаритель выключен.',
			'ВНО заблокирован = ',
			!a.filter((e) => e[0]).length,
		)
	})
}

module.exports = offByTcnl

/**
 * Комби-холодильник: Вкл/выкл ВНО испарителя во время низкой температуры канала
 * ВКЛ: Влажность продукта < Задания влажности
 * ВЫКЛ: Влажность продукта >= Задание влажности + гистерезис задания влажности
 * @param {*} s
 * @param {*} fnChange
 * @param {*} accAuto
 * @param {*} clr
 */
function regulQ(s, se, fnChange, accAuto, clr) {
	accAuto.cold ??= {}
	accAuto.cold[clr.sectionId] ??= {}
	accAuto.cold[clr.sectionId].onQ ??= 0
	// Вкл ВНО испарителя
	if (se.hin <= s.mois.humidity) accAuto.cold[clr.sectionId].onQ = 1
	// Выкл ВНО испарителя
	if (se.hin >= s.mois.humidity + (s.mois?.hysteresisHum ?? 1))
		accAuto.cold[clr.sectionId].onQ = 0

	console.log(
		661,
		'Регулирование по влажности 1',
		se.hin,
		'<=',
		s.mois.humidity,
		'=',
		se.hin <= s.mois.humidity,
	)
	console.log(
		662,
		'Регулирование по влажности 0',
		se.hin,
		'>=',
		s.mois.humidity,
		'+',
		s.mois?.hysteresisHum ?? 1,
		'=',
		se.hin >= s.mois.humidity + (s.mois?.hysteresisHum ?? 1),
	)
	console.log(6655, 'Регулирование по влажности', 'RESULT = ', accAuto?.cold?.[clr.sectionId])
	fnChange(0, accAuto?.cold?.[clr.sectionId]?.onQ ?? 0, 0, 0, null, clr)
}
