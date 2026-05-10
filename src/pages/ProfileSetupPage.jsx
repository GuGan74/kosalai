import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import logoImg from '../assets/kosalai-logo-removebg-preview.png';
import loadingGif from '../assets/379.gif';
import './SplashPage.css';

const DISTRICTS = [
  { group: '── Tamil Nadu', opts: ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'] },
  { group: '── Andhra Pradesh', opts: ['Visakhapatnam','Vijayawada','Guntur','Nellore','Kurnool','Tirupati','Rajahmundry'] },
  { group: '── Telangana', opts: ['Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam'] },
  { group: '── Karnataka', opts: ['Bengaluru','Mysuru','Hubli','Mangaluru','Belagavi','Davangere'] },
  { group: '── Kerala', opts: ['Kochi','Thiruvananthapuram','Kozhikode','Thrissur','Kollam','Kannur'] },
  { group: '── Maharashtra', opts: ['Mumbai','Pune','Nagpur','Nashik','Aurangabad'] },
];

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { currentUser, currentProfile, loadProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!district) {
      toast.error('Please select your district');
      return;
    }
    setLoading(true);
    const formatted = '+91' + phone.replace(/\D/g, '').replace(/^91/, '');
    const { error } = await supabase
      .from('profiles')
      .update({
        phone: formatted,
        location: district,
        is_profile_complete: true,
      })
      .eq('id', currentUser.id);

    if (error) {
      toast.error('Failed to save: ' + error.message);
      setLoading(false);
      return;
    }
    await loadProfile(currentUser.id);
    toast.success('Welcome to Kosalai! 🎉');
    // Small delay so AuthContext re-renders with new profile before navigation
    setTimeout(() => navigate('/', { replace: true }), 300);
  }

  return (
    <div className="splash-wrapper">
      {/* LEFT — branding panel */}
      <div className="splash-image-panel hide-mobile" style={{ background: 'linear-gradient(160deg,#0f5228 0%,#1a7a3c 55%,#0d3d1e 100%)' }}>
        <div className="splash-img-content">
          <h1 className="splash-headline hide-mobile">
            India's Most Trusted Cattle Marketplace
          </h1>
          <p className="splash-subtext hide-mobile">
            Buy and sell cows, buffaloes, goats and pets directly with verified farmers.
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="splash-right-panel">
        <div className="splash-right-inner">
          <div className="splash-brand-top" style={{ marginBottom: 16 }}>
            <img src={logoImg} alt="Kosalai" className="splash-logo" style={{ width: 180, height: 180, marginBottom: 0 }} />
          </div>

          <div className="splash-card">
            {/* User avatar + name */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {currentProfile?.avatar_url && (
                <img
                  src={currentProfile.avatar_url}
                  alt="Profile"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentProfile?.full_name || 'User')}&background=e8f5e9&color=1a7a3c&size=72`;
                  }}
                  style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '3px solid #1a7a3c',
                    objectFit: 'cover',
                    display: 'block', margin: '0 auto 10px',
                  }}
                />
              )}
              <div style={{ fontWeight: 700, fontSize: 18, color: '#1a3c1a' }}>
                Hi, {currentProfile?.full_name}! 👋
              </div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                {currentProfile?.email}
              </div>
            </div>

            <h2 className="splash-card-title" style={{ marginBottom: 4 }}>
              One Last Step! 🎉
            </h2>
            <p className="splash-card-desc" style={{ marginBottom: 20 }}>
              Tell us your phone number and location so buyers and sellers can reach you.
            </p>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                Mobile Number
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 16, top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#374151', fontWeight: 600, fontSize: 14,
                  pointerEvents: 'none',
                }}>+91</span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit number"
                  style={{
                    paddingLeft: 54, width: '100%', boxSizing: 'border-box',
                    border: '1.5px solid #d1d5db', borderRadius: 10,
                    padding: '12px 14px 12px 54px',
                    fontSize: 14, outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            {/* District */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                Your District
              </label>
              <select
                value={district}
                onChange={e => setDistrict(e.target.value)}
                style={{
                  width: '100%',
                  border: '1.5px solid #d1d5db', borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14, outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">Select your district</option>
                {DISTRICTS.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Submit */}
            <button
              className="btn-google-white"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: '#1a7a3c',
                color: 'white',
                border: 'none',
                width: '100%',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 700,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading
                ? <img src={loadingGif} alt="Loading" style={{ width: 22, height: 22, objectFit: 'contain' }} />
                : 'Complete Setup & Enter →'
              }
            </button>
          </div>

          <p className="splash-legal hide-mobile" style={{ marginTop: 20 }}>
            Your phone number is only shared with buyers/sellers you contact.
          </p>
        </div>
      </div>
    </div>
  );
}
