import Control from './control'
import Title from './title'

export default function WarnEnt({ data, entryCode }) {
	const { type = 'info', title, text, action } = data
	let icon
	switch (type) {
		case 'info':
			icon = '/img/info.svg'
			break
		case 'attention':
			// icon = <>⚠️</>
			icon = <div className='cmp-warn-icon'>⚠️</div>
			break
		default:
			icon = '/img/warn.svg'
	}
	return (
		<div className='entry'>
			<Title icon={icon} title={title} />
			<p>{text}</p>
			<Control data={data} />
		</div>
	)
}
