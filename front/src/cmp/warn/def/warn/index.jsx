import Control from './control'
import Title from './title'

export default function WarnEnt({ data, entryCode }) {
	const { type = 'info', title, text, action } = data
	const icon = type === 'info' ? '/img/info.svg' : '/img/warn.svg'
	return (
		<div className='entry'>
			<Title icon={icon} title={title} />
			<p>{text}</p>
			<Control data={data} />
		</div>
	)
}