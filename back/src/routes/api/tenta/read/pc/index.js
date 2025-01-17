const { data: store } = require('@store');
const { readOne } = require('@tool/json');
const transform = require('./transform');

function pc() {
	return async function (req, res) {
		try {
			const building = await readOne('building') // Считываем данные складов
			// const result = transform(store.value, building, section, sensor);
			const result = transform(store.value, building);
			console.log(1111, result)
			res.json(result);
		} catch (error) {
			console.log(error);			
			res.status(400).json({ error: error.toString() });
		}
	};
}

module.exports = pc;
