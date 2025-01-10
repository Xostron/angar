export default function Fan({ img, state }) {
	let cl = ['gr-sens-fan-img']
	if (state === 'run') cl.push('a-run')
	cl = cl.join(' ')
	return <div className='gr-sens-fan'>{!!img ? <img className={cl} src={img} /> : <span className='gr-sens-empty'></span>}</div>
}
