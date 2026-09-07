import style from './style.module.css';

function CountAlr({ num }) {
  if (!num) return <></>;

  return (
    <div className={style.container}>
      <img src="/icon/indicator/alert.svg" />
      <span>{num}</span>
    </div>
  );
}

export default CountAlr;
