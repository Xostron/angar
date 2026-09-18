import style from './style.module.css';

function FlexContainer({ idB, idS, title, children }) {
  return (
    <div className={style.container}>
      <span>{title}</span>
      <div className={style.content}>{children}</div>
    </div>
  );
}

export default FlexContainer;
