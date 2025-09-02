import React from 'react';

const Sidebar = () => {
  return (
    <div>
      <div className="brand" style={{ padding: '4px 8px 10px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
          Portal da
        </div>
        <div style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#1b89b3',
          lineHeight: 1.1
        }}>
          Doutora
        </div>
      </div>

      <nav className="nav">
        <a href="#estoque" className="nav-link">Gerenciar Estoque</a>
        <a href="#pacientes" className="nav-link active">Pacientes</a>
        <a href="#agenda" className="nav-link">Agenda</a>
        <a href="#pagamentos" className="nav-link">Pagamentos</a>
      </nav>
    </div>
  );
};

export default Sidebar;

