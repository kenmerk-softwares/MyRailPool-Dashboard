import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserCog, 
  ShieldAlert, 
  Building2, 
  ChevronRight,
  Settings as SettingsIcon,
  Users
} from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  const settingsOptions = [
    {
      title: 'Employee Settings',
      description: 'Configure employee profiles, define organizational roles, and manage access permissions.',
      icon: <UserCog className="w-7 h-7" />,
      path: '/employee-settings',
      color: 'blue'
    },
    {
      title: 'Admin Settings',
      description: 'Access system configuration keys, security protocols, and administrative control tools.',
      icon: <ShieldAlert className="w-7 h-7" />,
      path: '/admin-settings',
      color: 'purple'
    },
    {
      title: 'Admin User Management',
      description: 'Manage administrative accounts, track activity logs, and monitor system access.',
      icon: <Users className="w-7 h-7" />,
      path: '/admin-users',
      color: 'emerald'
    },
    {
      title: 'Company Profile',
      description: 'Update company information, business addresses, and official contact details.',
      icon: <Building2 className="w-7 h-7" />,
      path: '/company-settings',
      color: 'orange'
    }
  ];

  return (
    <div className="settings-container">
      <SectionHeader 
        title="Settings & Configuration"
        subtitle="Manage your application infrastructure, user permissions, and company preferences from a centralized hub."
        actionIcon={SettingsIcon}
      />

      <div className="settings-grid">
        {settingsOptions.map((option, index) => (
          <div
            key={index}
            className={`settings-card ${option.color}`}
            onClick={() => navigate(option.path)}
          >
            <div className="settings-icon-wrapper">
              {option.icon}
            </div>
            <div className="settings-content">
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
            <div className="settings-arrow-wrapper">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
