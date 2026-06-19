import React, { useState, useEffect } from 'react';
import { X, Coins, HelpCircle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';
import { useToast } from '../../shared/hooks/ToastContext';
import './BookingChargePopup.css';

export const BookingChargePopup = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [amount, setAmount] = useState('0');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCharge = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'configurations', 'booking-charge');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const currentAmount = data.amount ?? data.charge?.amount ?? 0;
          setAmount(String(currentAmount));
        } else {
          setAmount('0');
        }
      } catch (error) {
        console.error('Error fetching booking charge:', error);
        showToast('Failed to load current booking charge', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchCharge();
  }, [isOpen, db, showToast]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const numericAmount = Number(amount);
    
    if (amount.trim() === '' || isNaN(numericAmount) || numericAmount < 0) {
      showToast('Please enter a valid, non-negative amount.', 'error');
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, 'configurations', 'booking-charge');
      await setDoc(
        docRef,
        {
          amount: numericAmount,
          charge: {
            amount: numericAmount,
          },
          updatedAt: new Date(),
        },
        { merge: true }
      );

      showToast('Booking charge updated successfully', 'success');
      onClose();
    } catch (error) {
      console.error('Error saving booking charge:', error);
      showToast('Failed to update booking charge', 'error');
    } finally {
      setSaving(false);
    }
  };

  const presets = [0, 2, 5, 10, 20];

  return (
    <div className="booking-charge-overlay animate-in fade-in duration-200">
      <div className="booking-charge-modal animate-in slide-in-from-bottom-5 duration-300">
        
        {/* Header */}
        <div className="booking-charge-header">
          <div className="booking-charge-title-group">
            <div className="booking-charge-icon-wrapper">
              <Coins className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="booking-charge-title">Booking Fee Configuration</h2>
              <p className="booking-charge-subtitle">Modify the default fee charged during booking checkout.</p>
            </div>
          </div>
          <button 
            type="button" 
            className="booking-charge-close-btn"
            onClick={onClose}
            disabled={saving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="booking-charge-loading-container">
            <div className="booking-charge-spinner"></div>
            <p>Retrieving configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="booking-charge-form">
            <div className="booking-charge-input-section">
              <label htmlFor="booking-charge-input" className="booking-charge-label">
                Booking Charge (GBP)
              </label>
              
              <div className="booking-charge-input-wrapper">
                <span className="booking-charge-currency-prefix">£</span>
                <input
                  id="booking-charge-input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="booking-charge-field"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  disabled={saving}
                  autoFocus
                />
              </div>
            </div>

            {/* Presets */}
            <div className="booking-charge-presets-section">
              <span className="booking-charge-presets-label">Quick Presets</span>
              <div className="booking-charge-presets-grid">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`booking-charge-preset-pill ${Number(amount) === preset ? 'active' : ''}`}
                    onClick={() => setAmount(String(preset))}
                    disabled={saving}
                  >
                    £{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Hint Alert */}
            <div className="booking-charge-info-alert">
              <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
              <p className="booking-charge-info-text">
                The updated charge will be applied to all new online & offline customer bookings immediately.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="booking-charge-footer">
              <button
                type="button"
                className="booking-charge-btn-secondary"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="booking-charge-btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="booking-charge-button-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
