const fs = require('fs');
const path = require('path');

// Функция удаления файла лога
function del() {
    return function (req, res) {
        const name = req.params.name
        if(!name) return res.status(404)
        const fPath = path.join(process.env.PATH_LOG, name)
        fs.unlink(fPath, (err) => {
            if (err) {
                console.error(err)
                return res.status(400).json({error: 'Ошибка при удалении файла: '+name});
            }
            res.json({result: true})
        });
    }
}

module.exports= del