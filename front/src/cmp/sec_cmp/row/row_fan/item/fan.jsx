import defImg from '@tool/icon'
import Btn from '@cmp/fields/btn'
/**
 *
 * @param {string} type cooler - испаритель, по-умолчанию - ВНО
 * @returns
 */
export default function ItemFan({ data, onClick, isAuth, cls }) {
	// Задание ПЧ
	let sp = ''
	if (data?.sp !== undefined) {
		if (isNaN(data?.sp)) sp = '-'
		else sp = data?.sp + '%'
	}
	// Стили
	const imgF = defImg.fan?.[data.state]
	let cl = ['cmp-sec-row-item', cls]
	if (sp) cl.push('fc')
	if (data.state === 'off') cl.push('off')
	if (data.state === 'run') cl.push('sir-item-run')
	if (isAuth) cl.push('auth-sir')
	cl = cl.join(' ')

	return <Btn onClick={() => onClick(data)} icon={imgF} txt={sp} cls={cl} />
}
