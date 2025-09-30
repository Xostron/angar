import defImg from '@tool/icon/alarm'

export default function Item({ el, cls }) {
	return (
		<div className={cls}>
			<img src={defImg[el.type]} />
			<span>{el.msg}</span>
		</div>
	)
}
