import TextEquip from '@src/shared/ui/text/equipment';
import style from './style.module.css';

function Equipment({ data = [] }) {
  data = [1, 2, 3, 4, 5, 6];
  if (!data.length) return <></>;
  return (
    <div className={style.container}>
      {data.map((el) => (
        <TextEquip name="Разгон. вент." value={true} />
      ))}
    </div>
  );
}

export default Equipment;
