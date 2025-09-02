import React from 'react';

const samplePatients = [
  'Alberto', 'Cauan', 'Daniel', 'Edmundo', 'Fernanda',
  'Gabriel', 'Hyago', 'Lucas', 'Juvenal', 'Kaio', 'Lucas', 'Minotauro'
];

const PatientsList = () => {
  return (
    <div className="panel">
      <div className="panel-title">Pacientes</div>
      <div className="patients">
        <ul className="patients-list">
          {samplePatients.map((name, i) => (
            <li className="patients-item" key={i}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatientsList;

