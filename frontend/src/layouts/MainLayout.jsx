// Layout base: Sidebar fixa + área de conteúdo com Outlet das páginas
import { Outlet } from 'react-router-dom';
import styles from './MainLayout.module.scss';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>
      <main className={styles.content}>
        <div className={styles.header}>
          <div className={styles.actions} />
        </div>
        {/* Outlet renderiza a página atual */}
        <Outlet />
      </main>
    </div>
  );
}
