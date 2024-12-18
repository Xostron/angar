// Обрабатываем секции - краткая информация
function sections(idB, list, data, obj ) {
    // Получаем данные для конкретного здания из хранилища
    const bldData = data.retain?.[idB]
    const {heating, valve, fan} = obj
    const r = {}
    list.forEach(el=>{
        if (el.buildingId !== idB) return
        const o = {
            _id: el._id,
            name: el.name,
            // Режим работы секции
            mode: bldData?.mode?.[el._id] ?? null,
            // Минимальная и максимальная температура продукта в секции
            min: {
                value: data?.total?.[el._id]?.tprd?.min?.toFixed(1) ?? undefined,
                state: data?.total?.[el._id]?.tprd?.state,
            },
            max: {
                value: data?.total?.[el._id]?.tprd?.max?.toFixed(1) ?? undefined,
                state: data?.total?.[el._id]?.tprd?.state,
            },
            // Клапаны секции
            valve: {},
            // Статус вентилятора секции (по умолчанию "остановлен")
            fan: 'stop',
        }
        // Обогрев клапанов секции
        const heatingId = heating.find((e) => e.owner.id === el._id)?._id
        if (heatingId) o.heating = data?.outputEq?.[heatingId]

        // Получем данные для o.valve
        valve.forEach((v) => {
            if (!v.sectionId.includes(el._id)) return
            o.valve[v._id] = {
                val: data?.[v._id]?.val,
                state: data?.[v._id]?.state,
            }
        })
        // Обработка вентиляторов секции
        fan.forEach((e) => {
            if (e.owner.id !== el._id || e.type !== 'fan') return
            const need = ['alarm', 'run']
            // Если текущий статус вентилятора "alarm", пропускаем дальнейшую обработку
            if (o.fan === need[0]) return
            const st = data?.[e._id]?.state
            if (!st) return
            if (need.includes(st)) o.fan = st
        })

        r[el._id] = o
       
    })
    return r
}

module.exports = sections