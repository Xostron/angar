import style from './style.module.css';

const SignalContainer = ({ children, stl }) => {
  return <section className={style.container} style={stl}>
	{children}
  </section>;
};

export default SignalContainer;
