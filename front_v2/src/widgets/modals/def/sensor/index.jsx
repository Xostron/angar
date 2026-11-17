import style from './style.module.css';
import Button from '@src/shared/ui/button/btn';
import { Sensor } from '@src/page/sensor/items/sensor';
import useOutputStore from '@src/entities/store/output';

export default function SensorModal({
  idB,
  list,
  title,
  code,
  closeModal,
  refDialog,
}) {
  const sendSens = useOutputStore((s) => s.sendSens);
  // Фон модалки
  if (refDialog.current)
    refDialog.current.style.backgroundColor = 'var(--c-grey-lighter)';

  return (
    <div className={style.entry}>
      <h2 className={style.title}>{title}</h2>
      <div className={style.sensor}>
        {list
          .sort((a, b) => a?.order - b?.order)
          .map((el, i) => (
            <Sensor
              key={i}
              el={el}
              code={code}
              idB={idB}
              cls={style.padding12}
            />
          ))}
      </div>
      <div className={style.buttons}>
        <Button
          label="Отмена"
          active={false}
          onClick={() => {
            closeModal();
          }}
          variant="usual"
        />
        <Button
          label="Сохранить"
          active={true}
          onClick={() => {
            sendSens();
            closeModal();
          }}
          variant="usual"
        />
      </div>
    </div>
  );
}
