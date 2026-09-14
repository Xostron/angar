import Button from '@src/shared/ui/button/btn';

function Start({}) {
  return (
    <section>
      <span></span>
      <div>
        <span></span>
        <span></span>
        <span></span>
      </div>
      <img src="/icon/indicator/modal_warning.svg" alt="" />
      <span></span>
      <span></span>
      <div>
        <Button label="Отмена" />
        <Button label="Отключить" />
      </div>
    </section>
  );
}

export default Start;
