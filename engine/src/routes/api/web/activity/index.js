const express = require('express')
const { getDb } = require('@tool/logger/db')

const router = express.Router()

/**
 * GET /api/web/activity?page=1&limit=50&from=ISO&to=ISO
 * Записи действий пользователей из БД logs.activity с пагинацией и фильтром по датам
 */
router.get('/', async (req, res) => {
	const db = getDb()
	if (!db) return res.status(503).json({ error: 'БД логов недоступна' })

	const page = Math.max(1, parseInt(req.query.page) || 1)
	const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50))
	const skip = (page - 1) * limit

	const query = {}
	const { from, to, bldId, secId } = req.query
	if (from || to) {
		query.ts = {}
		if (from) {
			const d = new Date(from)
			if (!isNaN(d.getTime())) query.ts.$gte = d
		}
		if (to) {
			const d = new Date(to)
			if (!isNaN(d.getTime())) query.ts.$lte = d
		}
		if (!Object.keys(query.ts).length) delete query.ts
	}
	if (bldId) query.bldId = bldId
	if (secId) query.secId = secId

	try {
		const projection = { clientId: 0 }
		const [items, total] = await Promise.all([
			findPaged(db, 'activity', query, { ts: -1 }, projection, skip, limit),
			countDocs(db, 'activity', query),
		])
		res.json({ items, total, page, limit })
	} catch (e) {
		console.error('Ошибка чтения activity:', e.message)
		res.status(500).json({ error: 'Ошибка чтения данных' })
	}
})

/** @returns {Promise<object[]>} */
function findPaged(db, col, query, sort, projection, skip, limit) {
	return new Promise((resolve, reject) => {
		db[col]
			.find(query, projection)
			.sort(sort)
			.skip(skip)
			.limit(limit, (err, docs) => (err ? reject(err) : resolve(docs)))
	})
}

/** @returns {Promise<number>} */
function countDocs(db, col, query) {
	return new Promise((resolve, reject) => {
		db[col].count(query, (err, n) => (err ? reject(err) : resolve(n)))
	})
}

module.exports = router
