import fan from './fan';
import mois from './mois';
import temp from './temp';
import valve from './valve';
import alarm from './alarm';
import calcMois from './calc_mois';
import heating from './heating';
import product from './product';
import mode from './mode';
import isAlarm from './alarm';
import automode from './automode';

const def = {
	fan,
	mois,
	temp,
	valve,
	alarm,
	isAlarm,
	calcMois,
	heating,
	product,
	mode,
	automode,
	co2: { on: '/img/cold/co/co2.svg' },
	pressure: { on: '/img/periphery/pressure/on.svg' },
};
export default def;
