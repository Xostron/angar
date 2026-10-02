import Button from '@src/shared/ui/button/btn';
import style from './style.module.css';

const DescContainer = ({ children, stl }) => {
  return (
    <section className={style.container} style={stl}>
      <div className={style.content}>{children}</div>

      <div className={style.buttons}>
        <Button
          label="Сбросить"
          variant="usual"
          active={true}
          disabled={false}
        />
      </div>
    </section>
  );
};

export default DescContainer;
