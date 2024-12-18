// Информация по периферии для складов на WEB
/*result = {building:[
	{
		building: {},
		product:[],
		sensor:[],
		fan:[],
		aggregate:[]
		// binding:[]

		section:[
			{	
				...section:{}
				sensor:[],
				fan:[],
				valve:[],
				heating:[],
				signal:[]
				cooler: []
				device:[],

			},
		],
	},
], 
factory:{}
}*/
const { debugJson } = require('@tool/json')
const building = require('./building');
const factory = require('./factory');

// Рама для web
function equip(data) {
	const result = {
		building: data.building.map((el) => building(el, data)),
		factory: factory(data?.factory),
	};
	// debugJson('awe', result.building, __dirname)
	return result;
}

module.exports = equip;
