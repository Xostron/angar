import './style.css';

const Sidebar = ({ children, type = 'left' }) => {
  let cls = 'sidebar';
  if (type == 'right') cls += ' right';
  return <aside className={cls}>{children}</aside>;
};

export default Sidebar;
