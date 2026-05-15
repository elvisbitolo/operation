import React from 'react';
import data from './data3.json';

class Example1 extends React.Component {
  render() {
    return (
      <div className="mb-4">
        <h4 className="text-primary">Social Medias</h4>
        <ul className="list-group">
          {data.SocialMedias.map((url, index) => (
            <li key={index} className="list-group-item">
              <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

class Example2 extends React.Component {
  render() {
    return (
      <div className="mb-4">
        <h4 className="text-success">Skills</h4>
        {data.Skills.map((skillGroup, index) => (
          <div key={index} className="mb-3">
            <h5 className="text-secondary">{skillGroup.Area}</h5>
            <ul className="list-group list-group-flush">
              {skillGroup.SkillSet.map((skill, sIndex) => (
                <li key={sIndex} className="list-group-item bg-light border-0">
                  {skill.Name} {skill.Hot && <span className="badge bg-danger ms-2">HOT</span>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

class Example3 extends React.Component {
  render() {
    return (
      <div className="mb-4">
        <h4 className="text-info">Experiences</h4>
        {data.Experiences.map((exp, index) => (
          <div key={index} className="card mb-3 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <img src={exp.logo} alt={exp.companyName} width="50" className="me-3 object-fit-contain" />
                <h5 className="card-title mb-0"><a href={exp.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{exp.companyName}</a></h5>
              </div>
              {exp.roles.map((role, rIndex) => (
                <div key={rIndex} className="mb-2 ms-4 border-start border-3 border-info ps-3 py-1">
                  <h6 className="card-subtitle mb-1 text-muted">{role.title}</h6>
                  <p className="card-text small mb-1">{role.startDate} - {role.endDate} | {role.location}</p>
                  <p className="card-text">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export { Example1, Example2, Example3 };
