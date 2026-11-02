import {useTimeStore, posNow, posOffsetMin } from '@store/time'

/**
 * Получить истекшее время
 * @param {*} date Дата отсчета
 * @returns 'HH:mm'
 */
function elapsedTime(date) {
	if (!date) return null
	const cur = new Date().getTime()
	const d = new Date(date).getTime()
	// время в минутах
	const r = (cur - d) / 60000
	// часы
	const hh = +(r / 60).toFixed(0) < 10 ? '0' + (r / 60).toFixed(0) : (r / 60).toFixed(0)
	// мин
	const mm = +(r % 60).toFixed(0) < 10 ? '0' + (r % 60).toFixed(0) : (r % 60).toFixed(0)
	return `${hh}ч ${mm}м`
}


/**
 * Преобразование hh:mm (string) в миллисекунды
 * @param {*} hm hh:mm (string), 01:42
 */
function ms(hm) {
	if (!hm || typeof hm !== 'string') return null
	return hm.split(':').reduce((acc, val, i) => {
		if (i === 0) acc = +val * 60 * 60 * 1000
		if (i === 1) acc += +val * 60 * 1000
		return acc
	}, 0)
}

// --- Время POS ---------------------------------------------------------------
// Интерфейс может быть открыт не на POS (ноутбук, удалённый доступ),
// поэтому все отметки времени показываем в зоне POS.
// Пока зона POS неизвестна (нет синхронизации) — используется зона клиента.

const MIN_MS = 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

/**
 * Дополнение числа нулями слева
 * @param {number} n
 * @returns {string}
 */
const pad2 = (n) => String(n).padStart(2, '0')

/**
 * Сдвиг «UTC -> зона POS» в мс
 * @returns {number|null} null — зона POS ещё не известна
 */
function posShiftMs() {
	const off = posOffsetMin()
	return off === null ? null : -off * MIN_MS
}

/**
 * Компоненты даты и времени в зоне POS
 * @param {Date|number|string} ts Отметка времени
 * @returns {{y:number, mo:number, d:number, h:number, mi:number, s:number}|null}
 */
function posParts(ts) {
	const d = ts instanceof Date ? ts : new Date(ts)
	if (!d || isNaN(d.getTime())) return null
	const shift = posShiftMs()
	// Зона POS неизвестна — показываем в зоне клиента
	if (shift === null)
		return {
			y: d.getFullYear(),
			mo: d.getMonth() + 1,
			d: d.getDate(),
			h: d.getHours(),
			mi: d.getMinutes(),
			s: d.getSeconds(),
		}
	// Сдвигаем метку и читаем UTC-компоненты — это «настенное» время POS
	const w = new Date(d.getTime() + shift)
	return {
		y: w.getUTCFullYear(),
		mo: w.getUTCMonth() + 1,
		d: w.getUTCDate(),
		h: w.getUTCHours(),
		mi: w.getUTCMinutes(),
		s: w.getUTCSeconds(),
	}
}

/**
 * Дата POS: ДД.ММ.ГГГГ
 * @param {Date|number|string} ts
 * @returns {string}
 */
function posDate(ts) {
	const p = posParts(ts)
	return p ? `${pad2(p.d)}.${pad2(p.mo)}.${p.y}` : '—'
}

/**
 * Время POS: ЧЧ:ММ
 * @param {Date|number|string} ts
 * @returns {string}
 */
function posTime(ts) {
	const p = posParts(ts)
	return p ? `${pad2(p.h)}:${pad2(p.mi)}` : '—'
}

/**
 * Дата и время POS: ДД.ММ.ГГГГ ЧЧ:ММ:СС
 * @param {Date|number|string} ts
 * @returns {string}
 */
function posDateTime(ts) {
	const p = posParts(ts)
	return p
		? `${pad2(p.d)}.${pad2(p.mo)}.${p.y} ${pad2(p.h)}:${pad2(p.mi)}:${pad2(p.s)}`
		: '—'
}

/**
 * Смещение зоны от UTC: UTC+4, UTC-3:30
 * @param {number|null} offsetMin Смещение в минутах (как Date#getTimezoneOffset)
 * @returns {string} Пустая строка — смещение неизвестно
 */
function utcOffsetLabel(offsetMin) {
	if (offsetMin === null || offsetMin === undefined || offsetMin === '') return ''
	const off = Number(offsetMin)
	if (!Number.isFinite(off)) return ''
	// getTimezoneOffset возвращает смещение с обратным знаком (UTC+4 -> -240)
	const sign = off > 0 ? '-' : '+'
	const abs = Math.abs(off)
	const h = Math.floor(abs / 60)
	const mi = abs % 60
	return `UTC${sign}${h}${mi ? ':' + pad2(mi) : ''}`
}

/**
 * Описание зоны POS: «Europe/Astrakhan, UTC+4»
 * @param {string} [timezone] Имя зоны POS (по умолчанию — из стора)
 * @param {number} [offset] Смещение зоны POS в минутах (по умолчанию — из стора)
 * @returns {string} Пустая строка — зона POS ещё не известна
 */
function posZoneLabel(timezone, offset) {
	const tz = timezone ?? useTimeStore.getState().timezone
	const utc = utcOffsetLabel(offset ?? posOffsetMin())
	return [tz, utc].filter(Boolean).join(', ')
}

/**
 * Дата POS для input[type=date]: ГГГГ-ММ-ДД
 * @param {Date|number|string} ts
 * @returns {string}
 */
function posDayStr(ts) {
	const p = posParts(ts)
	return p ? `${p.y}-${pad2(p.mo)}-${pad2(p.d)}` : ''
}

/**
 * Дата и время POS для input[type=datetime-local]: ГГГГ-ММ-ДДTЧЧ:ММ
 * @param {Date|number|string} ts
 * @returns {string}
 */
function posInput(ts) {
	const p = posParts(ts)
	return p ? `${p.y}-${pad2(p.mo)}-${pad2(p.d)}T${pad2(p.h)}:${pad2(p.mi)}` : ''
}

/**
 * Миллисекунды из значения input (ГГГГ-ММ-ДД[ TЧЧ:ММ[:СС[.мс]]]).
 * Значение трактуется как время POS.
 * @param {string} value
 * @returns {number|null} null — не удалось разобрать
 */
function posFromInput(value) {
	if (!value) return null
	const m = String(value).match(
		/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?)?$/,
	)
	if (!m) return null
	const y = +m[1]
	const mo = +m[2]
	const d = +m[3]
	const h = +(m[4] || 0)
	const mi = +(m[5] || 0)
	const s = +(m[6] || 0)
	const msec = +(m[7] || '0').padEnd(3, '0')
	const shift = posShiftMs()
	if (shift === null) return new Date(y, mo - 1, d, h, mi, s, msec).getTime()
	return Date.UTC(y, mo - 1, d, h, mi, s, msec) - shift
}

/**
 * Начало суток POS
 * @param {Date|number|string} [ts] Отметка времени (по умолчанию — сейчас)
 * @param {number} [daysBack] Отступить назад на указанное число суток
 * @returns {number|null}
 */
function posDayStart(ts = posNow(), daysBack = 0) {
	const p = posParts(ts)
	if (!p) return null
	const shift = posShiftMs()
	if (shift === null) return new Date(p.y, p.mo - 1, p.d - daysBack).getTime()
	return Date.UTC(p.y, p.mo - 1, p.d - daysBack) - shift
}

/**
 * Начало часа POS
 * @param {Date|number|string} ts Отметка времени
 * @returns {number|null}
 */
function posHourStart(ts) {
	const p = posParts(ts)
	if (!p) return null
	const shift = posShiftMs()
	if (shift === null) return new Date(p.y, p.mo - 1, p.d, p.h).getTime()
	return Date.UTC(p.y, p.mo - 1, p.d, p.h) - shift
}

export {
	elapsedTime,
	ms,
	// Время POS
	posNow,
	posOffsetMin,
	posShiftMs,
	posParts,
	posDate,
	posTime,
	posDateTime,
	utcOffsetLabel,
	posZoneLabel,
	posDayStr,
	posInput,
	posFromInput,
	posDayStart,
	posHourStart,
	pad2,
	DAY_MS,
}

