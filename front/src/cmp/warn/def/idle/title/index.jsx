// Заголовок модального окна
export default function Title({ name }) {
	return (
		<div className='idle-title'>
			<img src={'/img/gear.svg'} />
			<span>{name}</span>
		</div>
	)
}
