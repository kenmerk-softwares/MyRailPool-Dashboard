import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Building2, 
  ChevronRight,
  FileText,
  Settings as SettingsIcon,
  Users,
  Coins
} from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import { BookingChargePopup } from './BookingChargePopup';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const [showBookingChargePopup, setShowBookingChargePopup] = useState(false);

  const settingsOptions = [
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
      title: 'Booking Charges',
      description: 'Update the system booking fee applied during customer checkout.',
      icon: <Coins className="w-7 h-7" />,
      color: 'blue',
      onClick: () => setShowBookingChargePopup(true)
    },
    {
      title: 'Company Profile',
      description: 'Update company information, business addresses, and official contact details.',
      icon: <Building2 className="w-7 h-7" />,
      path: '/company-settings',
      color: 'orange'
    },
    {
      title: 'Terms&Conditions',
      description: 'Update terms and conditions.',
      icon: <FileText className="w-7 h-7" />,
      path: '/terms-conditions',
      color: 'orange'
    },
    {
      title: 'Privacy Policy',
      description: 'Update privacy policy.',
      icon: <FileText className="w-7 h-7" />,
      path: '/privacy-policy',
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
            onClick={() => {
              if (option.onClick) {
                option.onClick();
              } else {
                navigate(option.path);
              }
            }}
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

      <BookingChargePopup 
        isOpen={showBookingChargePopup} 
        onClose={() => setShowBookingChargePopup(false)} 
      />
    </div>
  );
}

