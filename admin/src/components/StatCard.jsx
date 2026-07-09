import './StatCard.css';

const StatCard = ({ label, value, icon: Icon, tone = 'default' }) => (
  <div className={`stat-card card tone-${tone}`}>
    <div className="stat-icon">
      <Icon size={20} />
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
  </div>
);

export default StatCard;
