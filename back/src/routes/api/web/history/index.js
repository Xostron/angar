const express = require('express')
const { data: store } = require('@store')
const { findOne, remove } = require('@tool/db')

const router = express.Router()

/**
 * GET /api/web/history?ts=<ISO date string>
 * Возвращает ближайшие данные из коллекций alarm, input, equip по указанному времени
 */
router.get('/', async (req, res) => {
	const { db } = store
	if (!db) return res.status(503).json({ error: 'БД недоступна' })

	const ts = req.query.ts ? new Date(req.query.ts) : new Date()
	if (isNaN(ts.getTime())) return res.status(400).json({ error: 'Некорректная дата' })

	try {
		const query = { ts: { $lte: ts } }
		const sort = { ts: -1 }

		const [input, equip, alarm] = await Promise.all([
			findOne(db, 'input', query, sort),
			findOne(db, 'equip', query, sort),
			findOne(db, 'alarm', query, sort),
		])

		res.json({
			input: input?.data ?? null,
			equip: equip?.data ?? null,
			alarm: alarm?.data ?? null,
			ts: { input: input?.ts, equip: equip?.ts, alarm: alarm?.ts },
		})
	} catch (e) {
		console.error('Ошибка чтения истории:', e.message)
		res.status(500).json({ error: 'Ошибка чтения данных' })
	}
})

/**
 * DELETE /api/web/history
 * Очистка всех коллекций истории (alarm, input, equip)
 */
router.delete('/', async (req, res) => {
	const { db } = store
	if (!db) return res.status(503).json({ error: 'БД недоступна' })

	try {
		const cols = ['alarm', 'input', 'equip']
		const results = await Promise.all(cols.map((c) => remove(db, c, {})))
		const removed = cols.reduce((acc, c, i) => ({ ...acc, [c]: results[i]?.n ?? 0 }), {})
		res.json({ ok: true, removed })
	} catch (e) {
		console.error('Ошибка очистки истории:', e.message)
		res.status(500).json({ error: 'Ошибка очистки данных' })
	}
})

module.exports = router
