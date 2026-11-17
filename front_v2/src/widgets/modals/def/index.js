import turnoff from './turn_off';
import turnon from './turn_on';
import login from './login';
import logout from './logout';
import sensor from './sensor';
import Button from '@src/shared/ui/button/btn';
import ConfirmAction from './confirm_action';

const defModal = {
  turnoff,
  turnon,
  login,
  logout,
  sensor,
  ConfirmAction,
  WARN_WAREHOUSE: ({ closeModal, refDialog }) => <div>⚠️ Внимание: </div>,
};

export default defModal;
