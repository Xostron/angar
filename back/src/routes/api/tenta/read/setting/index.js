const { data: store } = require('@store');
function setting() {
	return function (req, res) {
		// Получение параметров из запроса
		const { bldId, codeS, codeP } = req.params;
		if (!bldId || !codeS || !codeP) {
			return res
				.status(400)
				.json({ error: 'Не указаны обязательные параметры' });
		}
		const retain = store.value.retain[bldId];
		if (!retain) {
			return res
				.status(404)
				.json({ error: 'Здание не найдено: ' + bldId });
		}
		const data =
			retain.setting?.[codeS]?.[codeP] ?? retain.setting?.[codeS] ?? null;
		if (!data) {
			return res.status(404).json({
				error: 'Настройка не найдена: ' + codeS + ', ' + codeP,
			});
		}
		res.json({ result: data });
	};
}

module.exports = setting;
