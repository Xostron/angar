const { data: store } = require('@store/index')
const { isDemo } = require('@tool/demo/fn/fn')
const { getSectAuto } = require('@tool/get/building')
const { isZero, zero } = require('@tool/zero')

// Суточные моточасы режима сушка
function dayDrying(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	const idB = bld._id
	// Инициализируем в retain сохранение подсчета сушки
	store.retain[idB].drying ??= {}
	const a = store.retain[idB].drying

	// Сброс счетчика в начале августа
	aug_nov(a)

	// Сброс счетчика по нажатию кнопки "Обнулить" на экране Старт склада
	if (isZero(idB)) {
		a.start = null
		a.total = 0
		// Флаг перехода сущки на хранение по достижению
		a.isDone = false
		// сброс флага кнопки "обнулить"
		zero(null, false)
		return
	}

	// Смена режима
	changeMode(a, s, bld._id)

	// Разрешение на подсчет дней сушки
	if (!check(bld, obj, s, m)) {
		fnEnd(a)
		return
	}

	fnInit(a)
	sum(a)
}

module.exports = dayDrying

/**
 * Запрет подсчета сушки
 * @param {*} bld
 * @param {*} obj
 * @param {*} s
 * @param {*} m
 * @returns true - Проверка пройдена (разрешить)
 */
function check(bld, obj, s, m) {
	// Текущий месяц
	const mon = new Date().getMonth() + 1
	const reason = [
		[!s?.drying?.onDaily, 'Выключен учет времени работы сушки'],
		[obj.retain?.[bld._id]?.automode != 'drying', 'Несоответсвие авторежима'],
		[!store._MONTH.includes(mon), 'Вне сезона сушки (с августа по ноябрь)'],
		[isDemo(bld._id), 'ПНР-режим активен'],
		[!obj.retain?.[bld._id]?.start, 'Склад выключен'],
		[!getSectAuto(bld._id, obj).length, 'Нет секций в авто'],
		[m.fanBB.every((el) => obj.value[el._id].state != 'run'), 'Все ВНО выключены'],
	]

	const err = reason.filter((el) => el[0])
	// err.length == 0 - запретов нет (разрешить подсчет)
	return !err.length
}

function fnInit(a) {
	// 1. Фиксируем точку отсчета работы сушки
	a.start ??= new Date()
	// Всего отработано дней сушки
	a.total ??= 0
	// Флаг счетчик уже был сброшен в начале августа = true
	a.isClear ??= false
}

function fnEnd(a) {
	// Если нет точки отсчета
	if (!a?.start) return

	// Суммируем
	a.total ??= 0
	if (Number.isNaN(a.total)) a.total = 0

	// Складываем?, мс
	const start = typeof a.start == 'string' ? new Date(a.start) : a.start
	a.total += new Date() - start

	// Очищаем стартовую точку для следующего подсчета
	a.start = null
}

function sum(a) {
	if (!a.start) return

	const start = typeof a.start == 'string' ? new Date(a.start) : a.start
	// Время сушки, мс
	a.total += new Date() - start
	// Точка отсчета сушки
	a.start = new Date()
}

// Начало и конец сезона
// Начало сезона - сброс счетчика
// Конец сезона сброс флага "Старт сезона" isSeason - нужен для однократной очистки счетчика
function aug_nov(a) {
	const mon = new Date().getMonth() + 1
	// Сброс флага в ноябре
	if (mon > store._MONTH.at(-1)) {
		a.isSeason = false
	}

	// Сброс счетчика в начале сезона и установка флага "Старт сезона"
	if (mon === 8 && !a.isSeason) {
		a.isSeason = true
		a.start = null
		a.total = 0
		// Флаг перехода сущки на хранение по достижению
		a.isDone = false
	}
}

// Смена авторежима работы склада
function changeMode(a, s, idB) {
	// Перевод задания сушки в днях в миллисекунды (1 день = 18ч)
	const ss = (s?.drying?.day ?? 0) * 18 * 3600 * 1000
	console.log(123, s?.drying?.day, ss, a.total)
	// По достижению кол-ва дней в сушке -> переход в хранение
	if (ss > 0 && a?.total >= ss && !a?.isDone) {
		store.retain[idB].automode = 'cooling'
		// Флаг смены режима Сушки на Хранение (однократно)
		a.isDone = true
	}
}
