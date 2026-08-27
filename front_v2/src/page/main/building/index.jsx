import './style.css';

const Building = ({ data }) => {
  return (
    <div className="building_card">
      {/* {data.name} */}
	  <div className="building_card_hdr">
			<div></div>
			<div>
				<span>{data.name}</span>
				<span>{data.code}</span>
			</div>
			<div>
				<span>{data.mode}</span>
			</div>
	  </div>
	  <div>

	  </div>
	  <div>
		<div></div>
		<span>Вентиляция</span>
		<span>ВКЛ</span>
	  </div>
	  <div>
		<div></div>
		<div></div>
		<div></div>
	  </div>
	  <div>
		<span>t задания канала 12°С, t задания продукта 11°С</span>
	  </div>
    </div>
  );
};

export default Building;
