import useInputStore from '@src/entities/store/input'
import style from './style.module.css';

function Alarm({idB}) {
  //   Левая боковая панель - аварии склада
  const alarm = useInputStore((s) => s?.input?.sBarB?.[idB]);
  console.log(2, alarm);
  return <aside className={style.container}></aside>;
}

export default Alarm;
