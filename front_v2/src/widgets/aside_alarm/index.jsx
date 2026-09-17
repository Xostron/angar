import useInputStore from '@src/entities/store/input';
import IncidentInline from '@src/shared/ui/incident/inline';
import IncidentJump from '@src/shared/ui/incident/jump';
import IncidentBox from '@src/entities/incident_box';
import style from './style.module.css';

//   Левая боковая панель - аварии склада
function AsideAlarm({ idB }) {
  //   Авторежим
  const am = useInputStore((s) => s?.input?.retain?.[idB]?.automode);
  //   Критические аварии
  const alarm = useInputStore((s) => s?.alarm?.monit?.critical?.[idB]?.[0]);
  //   Аварии авторежимов
  const notification = useInputStore(
    (s) => s?.alarm?.monit?.warning?.[idB]?.[0],
  );
  //   Сообщения достижений
  const achieve = useInputStore((s) => s?.alarm?.achieve?.[idB]?.[0]);
  //   Кол-во аварий
  const count = useInputStore((s) => s?.alarm?.count?.[idB]);
  return (
    <aside className={style.container}>
      <section className={style.incident}>
        <IncidentBox
          type="notification"
          err={{ ...notification, code: am + '_' + notification?.code }}
        />
        <IncidentBox type="alarm" err={alarm} />
        <IncidentJump count={count} min={2} />
      </section>
      <section className={style.achieve}>
        <IncidentInline msg={achieve?.msg} />
      </section>
    </aside>
  );
}

export default AsideAlarm;
