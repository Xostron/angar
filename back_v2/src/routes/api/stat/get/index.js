const fs = require('fs');
const path = require('path');

function get() {
    return function (req, res) {
        const dir = process.env.PATH_LOG;
        const now = new Date();
        now.setMinutes(0, 0, 0);
        fs.readdir(dir, (err, files)=>{
            if(err) return res.status(500).json({error: "Ошибка получения списка файлов"});
            files = files
                .filter(file => !file.startsWith('.'))
                .filter(file => {
                    const fPath = path.join(dir, file);
                    try {
                        const size = fs.statSync(fPath).size
                        const dt = fs.statSync(fPath).mtime
                        return size > 0 && dt < now;
                    } catch (error) {
                        console.error(`Ошибка получения данных файла:${fPath}:`, error); 
                        return false;
                    }
                });
            res.json(files);
        })

    }
}

module.exports= get