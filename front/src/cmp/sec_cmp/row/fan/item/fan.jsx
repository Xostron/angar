import defImg from '@tool/icon'
import Btn from '@cmp/fields/btn'
/**
 *
 * @param {string} type cooler - испаритель, по-умолчанию - ВНО
 * @returns
 */
export default function ItemFan({ data, onClick, isAuth, cls }) {
	// Задание ПЧ
	let value = ''
	if (data?.value !== undefined) {
		if (isNaN(data?.value)) value = '--'
		else value = data?.value + '%'
	}
	// Стили
	const imgF = defImg.fan?.run
	let cl = ['cmp-sec-row-item', cls]
	if (value) cl.push('fc')
	if (data.state === 'alarm') cl.push('alarm')
	if (data.state === 'off') cl.push('off')
	if (data.state === 'run') cl.push('sir-item-run')
	if (isAuth) cl.push('auth-sir')
	cl = cl.join(' ')

	return <Btn onClick={() => onClick(data)} icon={imgF} txt={value} cls={cl} />
}
