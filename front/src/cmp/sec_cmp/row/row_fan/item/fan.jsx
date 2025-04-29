import useInputStore from '@store/input'
import defImg from '@tool/icon'
import Btn from '@cmp/fields/btn'
/**
 *
 * @param {string} type cooler - испаритель, по-умолчанию - ВНО
 * @returns
 */
export default function ItemFan({ data, action, locked, cls }) {
	// Задание ПЧ
	let value = ''
	if (data?.value !== undefined){
		if (isNaN(data?.value)) value = '-'
		else value = Math.trunc(data?.value / 10) + '%'
	}
	// Стили
	const imgF = defImg.fan?.[data.state]
	let cl = ['cmp-sec-row-item', cls]
	if (value) cl.push('fc')
	if (data.state === 'off') cl.push('off')
	if (data.state === 'run') cl.push('sir-item-run')
	if (!locked) cl.push('auth-sir')
	cl = cl.join(' ')

	return <Btn onClick={action} icon={imgF} txt={value} cls={cl} />
}
