

//Заголовок сообщения
export default function Title({title, icon}) {

	return (
		<div className="entry-title">
			<img src={icon}/>
			<p>{title}</p>
		</div>
	)
}