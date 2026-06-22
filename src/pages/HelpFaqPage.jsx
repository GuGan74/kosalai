import React, { useEffect } from 'react';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './HelpFaqPage.css';

export default function HelpFaqPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="help-faq-page">
            <SEOHead
                title="Kosalai - Contact Support"
                description="Need assistance? Contact the Kosalai support team directly."
            />
            
            <div className="help-header">
                <BackButton fallbackPath="/" />
                <h1 className="help-title">Help &amp; Support</h1>
                <p className="help-subtitle">
                    Need assistance? Send us a message and our support team will get back to you.
                </p>
            </div>

            <div className="help-content-container">
                <div className="help-card">
                    <div className="contact-info-section" style={{ borderTop: 'none', marginTop: 0, paddingTop: 0 }}>
                        <h2>Contact Information</h2>
                        <p>If you prefer, you can reach us directly via email:</p>
                        <p>Email: <a href="mailto:support@kosalai.in">support@kosalai.in</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
