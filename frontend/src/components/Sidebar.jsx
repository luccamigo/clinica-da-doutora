// Navegação lateral com realce da rota ativa
import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.scss';

const Sidebar = ({ onNavigate }) => (
  <div>
    <div className={styles.brand}>
      <div className={styles.brandTitle}>Portal da</div>
      <div className={styles.brandSubtitle}>Doutora</div>
    </div>
    <nav className={`${styles.nav} nav nav-pills flex-column gap-2`} onClick={() => onNavigate && onNavigate()}>
      <NavLink to="/pacientes" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''} nav-link`}>Pacientes</NavLink>
      <NavLink to="/agenda" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''} nav-link`}>Agenda</NavLink>
      <NavLink to="/estoque" className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''} nav-link`}>Estoque</NavLink>
    </nav>
  </div>
);

export default Sidebar;
