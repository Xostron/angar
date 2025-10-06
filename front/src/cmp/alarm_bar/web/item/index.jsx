import defImg from '@tool/icon'

//Элемент аварийных индикаторов
/**
 *
 * @param  {type} вид ошибки|таймера запрета
 * @returns
 */
export default function Item({ data, show }) {
	if (!data) return
	const { code, msg, type } = data
	const img = defImg.alarm?.[type] || defImg.alarm?.[code]
	console.log(111, data, code, type, img)
	let cls = ['indi-item-img']
	code === 'alr' ? cls.push('indi-item-square') : {}

	let cl = ['indi-item-hide']
	show ? cl.push('indi-item-show') : {}

	cl = cl.join(' ')
	cls = cls.join(' ')
	return (
		<div className='indi-item'>
			<div className={cls}>
				<img src={img} title={msg} />
			</div>
			<span className={cl}>{msg}</span>
		</div>
	)
}
