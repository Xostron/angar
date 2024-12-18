function banner(idB, data) {
   return  Object.keys(data?.alarm?.banner ?? {})
   .map((k) => {
       const ba =
           k === 'local'
               ? Object.values(data?.alarm?.banner?.[k]?.[idB] ?? {})?.filter((el) => el !== null)
               : data?.alarm?.banner?.[k]?.[idB]
       switch (k) {
           case 'local':
               return ba?.length ? { code: k, msg: ba?.[0]?.msg } : null

           case 'connect':
               return ba ? { code: k, msg: ba.msg } : null
       }
   })
   .filter((el) => !!el) 
}

module.exports = banner