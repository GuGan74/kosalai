import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './AboutUsPage.css'; // Reuse the same CSS for consistent layout

export default function HelpFaqPage() {
    const { t } = useTranslation();

    return (
        <div className="about-us-page">
            <SEOHead
                title="Kosalai - Help & FAQ"
                description="Help and Frequently Asked Questions for Kosalai."
            />
            <div className="about-header">
                <BackButton fallbackPath="/" />
                <h1 className="about-title">❓ {t('profilePage.helpFaq', 'Help & FAQ')}</h1>
            </div>

            <div className="about-content-container">
                <div className="about-card intro-card">
                    <p>This is a placeholder for the Help & FAQ.</p>
                </div>
            </div>
        </div>
    );
}
