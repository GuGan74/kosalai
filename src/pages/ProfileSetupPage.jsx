import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import logoImg from '../assets/kosalai-logo-removebg-preview.png';
import LanguageSelector from '../components/LanguageSelector';
import loadingGif from '../assets/379.gif';
import { DISTRICTS } from '../constants/locations';
import { INDIAN_STATES } from '../constants/states';
import { useTranslation } from 'react-i18next';
import './SplashPage.css';

export default function ProfileSetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser, currentProfile, loadProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [state, setState] = useState(currentProfile?.state || '');
  const [district, setDistrict] = useState('');
  const [fullName, setFullName] = useState(currentProfile?.full_name || '');
  const [language, setLanguage] = useState('English');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (currentProfile?.full_name && !fullName) {
      setFullName(currentProfile.full_name);
    }
    if (currentProfile?.location) {
      if (currentProfile.location.includes(', ')) {
        const parts = currentProfile.location.split(', ');
        if (!district) setDistrict(parts[0]);
        if (!state) setState(parts[1]);
      } else {
        if (!district) setDistrict(currentProfile.location);
      }
    }
  }, [currentProfile]);

  async function handleSubmit() {
    const newErrors = {};
    const phoneDigits = phone.replace(/\D/g, '');
    if (!fullName.trim()) newErrors.fullName = true;
    if (!phoneDigits || phoneDigits.length < 10) newErrors.phone = true;
    if (!state) newErrors.state = true;
    if (!district) newErrors.district = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error(t('profileSetup.errorRequiredFields', { defaultValue: 'Please complete all required profile fields.' }));
      return;
    }
    setErrors({});
    setLoading(true);
    const formatted = '+91' + phone.replace(/\D/g, '').replace(/^91/, '');
    
    let error = null;
    // Retry up to 3 times to handle spurious Supabase 'Lock broken' abort errors
    for (let i = 0; i < 3; i++) {
        // Use upsert to guarantee the row is created even if the Postgres trigger failed
        const res = await supabase
          .from('profiles')
          .upsert({
            id: currentUser.id,
            email: currentUser.email,
            full_name: fullName.trim(),
            avatar_url: currentProfile?.avatar_url || '',
            phone: formatted,
            location: `${district}, ${state}`,
            language: language,
            is_profile_complete: true,
          }, { onConflict: 'id' });
        
        error = res.error;
        if (!error || !error.message?.includes('Lock broken')) {
            break; // Success or a real error, stop retrying
        }
        await new Promise(r => setTimeout(r, 500)); // Wait 500ms before retry
    }

    if (error) {
      toast.error(t('profileSetup.errorSaveFailed', { defaultValue: 'Failed to save: ' }) + error.message);
      setLoading(false);
      return;
    }
    await loadProfile(currentUser.id);
    toast.success(t('profileSetup.welcomeMessage', { defaultValue: 'Welcome to Kosalai! 🎉' }));
    // Small delay so AuthContext re-renders with new profile before navigation
    setTimeout(() => navigate('/', { replace: true }), 300);
  }

  return (
    <div className="splash-wrapper">
      {/* LEFT — branding panel */}
      <div className="splash-image-panel hide-mobile" style={{ background: 'linear-gradient(160deg,#0f5228 0%,#1a7a3c 55%,#0d3d1e 100%)' }}>
        <div className="splash-img-content">
          <h1 className="splash-headline hide-mobile">
            {t('profileSetup.headline', { defaultValue: "India's Most Trusted Cattle Marketplace" })}
          </h1>
          <p className="splash-subtext hide-mobile">
            {t('profileSetup.subtext', { defaultValue: 'Buy and sell cows, buffaloes, goats and pets directly with verified farmers.' })}
          </p>
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div className="splash-right-panel" style={{ position: 'relative' }}>
        <div className="splash-lang-container" style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
            <LanguageSelector />
        </div>
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
                {t('profileSetup.greeting', { name: currentProfile?.full_name, defaultValue: 'Hi, {{name}}! 👋' })}
              </div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                {currentProfile?.email}
              </div>
            </div>

            <h2 className="splash-card-title" style={{ marginBottom: 4 }}>
              {t('profileSetup.oneLastStep', { defaultValue: 'One Last Step! 🎉' })}
            </h2>
            <p className="splash-card-desc" style={{ marginBottom: 20 }}>
              {t('profileSetup.description', { defaultValue: 'Tell us your phone number and location so buyers and sellers can reach you.' })}
            </p>

            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {t('profileSetup.fullName', { defaultValue: 'Full Name' })} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder={t('profileSetup.fullNamePlaceholder', { defaultValue: 'Enter your full name' })}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  border: `1.5px solid ${errors.fullName ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14, outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  if (e.target.value.trim()) setErrors(prev => ({ ...prev, fullName: false }));
                }}
              />
            </div>

            {/* Phone */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {t('profileSetup.mobileNumber', { defaultValue: 'Mobile Number' })} <span style={{ color: '#ef4444' }}>*</span>
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
                  placeholder={t('profileSetup.mobileNumberPlaceholder', { defaultValue: 'Enter 10-digit number' })}
                  style={{
                    paddingLeft: 54, width: '100%', boxSizing: 'border-box',
                    border: `1.5px solid ${errors.phone ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                    padding: '12px 14px 12px 54px',
                    fontSize: 14, outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  maxLength={10}
                  value={phone}
                  onChange={e => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    if (e.target.value.replace(/\D/g, '').length === 10) setErrors(prev => ({ ...prev, phone: false }));
                  }}
                />
              </div>
            </div>

            {/* State */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {t('profileSetup.state', { defaultValue: 'Your State' })} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={state}
                onChange={e => {
                  setState(e.target.value);
                  setDistrict(''); // Reset district on state change
                  if (e.target.value) setErrors(prev => ({ ...prev, state: false }));
                }}
                style={{
                  width: '100%',
                  border: `1.5px solid ${errors.state ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14, outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">{t('profileSetup.selectState', { defaultValue: 'Select your state' })}</option>
                {INDIAN_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {t('profileSetup.district', { defaultValue: 'Your District' })} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {state && DISTRICTS.find(g => g.group === state) ? (
                <select
                  value={district}
                  onChange={e => {
                    setDistrict(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, district: false }));
                  }}
                  disabled={!state}
                  style={{
                    width: '100%',
                    border: `1.5px solid ${errors.district ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14, outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    background: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <option value="">{t('profileSetup.selectDistrict', { defaultValue: 'Select your district' })}</option>
                  {DISTRICTS.find(g => g.group === state)?.opts.map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={state ? t('profileSetup.enterDistrict', { defaultValue: 'Enter your district / city' }) : t('profileSetup.selectStateFirst', { defaultValue: 'Select State First' })}
                  value={district}
                  onChange={e => {
                    setDistrict(e.target.value);
                    if (e.target.value) setErrors(prev => ({ ...prev, district: false }));
                  }}
                  disabled={!state}
                  style={{
                    width: '100%',
                    border: `1.5px solid ${errors.district ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                    padding: '12px 14px',
                    fontSize: 14, outline: 'none',
                    fontFamily: 'Inter, sans-serif',
                    background: !state ? '#f3f4f6' : 'white',
                    cursor: !state ? 'not-allowed' : 'text',
                  }}
                />
              )}
            </div>

            {/* Language */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 13, color: '#374151' }}>
                {t('profileSetup.language', { defaultValue: 'Language' })}
              </label>
              <select
                value={language}
                onChange={e => {
                  setLanguage(e.target.value);
                  if (e.target.value) setErrors(prev => ({ ...prev, language: false }));
                }}
                style={{
                  width: '100%',
                  border: `1.5px solid ${errors.language ? '#ef4444' : '#d1d5db'}`, borderRadius: 10,
                  padding: '12px 14px',
                  fontSize: 14, outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  background: 'white',
                  cursor: 'pointer',
                }}
              >
                <option value="">{t('profileSetup.selectLanguage', { defaultValue: 'Select Language' })}</option>
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
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
                : t('profileSetup.completeBtn', { defaultValue: 'Complete Setup & Enter →' })
              }
            </button>
          </div>

          <p className="splash-legal hide-mobile" style={{ marginTop: 20 }}>
            {t('profileSetup.legalFooter', { defaultValue: 'Your phone number is only shared with buyers/sellers you contact.' })}
          </p>
        </div>
      </div>
    </div>
  );
}
