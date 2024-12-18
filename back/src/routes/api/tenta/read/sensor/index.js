const { data: store } = require('@store');
const { readOne } = require('@tool/json');

function signal() {
	return async function (req, res) {
		try {
			// Получение параметров из запроса
			const { bldId, secId } = req.params;
			const data = store?.value?.retain?.[bldId];

			if (!bldId || !secId || !data) {
				return res
					.status(400)
					.json({ error: 'Не указаны обязательные параметры' });
			}
			// Рама
			const sensor = await readOne('sensor');
			const section = await readOne('section');
			if (!sensor)
				return res
					.status(400)
					.json({ error: 'Не прочитать параметры' });
			// Данные датчиков конкретной секции или ангара 
			const id = secId === 'all' ? bldId : secId;
			// Данные датчиков склада
			const s =  sensor
				.filter((el) => el.owner.id === id)
				.map((el) => sens(el, store?.value, bldId))
			const sec = section.filter(el=>el.buildingId == bldId).map(el=>{
				delete el.status
				delete el.buildingId
				return el
			})
			sec.unshift({
				"_id": "all",
				"name": "Общие"
			})
			const result = {
				sensor: s,
				list: sec
			}
			res.json({ result });
		} catch (error) {
			res.status(400).json({ error: error.toString() });
		}
	};
}

function sens(s, v, buildingId) {
	return {
		_id: s._id,
		code: s.type,
		title: s.name,
		mode: v.retain?.[buildingId]?.[s._id]?.on ?? true,
		correction: v.retain?.[buildingId]?.[s._id]?.corr ?? 0,
		value: v?.[s._id]?.value,
	};
}
module.exports = signal;
