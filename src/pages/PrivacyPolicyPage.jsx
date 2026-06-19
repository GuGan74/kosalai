import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './AboutUsPage.css'; // Reuse the same CSS for consistent layout

export default function PrivacyPolicyPage() {
    const { t } = useTranslation();

    return (
        <div className="about-us-page">
            <SEOHead
                title="Kosalai - Privacy Policy"
                description="Privacy Policy for Kosalai, India's trusted marketplace for livestock."
            />
            <div className="about-header">
                <BackButton fallbackPath="/" />
                <h1 className="about-title">🔒 {t('profilePage.privacyPolicy', 'Privacy Policy')}</h1>
            </div>

            <div className="about-content-container">
                <div className="about-card intro-card">
                    <p>This is a placeholder for the Privacy Policy.</p>
                </div>
            </div>
        </div>
    );
}
