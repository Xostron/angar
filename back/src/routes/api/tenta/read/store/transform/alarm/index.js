function alarm(idB, idS, data) {
    const timer = Object.values(data?.alarm?.timer?.[idB] ?? {}).map((el) => ({ code: el?.type, msg: el?.msg }))
    if(idS) {
         // Аварии авторежима секции
        const a = Object.keys(data?.alarm?.bar?.[idB]?.[idS] ?? {})
        .map((k) => {
            const alr = data?.alarm?.bar?.[idB]?.[idS]?.[k]?.[0]
            return alr ? { code: k, msg: alr?.msg } : null
        })
        .filter((el) => !!el)
        a.push(...timer)
        return a

    }
    const a = Object.keys(data?.alarm?.barB?.[idB] ?? {})
    .map((k) => {
        const alr = data?.alarm?.barB?.[idB]?.[k]?.[0]
        return alr ? { code: k, msg: alr?.msg } : null
    })
    .filter((el) => !!el)
    a.push(...timer)
    return  a
}

module.exports = alarm