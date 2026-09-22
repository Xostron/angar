import TextEquip from '@src/shared/ui/text/equipment';
import style from './style.module.css';
import { useParams } from 'react-router-dom';

function Equipment({ data = [] }) {
  const { sectionId: idS } = useParams();
  if (!data.length) return <></>;
  return (
    <div className={style.container}>
      {data.map((el, i) =>
        !el?.[idS] ? (
          <TextEquip key={i} name={el.name} value={el.value} />
        ) : (
          <TextEquip key={i} name={el[idS].name} value={el[idS].value} />
        ),
      )}
    </div>
  );
}

export default Equipment;
