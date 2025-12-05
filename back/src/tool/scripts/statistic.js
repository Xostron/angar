const fs = require('fs');
const path = require('path');

// Папка logs находится на одном уровне с папкой back
const logsPath = path.join(__dirname, '../../../../logs');

/**
 * Рекурсивно получить все файлы из директории
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
	try {
		const files = fs.readdirSync(dirPath);

		files.forEach((file) => {
			const filePath = path.join(dirPath, file);

			try {
				if (fs.statSync(filePath).isDirectory()) {
					arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
				} else {
					arrayOfFiles.push(filePath);
				}
			} catch (error) {
				console.error(
					`Ошибка при чтении файла ${filePath}:`,
					error.message
				);
			}
		});
	} catch (error) {
		console.error(
			`Ошибка при чтении директории ${dirPath}:`,
			error.message
		);
	}

	return arrayOfFiles;
}

/**
 * Форматирование размера в читаемый вид
 */
function formatSize(bytes) {
	const mb = bytes / (1024 * 1024);
	const gb = bytes / (1024 * 1024 * 1024);

	if (gb >= 1) {
		return `${gb.toFixed(2)} ГБ`;
	} else {
		return `${mb.toFixed(2)} МБ`;
	}
}

/**
 * Получить информацию о папке logs
 */
function info() {
	return new Promise((resolve, reject) => {
		try {
			// Проверяем существование папки
			if (!fs.existsSync(logsPath)) {
				return reject({
					error: 'Папка logs не найдена',
					path: logsPath,
				});
			}

			// Получаем все файлы рекурсивно
			const allFiles = getAllFiles(logsPath);

			// Подсчитываем общий размер
			let totalSize = 0;
			allFiles.forEach((file) => {
				try {
					const stats = fs.statSync(file);
					totalSize += stats.size;
				} catch (error) {
					console.error(
						`Ошибка при получении размера файла ${file}:`,
						error.message
					);
				}
			});

			return resolve({
				path: logsPath,
				count: allFiles.length,
				size: totalSize,
				formatted: formatSize(totalSize),
			});
		} catch (error) {
			return reject({
				error: 'Ошибка при получении информации о папке logs',
				message: error.message,
			});
		}
	});
}

/**
 * Рекурсивно удалить содержимое директории
 */
function removeDirectoryContents(dirPath) {
	try {
		if (!fs.existsSync(dirPath)) {
			return;
		}

		const files = fs.readdirSync(dirPath);

		files.forEach((file) => {
			const filePath = path.join(dirPath, file);

			try {
				const stats = fs.statSync(filePath);

				if (stats.isDirectory()) {
					// Рекурсивно удаляем директорию
					fs.rmSync(filePath, { recursive: true, force: true });
				} else {
					// Удаляем файл
					fs.unlinkSync(filePath);
				}
			} catch (error) {
				console.error(
					`Ошибка при удалении ${filePath}:`,
					error.message
				);
			}
		});
	} catch (error) {
		console.error(
			`Ошибка при очистке директории ${dirPath}:`,
			error.message
		);
	}
}

/**
 * Очистить содержимое папки logs
 */
function clear() {
	return new Promise((resolve, reject) => {
		try {
			// Проверяем существование папки
			if (!fs.existsSync(logsPath)) {
				return {
					success: false,
					error: 'Папка logs не найдена',
					path: logsPath,
				};
			}

			// Получаем информацию до удаления
			const infoBefore = info();

			// Удаляем содержимое
			removeDirectoryContents(logsPath);

			return resolve({
				success: true,
				path: logsPath,
				deletedFiles: infoBefore.filesCount,
				freedSpace: infoBefore.formattedSize,
				message: `Удалено файлов: ${infoBefore.filesCount}, освобождено: ${infoBefore.formattedSize}`,
			});
		} catch (error) {
			return reject({
				success: false,
				error: 'Ошибка при очистке папки logs',
				message: error.message,
			});
		}
	});
}

module.exports = { info, clear };
