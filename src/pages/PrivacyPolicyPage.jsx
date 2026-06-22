import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './AboutUsPage.css'; // Reusing existing styling for consistency

export default function PrivacyPolicyPage() {
    const navigate = useNavigate();

    // Ensure page opens at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-us-page">
            <SEOHead
                title="Kosalai - Privacy Policy"
                description="Learn how Kosalai collects, uses, stores, and protects your personal information."
            />
            
            <div className="about-header" style={{ background: 'linear-gradient(160deg, #1B7F3A 0%, #1a3c28 100%)' }}>
                <BackButton fallbackPath="/" />
                <h1 className="about-title">Privacy Policy</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '14px', marginTop: '8px', fontFamily: 'Nunito, sans-serif' }}>
                    Learn how Kosalai collects, uses, stores, and protects your personal information.
                </p>
            </div>

            <div className="about-content-container" style={{ maxWidth: '900px' }}>
                <div className="about-card intro-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div className="tc-intro">
                        <p style={{ fontWeight: 'bold' }}>Last Updated: June 2026</p>
                        <p>Welcome to Kosalai ("Kosalai", "Website", "Platform", "we", "our", or "us").</p>
                        <p>This Privacy Policy explains how we collect, use, store, protect, and disclose information when you use https://kosalai.in and related services.</p>
                        <p>By accessing or using Kosalai, you agree to the practices described in this Privacy Policy.</p>
                    </div>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>1. Information We Collect</h2>
                        
                        <h3 style={{ fontSize: '15px', color: '#1a3c28', marginBottom: '4px', fontWeight: 'bold', marginTop: '12px' }}>Information You Provide</h3>
                        <p>When you create an account, create listings, contact users, or use the Platform, we may collect:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Full name</li>
                            <li>Email address</li>
                            <li>Phone number</li>
                            <li>Profile information</li>
                            <li>Location details</li>
                            <li>Listing information</li>
                            <li>Photos and images</li>
                            <li>Messages submitted through forms</li>
                            <li>Reports and feedback</li>
                        </ul>

                        <h3 style={{ fontSize: '15px', color: '#1a3c28', marginBottom: '4px', fontWeight: 'bold', marginTop: '12px' }}>Information Collected Automatically</h3>
                        <p>We may automatically collect:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Device information</li>
                            <li>Browser type</li>
                            <li>Operating system</li>
                            <li>IP address</li>
                            <li>Language preferences</li>
                            <li>Date and time of access</li>
                            <li>Usage statistics</li>
                            <li>Cookies and similar technologies</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>2. How We Use Your Information</h2>
                        <p>We use collected information to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Provide and maintain the Platform</li>
                            <li>Create and manage user accounts</li>
                            <li>Display listings</li>
                            <li>Enable communication between buyers and sellers</li>
                            <li>Improve user experience</li>
                            <li>Detect fraud and misuse</li>
                            <li>Respond to support requests</li>
                            <li>Enforce our Terms and Conditions</li>
                            <li>Ensure platform security</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>3. Listing Information</h2>
                        <p>Information you voluntarily publish in listings may be visible to other users.</p>
                        <p style={{ marginTop: '8px' }}>This may include:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Animal details</li>
                            <li>Photos</li>
                            <li>Contact information</li>
                            <li>Location information</li>
                            <li>Seller profile information</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users should carefully consider what information they choose to make public.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>4. Cookies and Tracking Technologies</h2>
                        <p>Kosalai may use cookies and similar technologies to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Remember user preferences</li>
                            <li>Maintain login sessions</li>
                            <li>Improve performance</li>
                            <li>Analyze platform usage</li>
                            <li>Enhance security</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users may disable cookies through browser settings, although certain features may not function properly.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>5. Sharing of Information</h2>
                        <p>Kosalai does not sell personal information.</p>
                        <p style={{ marginTop: '8px' }}>We may share information only:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>When required by law</li>
                            <li>To comply with legal obligations</li>
                            <li>To investigate fraud or abuse</li>
                            <li>To protect user safety</li>
                            <li>With trusted service providers that help operate the Platform</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Any third-party service providers are required to protect user information appropriately.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>6. User Communications</h2>
                        <p>Users may communicate directly with each other using contact details voluntarily shared through listings or profiles.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai is not responsible for communications conducted outside the Platform.</p>
                        <p style={{ marginTop: '8px' }}>Users should exercise caution when sharing personal information.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>7. Data Retention</h2>
                        <p>We retain information only for as long as necessary to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Provide services</li>
                            <li>Maintain platform operations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce agreements</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>We may retain certain information where required by applicable law.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>8. Account Deletion</h2>
                        <p>Users may request deletion of their account by contacting support.</p>
                        <p style={{ marginTop: '8px' }}>Upon deletion request:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Public listings may be removed.</li>
                            <li>Personal information may be deleted or anonymized.</li>
                            <li>Certain records may be retained where required by law or for legitimate business purposes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>9. Data Security</h2>
                        <p>We implement reasonable technical and organizational measures to protect information against:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Unauthorized access</li>
                            <li>Alteration</li>
                            <li>Disclosure</li>
                            <li>Loss</li>
                            <li>Misuse</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>However, no online service can guarantee complete security.</p>
                        <p style={{ marginTop: '8px' }}>Users use the Platform at their own risk.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>10. Children's Privacy</h2>
                        <p>Kosalai is not intended for children under 18 years of age.</p>
                        <p style={{ marginTop: '8px' }}>We do not knowingly collect personal information from children.</p>
                        <p style={{ marginTop: '8px' }}>If we become aware that information from a child has been collected, we will take reasonable steps to remove it.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>11. Third-Party Links</h2>
                        <p>The Platform may contain links to third-party websites or services.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai is not responsible for:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Third-party content</li>
                            <li>Third-party privacy practices</li>
                            <li>Third-party services</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users should review the privacy policies of external websites separately.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>12. User Rights</h2>
                        <p>Subject to applicable laws, users may request:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Access to personal information</li>
                            <li>Correction of inaccurate information</li>
                            <li>Deletion of personal information</li>
                            <li>Withdrawal of consent where applicable</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Requests may be submitted using the contact information below.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>13. Changes to this Privacy Policy</h2>
                        <p>Kosalai may update this Privacy Policy periodically.</p>
                        <p style={{ marginTop: '8px' }}>Updated versions will be published on this page with a revised "Last Updated" date.</p>
                        <p style={{ marginTop: '8px' }}>Continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>14. Contact Us</h2>
                        <p>For questions regarding this Privacy Policy or your personal information:</p>
                        <p style={{ marginTop: '8px', fontWeight: 'bold' }}>Kosalai</p>
                        <p>Email: <a href="mailto:support@kosalai.in" style={{ color: '#1a7a3c', textDecoration: 'none' }}>support@kosalai.in</a></p>
                        <p>Website: <a href="https://kosalai.in" style={{ color: '#1a7a3c', textDecoration: 'none' }}>https://kosalai.in</a></p>
                        <p style={{ marginTop: '12px' }}>Users may contact us regarding privacy concerns, data requests, account deletion requests, or security issues.</p>
                    </section>

                </div>

                <div style={{ textAlign: 'center', padding: '24px 0 12px', fontSize: '13px', color: '#6b7280' }}>
                    © 2026 Kosalai. All rights reserved.
                </div>
            </div>
        </div>
    );
}
