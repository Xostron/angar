const express = require('express');
const { getDb } = require('@tool/logger/db');
const { find, aggregate } = require('@tool/db');

const DAY_MS = 24 * 60 * 60 * 1000;
const STATE_MAP = { off: 0, on: 1, alarm: 2 };

/**
 * @param {express.Router} router — родительский /api/web
 */
function report(router) {
	const r = express.Router();
	router.use('/report', r);
	r.get('/charts', charts());
	r.get('/sensors', sensors());
}

/**
 * GET /api/web/report/charts?bldId=...&days=7
 *
 * Возвращает 4 готовых к отображению набора данных:
 *   temperature: [[ts, value, state], ...]   — линейный график
 *   humidity:    [[ts, value, state], ...]   — линейный график
 *   valve:       [[ts, combined], ...]       — ступенчатый, агрегирован
 *   fan:         [[ts, combined], ...]       — ступенчатый, агрегирован
 *
 * state: 0 = off, 1 = on, 2 = alarm
 * combined: 0 = все выкл, 1 = хотя бы одно вкл
 */
function charts() {
	return async (req, res) => {
		try {
			const db = getDb();
			if (!db)
				return res.status(503).json({ error: 'Logs DB unavailable' });

			const { bldId, days: daysParam } = req.query;
			if (!bldId)
				return res.status(400).json({ error: 'bldId is required' });

			const days = Math.min(Math.max(parseInt(daysParam) || 7, 1), 14);
			const since = new Date();
			since.setHours(0, 0, 0, 0);
			since.setDate(since.getDate() - (days - 1));
			const base = { bldId, ts: { $gte: since } };
			const sort = { ts: 1 };

			const [tempRaw, humRaw, valveRaw, fanRaw] = await Promise.all([
				find(db, 'sensor', { ...base, type: 'tprdL' }, sort, {
					ts: 1,
					value: 1,
					state: 1,
					_id: 0,
				}),
				find(db, 'sensor', { ...base, type: 'hin' }, sort, {
					ts: 1,
					value: 1,
					state: 1,
					_id: 0,
				}),
				find(db, 'valve', { ...base, type: 'in' }, sort, {
					ts: 1,
					value: 1,
					id: 1,
					_id: 0,
				}),
				find(db, 'fan', { ...base, type: 'fan' }, sort, {
					ts: 1,
					value: 1,
					id: 1,
					_id: 0,
				}),
			]);

			res.json({
				temperature: toLinePoints(tempRaw),
				humidity: toLinePoints(humRaw),
				valve: aggregateDevices(valveRaw),
				fan: aggregateDevices(fanRaw),
			});
		} catch (e) {
			console.error('Report charts error:', e);
			res.status(500).json({ error: e.message });
		}
	};
}

/**
 * Sensor → массив [timestamp_ms, value, stateNum]
 * Пропускает записи с value === null
 */
function toLinePoints(docs) {
	const result = [];
	for (const d of docs) {
		if (d.value == null) continue;
		result.push([
			new Date(d.ts).getTime(),
			d.value,
			STATE_MAP[d.state] ?? 1,
		]);
	}
	return result;
}

/**
 * Агрегация нескольких устройств (клапана / вентиляторы) в один
 * ступенчатый ряд. ВКЛ (1) если хотя бы одно устройство включено,
 * ВЫКЛ (0) если все выключены. Отдаёт только точки смены состояния.
 * @returns {number[][]} [[timestamp_ms, 0|1], ...]
 */
function aggregateDevices(docs) {
	if (!docs?.length) return [];

	const state = {};
	const result = [];
	let prev = null;

	for (const d of docs) {
		state[d.id || '_'] = d.value;
		const combined = Object.values(state).some((v) => v === 1) ? 1 : 0;
		if (combined !== prev) {
			result.push([new Date(d.ts).getTime(), combined]);
			prev = combined;
		}
	}

	return result;
}

/**
 * GET /api/web/report/sensors?bldId=...&days=7&type=tprd|hin
 *
 * Агрегация данных датчиков: группировка по id + name.
 * Возвращает массив серий:
 *   [{ id, name, data: [[ts_ms, value], ...] }, ...]
 */
function sensors() {
	return (req, res) => {
		try {
			const db = getDb();
			if (!db)
				return res.status(503).json({ error: 'Logs DB unavailable' });

			const { bldId, days: daysParam, type } = req.query;
			if (!bldId)
				return res.status(400).json({ error: 'bldId is required' });
			if (!type || !['tprd', 'hin'].includes(type)) {
				return res
					.status(400)
					.json({ error: 'type must be tprd or hin' });
			}

			const days = Math.min(Math.max(parseInt(daysParam) || 7, 1), 14);
			const since = new Date();
			since.setHours(0, 0, 0, 0);
			since.setDate(since.getDate() - (days - 1));

			const pipeline = [
				{
					$match: {
						bldId,
						type,
						value: { $exists: true },
						ts: { $gte: since },
					},
				},
				{ $sort: { ts: 1 } },
				{
					$group: {
						_id: { id: '$id', name: '$name' },
						data: {
							$push: {
								ts: '$ts',
								value: '$value',
							},
						},
					},
				},
				{
					$project: {
						_id: 0,
						id: '$_id.id',
						name: '$_id.name',
						data: 1,
					},
				},
				{ $sort: { name: 1 } },
			];

			aggregate(db, 'sensor', pipeline)
				.then((series) => {
					const result = (series || []).map((s) => ({
						id: s.id,
						name: s.name || s.id || 'Без имени',
						data: s.data
							.filter((d) => d.value != null)
							.map((d) => [new Date(d.ts).getTime(), d.value]),
					}));
					res.json(result);
				})
				.catch((e) => {
					console.error('Report sensors aggregate error:', e);
					res.status(500).json({ error: e.message });
				});
		} catch (e) {
			console.error('Report sensors error:', e);
			res.status(500).json({ error: e.message });
		}
	};
}

module.exports = report;
