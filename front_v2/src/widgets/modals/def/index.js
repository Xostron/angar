import turnoff from './turn_off';
import turnon from './turn_on';
import login from './login';
import logout from './logout';
import sensor from './sensor';
import ConfirmAction from './confirm_action';
import section from './section';

const defModal = {
  turnoff,
  turnon,
  login,
  logout,
  sensor,
  section,
  ConfirmAction,
  WARN_WAREHOUSE: ({ closeModal, refDialog }) => <div>⚠️ Внимание: </div>,
};

export default defModal;
