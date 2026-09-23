import TextEquip from '@src/shared/ui/text/equipment';
import style from './style.module.css';
import { useParams } from 'react-router-dom';

/**
 * Статус оборудования (список определяется на back)
 * 
 * @param {*} data = [
 * 		оборудование работающее на весь склад
 * 		{name: 'Демо', value: 'Выкл'},
 *  	оборудование привязанное к секции
		{
			статус для секции 1
			6800bbc056c6a01c90ecbc84:{name: 'Подогрев канала', value: 'Вкл'}
			Статус для секции 2
			6800bdcc05912407c0b68bd3:{name: 'Подогрев канала', value: 'Выкл'}
			Суммарный статус
			total:{name: 'Подогрев канала', value: 'Вкл'}
		}
	]
 * @returns 
 */
function Equipment({ data = [] }) {
  const { sectionId: idS } = useParams();
  if (!data.length) return <></>;
  console.log(2, idS, data);

  return (
    <div className={style.container}>
      {data.map((el, i) => {
        // Для страницы карточки секций
        if (!idS) {
          if (el.total)
            // Общий для склада
            return (
              <TextEquip key={i} name={el.total.name} value={el.total.value} />
            );
          // Просто общий (например окуривание, демо...)
          return <TextEquip key={i} name={el.name} value={el.value} />;
        }
        // Для страницы содержимое секции:
        // 1 - для текущей секции
        // 2 - Просто общий  (например окуривание, демо...)
        return el?.[idS] ? (
          <TextEquip key={i} name={el[idS].name} value={el[idS].value} />
        ) : (
          <TextEquip key={i} name={el.name} value={el.value} />
        );
      })}
    </div>
  );
}

export default Equipment;
