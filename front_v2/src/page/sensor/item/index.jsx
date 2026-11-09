import style from 'style.module.css';

function Item({}) {
	 
  return (
    <div>
      {[].map((el, i) => (
        <Sensor key={i} />
      ))}
    </div>
  );
}

export default Item;

function Sensor({}) {}
