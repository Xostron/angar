//Заголовок сообщения
export default function Title({ title, icon }) {
	icon = typeof icon === 'string' ? <img src={icon} /> : icon
	return (
		<div className='entry-title'>
			{icon}
			<p>{title}</p>
		</div>
	)
}
