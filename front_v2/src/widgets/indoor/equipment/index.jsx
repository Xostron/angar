import TextEquip from '@src/shared/ui/text/equipment';
import style from './style.module.css';

function Equipment({ data = [] }) {
  if (!data.length) return <></>;
  return (
    <div className={style.container}>
      {data.map((el) => (
        <TextEquip name={el.name} value={el.value} />
      ))}
    </div>
  );
}

export default Equipment;
