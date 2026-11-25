import turnoff from './turn_off';
import turnon from './turn_on';
import login from './login';
import logout from './logout';
import sensor from './sensor';
import ConfirmAction from './confirm_action';
import section from './section_mode';
import valve from './valve';
import fanao from './fanao';
const defModal = {
  turnoff,
  turnon,
  login,
  logout,
  sensor,
  section,
  valve,
  fanao,
  ConfirmAction,
  WARN_WAREHOUSE: ({ closeModal, refDialog }) => <div>⚠️ Внимание: </div>,
};

export default defModal;
