import Valve from '../valve';
import style from './style.module.css';

function ValveGroup({ valve = [] }) {
//   console.log(12, valve);
  if (!valve.length) return <></>;
  return (
    <div className={style.container}>
      {valve.map((el) => (
        <Valve data={el} />
      ))}
    </div>
  );
}

export default ValveGroup;
