import defImg from '@tool/icon'
import defUn from '@tool/unit'
import Btn from '@cmp/fields/btn'

export default function Item({ state, action, cls, locked }) {
	const imgF = defImg.fan?.['off']
	let cl = ['sir-item', cls]
	if (state === 'off') cl.push('sir-item-off')
	if (state === 'run') cl.push('sir-item-run')
	if (!locked) cl.push('auth-sir')
	cl = cl.join(' ')

	return <Btn onClick={action} icon={imgF} cls={[cl, 'sir-item-act'].join(' ')} />
}
