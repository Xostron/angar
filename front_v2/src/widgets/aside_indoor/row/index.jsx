import TextSensRow from '@src/shared/ui/text/sensor_row';
import style from './style.module.css';

function Sensor({ data }) {
  return (
    <div className={style.container}>
      <TextSensRow name="Темп." value={data.tin} unit="grad" />
      <TextSensRow name="Отн. вл." value={data.hin} unit="per" />
      <TextSensRow name="Абс. вл." value={data.habsin} unit="hum" />
      {data.co2 !== null && (
        <TextSensRow name="Угл. газ" value={data.co2} unit="ppm" />
      )}
      <TextSensRow name="Электроэнергия" value={data.energyKwh} unit="кВт·ч" />
    </div>
  );
}

function Status({ data }) {
  return (
    <div className={style.containerStatus}>
      <TextSensRow name="Продукт" value={data?.product?.name} />
      {data?.type !== 'cold' && (
        <TextSensRow name="Режим" value={data?.automode?.name} />
      )}
    </div>
  );
}

export { Sensor, Status };
