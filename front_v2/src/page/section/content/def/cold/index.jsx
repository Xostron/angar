import useInputStore from '@src/entities/store/input';
import style from './style.module.css';

function Section({ idB, idS }) {
  const data = useInputStore((s) => s?.input?.innerSec?.[idB]?.[idS]);
  return <section className={style.container}>{/*  */}</section>;
}

export default Section;