import style from './single.module.css';
import EquipSt from '@src/shared/ui/icon/equipment';
import TextSensRow from '@src/shared/ui/text/sensor_row';
import TextIcEquipV2 from '@src/shared/ui/text/equipment_icon_v2';
import useModalStore from '@src/entities/store/modal';

// Виджет контуров 1, 2шт
function Single({ data = {}, idB, idS }) {
  const { list = [], comfan = [] } = data;
  const openModal = useModalStore((s) => s.open);
  return (
    <article className={style.container}>
      <span>{list.length > 1 ? 'Контуры' : 'Контур'}</span>
      <div className={`${style.cards} ${comfan?.length ? style.rounded : ''}`}>
        {!!list.length &&
          list.map((el) => (
            <Card
              idB={idB}
              idS={idS}
              key={el._id}
              el={el}
              comfanLength={comfan?.length}
            />
          ))}
      </div>
      {/* Общий ВНО этих контуров */}
      {!!comfan?.length && (
        <div className={style.comfan}>
          <TextIcEquipV2
            code="cooler"
            name="Вент."
            value={comfan?.[0]?.value}
            state={comfan?.[0]?.state}
            onClick={() => openModal('fanao', { idB, idS, data: comfan[0] })}
            styl={{ opacity: comfan?.[0]?.state === 'off' ? 0.5 : 1 }}
          />
        </div>
      )}
    </article>
  );
}

export default Single;

// Карточка контура
function Card({ idB, idS, el, comfanLength }) {
  const { name, aggregate, condenser, state, fan, tmpCooler, pin, pout } = el;
  const openModal = useModalStore((s) => s.open);
  const stlCards = !comfanLength
    ? { paddingBottom: '16px', width: '321px' } //Нет общего ВНО
    : { width: '292px' }; // Есть общий ВНО

  return (
    <div className={`${style.card}`} style={stlCards}>
      <span>{name}</span>
      <div className={style.pressure}>
        <TextSensRow
          name="Дав. всасывания"
          value={pin?.min}
          state={pin?.state}
          unit="Бар"
        />
        <TextSensRow
          name="Дав. нагнетания"
          value={pout?.min}
          state={pout?.state}
          unit="Бар"
        />
      </div>
      <div className={style.equipment}>
        <EquipSt code="aggregate" data={aggregate} />
        <EquipSt code="condenser" data={condenser} />
      </div>
      <div className={style.state}>
        <TextSensRow
          name={state}
          value={tmpCooler?.min}
          state={tmpCooler?.state}
          unit="grad"
          styleName={{ color: 'var(--c-blue-darker)' }}
        />
      </div>
      {/* нет общего ВНО-comfan, рисуем ВНО данного испарителя */}
      {!comfanLength && (
        <TextIcEquipV2
          code="cooler"
          name="Вент."
          value={fan?.value}
          state={fan?.state}
          onClick={() => openModal('fanao', { idB, idS, data: fan })}
          styl={{ opacity: fan?.state === 'off' ? 0.5 : 1 }}
        />
      )}
    </div>
  );
}
