import Product from './prd';

// датчики температуры продукта
export default function Tprd({ data, input }) {
	if (!data || !data.length) return null;
	return (
		<div className="bottom">
			{data.length
				? data.map((el, i) => (
						<Product key={i} state={el} data={input?.[el?._id]} />
				  ))
				: null}
		</div>
	);
}
