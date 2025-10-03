require('module-alias/register');
const path = require('path');
const queue = require('./queue');
const { writeFile, readFileSync } = require('fs');
require('dotenv').config({
	path: path.join(__dirname, '../.env'),
});
const filePath = path.join(__dirname, 'story.json');

// Запуск всех util указанных в списке
async function main() {
	let story = '{}';
	try {
		story = JSON.parse(readFileSync(filePath));
	} catch (error) {
		story = {};
	}
	let err = false;
	console.log('\nЗапуск задач');
	while (queue.length && !err) {
		const task = queue.shift();
		const h = story[task.key];
		try {
			if (!h || task.retry || !h?.success) {
				const result = await task.fn();
				story[task.key] = {
					success: true,
					date: new Date(),
				};
				console.log(
					`\tЗадача "${task.key}" - Выполнена. ${JSON.stringify({
						result,
					})}`
				);
			} else
				console.log(
					`\tЗадача "${
						task.key
					}" - Пропущена. История: ${JSON.stringify(h)}`
				);
		} catch (error) {
			err = error;
			console.log(error);
			console.log(`\tЗадача "${task.key}" - Ошибка. ${error}`);
			story[task.key] = {
				success: false,
				err: error.toString(),
				date: new Date(),
			};
		}
	}
	//Завершение работы
	writeFile(filePath, JSON.stringify(story ?? {}, null, '\t'), (error) => {
		if (error) {
			console.log(JSON.stringify(story ?? {}, null, '\t'));
			return console.log('Ошибка записи результатов выполнения', error);
		}
		console.log('Результаты выполнения сохранены');
	});
}

main();
