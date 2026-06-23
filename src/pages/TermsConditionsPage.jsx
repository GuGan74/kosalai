import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './AboutUsPage.css'; // Reusing existing styling for consistency

export default function TermsConditionsPage() {
    const navigate = useNavigate();

    // Ensure page opens at the top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="about-us-page">
            <SEOHead
                title="Kosalai - Terms & Conditions"
                description="Read the Terms and Conditions governing the use of Kosalai livestock and pet marketplace."
            />
            
            <div className="about-header" style={{ background: 'linear-gradient(160deg, #1B7F3A 0%, #1a3c28 100%)' }}>
                <BackButton fallbackPath="/" />
                <h1 className="about-title">Terms &amp; Conditions</h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: '14px', marginTop: '8px', fontFamily: 'Nunito, sans-serif' }}>
                    Please read these Terms and Conditions carefully before using Kosalai.
                </p>
            </div>

            <div className="about-content-container" style={{ maxWidth: '900px' }}>
                <div className="about-card intro-card" style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    
                    <div className="tc-intro">
                        <p style={{ fontWeight: 'bold' }}>Last Updated: June 2026</p>
                        <p>Welcome to Kosalai ("Kosalai", "Website", "Platform", "we", "our", or "us").</p>
                        <p>These Terms and Conditions govern your access to and use of https://kosalai.in and all related services, features, content, and functionality provided through the Platform.</p>
                        <p>By accessing, browsing, registering, creating listings, communicating with users, or otherwise using the Platform, you agree to be legally bound by these Terms and Conditions.</p>
                        <p>If you do not agree with any part of these Terms, you must discontinue use of the Platform immediately.</p>
                    </div>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>1. Definitions</h2>
                        <p>For the purposes of these Terms:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li><strong>Platform</strong> means the Kosalai website, applications, services, and related features.</li>
                            <li><strong>User</strong> means any individual, business, organization, buyer, seller, visitor, or registered member using the Platform.</li>
                            <li><strong>Listing</strong> means any advertisement, post, profile, image, video, description, or content published on the Platform.</li>
                            <li><strong>Buyer</strong> means a user interested in purchasing, adopting, or acquiring animals listed on the Platform.</li>
                            <li><strong>Seller</strong> means a user who publishes animal listings on the Platform.</li>
                            <li><strong>Content</strong> means text, images, videos, descriptions, reviews, comments, contact details, and any other information submitted to the Platform.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>2. Nature of the Platform</h2>
                        <p>Kosalai is an online marketplace designed to connect buyers and sellers of:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Cattle</li>
                            <li>Buffaloes</li>
                            <li>Goats</li>
                            <li>Sheep</li>
                            <li>Horses</li>
                            <li>Poultry</li>
                            <li>Pigs</li>
                            <li>Birds</li>
                            <li>Pets and other livestock</li>
                            <li>Other animals permitted under applicable law</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai acts solely as a technology platform and intermediary for communication and discovery.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai does not:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Own animals listed on the Platform</li>
                            <li>Buy or sell animals</li>
                            <li>Participate in negotiations</li>
                            <li>Process payments</li>
                            <li>Provide transportation services</li>
                            <li>Provide veterinary certification</li>
                            <li>Guarantee listing accuracy</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>All transactions occur directly between users.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>3. Eligibility</h2>
                        <p>Users must be at least 18 years old to register and use the Platform.</p>
                        <p style={{ marginTop: '8px' }}>By using Kosalai, you represent and warrant that:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>You have legal capacity to enter into agreements.</li>
                            <li>All information provided is accurate.</li>
                            <li>You will comply with applicable laws.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>4. Registration and Account Security</h2>
                        <p>Users may create accounts using available authentication methods.</p>
                        <p style={{ marginTop: '8px' }}>You are responsible for:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Maintaining account confidentiality</li>
                            <li>Protecting login credentials</li>
                            <li>Activities performed through your account</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>You agree not to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Share your account</li>
                            <li>Sell your account</li>
                            <li>Create fraudulent accounts</li>
                            <li>Impersonate others</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai may suspend or terminate accounts involved in suspicious activity.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>5. Listing Rules</h2>
                        <p>Users may create listings only for animals they are legally authorized to sell, transfer, adopt out, or advertise.</p>
                        <p style={{ marginTop: '8px' }}>Listings must contain:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Accurate descriptions</li>
                            <li>Genuine photographs</li>
                            <li>Correct contact information</li>
                            <li>Truthful health information</li>
                            <li>Correct location information</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users must not intentionally misrepresent:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Breed</li>
                            <li>Age</li>
                            <li>Gender</li>
                            <li>Health condition</li>
                            <li>Vaccination status</li>
                            <li>Ownership status</li>
                            <li>Pregnancy status</li>
                            <li>Production capacity</li>
                        </ul>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>6. Livestock and Animal Disclaimer</h2>
                        <p>Kosalai does not verify:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Animal ownership</li>
                            <li>Breed authenticity</li>
                            <li>Health records</li>
                            <li>Vaccination records</li>
                            <li>Medical condition</li>
                            <li>Seller identity</li>
                            <li>Animal quality</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Buyers are strongly advised to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Physically inspect animals</li>
                            <li>Verify ownership</li>
                            <li>Verify health records</li>
                            <li>Verify vaccination history</li>
                            <li>Conduct independent due diligence</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai shall not be responsible for disputes arising between buyers and sellers.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>7. Transactions Between Users</h2>
                        <p>All transactions occur directly between users.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai is not a party to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Sales agreements</li>
                            <li>Purchases</li>
                            <li>Deliveries</li>
                            <li>Transportation arrangements</li>
                            <li>Payment agreements</li>
                            <li>Ownership transfers</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users assume full responsibility for their transactions.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>8. Payments</h2>
                        <p>Currently:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Registration is free</li>
                            <li>Listing creation is free</li>
                            <li>No payment gateway is provided</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>If paid services are introduced in the future, additional terms may apply.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>9. User Conduct</h2>
                        <p>Users shall not:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Post false information</li>
                            <li>Mislead other users</li>
                            <li>Commit fraud</li>
                            <li>Harass other users</li>
                            <li>Upload malicious software</li>
                            <li>Attempt unauthorized access</li>
                            <li>Interfere with Platform operations</li>
                            <li>Violate intellectual property rights</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Violation may result in immediate suspension or permanent account termination.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>10. Animal Welfare</h2>
                        <p>Users must comply with all applicable animal welfare laws.</p>
                        <p style={{ marginTop: '8px' }}>The following are prohibited:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Animal cruelty</li>
                            <li>Illegal transport</li>
                            <li>Abuse</li>
                            <li>Neglect</li>
                            <li>Illegal breeding activities</li>
                            <li>Activities violating animal protection regulations</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai reserves the right to remove listings that may negatively affect animal welfare.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>11. Restricted Listings</h2>
                        <p>Users may not list:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Stolen animals</li>
                            <li>Illegal wildlife</li>
                            <li>Protected species</li>
                            <li>Endangered species</li>
                            <li>Fraudulent listings</li>
                            <li>Fake ownership claims</li>
                            <li>Illegal products or services</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai may remove such listings without notice.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>12. Content Moderation</h2>
                        <p>Kosalai reserves the right to:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Review content</li>
                            <li>Remove content</li>
                            <li>Restrict users</li>
                            <li>Suspend accounts</li>
                            <li>Permanently terminate accounts</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>where necessary to protect users or maintain platform integrity.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>13. User Verification</h2>
                        <p>Kosalai does not guarantee the identity, background, ownership claims, credibility, or trustworthiness of any user.</p>
                        <p style={{ marginTop: '8px' }}>Users are responsible for independently verifying buyers and sellers before entering into any transaction.</p>
                        <p style={{ marginTop: '8px' }}>Any profile badges, status indicators, or account labels displayed on the Platform should not be considered a guarantee of authenticity.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>14. Free Adoption Listings</h2>
                        <p>Users may create free adoption listings for eligible animals.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai does not participate in adoption agreements and is not responsible for the condition, treatment, transfer, or future welfare of animals listed for adoption.</p>
                        <p style={{ marginTop: '8px' }}>Users are encouraged to ensure responsible and ethical adoption practices.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>15. Contact Information</h2>
                        <p>Users may voluntarily share contact information through listings and profiles.</p>
                        <p style={{ marginTop: '8px' }}>By publishing such information, users understand that it may be visible to other users of the Platform.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai is not responsible for communications conducted outside the Platform.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>16. Intellectual Property</h2>
                        <p>All Kosalai-owned content including:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Logo</li>
                            <li>Branding</li>
                            <li>Website design</li>
                            <li>Source code</li>
                            <li>Graphics</li>
                            <li>Text</li>
                            <li>Databases</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>remain the property of Kosalai.</p>
                        <p style={{ marginTop: '8px' }}>Unauthorized reproduction, distribution, or modification is prohibited.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>17. Privacy</h2>
                        <p>Use of the Platform is also governed by the Privacy Policy.</p>
                        <p style={{ marginTop: '8px' }}>By using the Platform, you consent to the collection and processing of information described in the Privacy Policy.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>18. Disclaimer of Warranties</h2>
                        <p>The Platform is provided on an "AS IS" and "AS AVAILABLE" basis.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai makes no warranties regarding:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Listing accuracy</li>
                            <li>User conduct</li>
                            <li>Animal condition</li>
                            <li>Platform availability</li>
                            <li>Platform reliability</li>
                            <li>Platform security</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Users assume all risks associated with use of the Platform.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>19. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by law, Kosalai shall not be liable for:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Direct damages</li>
                            <li>Indirect damages</li>
                            <li>Consequential damages</li>
                            <li>Loss of profits</li>
                            <li>Data loss</li>
                            <li>User disputes</li>
                            <li>Fraudulent activities</li>
                            <li>Business interruption</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>including disputes arising from animal health, ownership, transportation, delivery, payments, adoption arrangements, or representations made by users.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>20. Platform Availability</h2>
                        <p>Kosalai may temporarily suspend, restrict, or discontinue any part of the Platform for maintenance, upgrades, security reasons, or technical issues without prior notice.</p>
                        <p style={{ marginTop: '8px' }}>Kosalai does not guarantee uninterrupted availability of services.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>21. Governing Law</h2>
                        <p>These Terms shall be governed by and interpreted in accordance with the laws of India.</p>
                        <p style={{ marginTop: '8px' }}>All disputes shall be subject to the exclusive jurisdiction of the courts located in Tamil Nadu, India.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>22. Changes to Terms</h2>
                        <p>Kosalai may update these Terms at any time.</p>
                        <p style={{ marginTop: '8px' }}>Updated versions will be published on the Platform with a revised "Last Updated" date.</p>
                        <p style={{ marginTop: '8px' }}>Continued use of the Platform constitutes acceptance of revised Terms.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>23. Reporting Violations</h2>
                        <p>Users may report:</p>
                        <ul style={{ paddingLeft: '20px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <li>Fraudulent listings</li>
                            <li>Misleading information</li>
                            <li>Abuse</li>
                            <li>Illegal activity</li>
                            <li>Policy violations</li>
                        </ul>
                        <p style={{ marginTop: '8px' }}>Kosalai may investigate and take appropriate action.</p>
                    </section>

                    <section>
                        <h2 style={{ fontSize: '18px', color: '#1a3c28', marginBottom: '8px', fontWeight: 'bold' }}>24. Contact Us</h2>
                        <p>For questions regarding these Terms and Conditions:</p>
                        <p style={{ marginTop: '8px', fontWeight: 'bold' }}>Kosalai</p>
                        <p>Email: <a href="mailto:support@kosalai.in" style={{ color: '#1a7a3c', textDecoration: 'none' }}>support@kosalai.in</a></p>
                        <p>Website: <a href="https://kosalai.in" style={{ color: '#1a7a3c', textDecoration: 'none' }}>https://kosalai.in</a></p>
                        <p style={{ marginTop: '12px' }}>Users may also contact us regarding abuse reports, fraudulent listings, policy violations, or legal concerns.</p>
                    </section>

                </div>

                <div style={{ textAlign: 'center', padding: '24px 0 12px', fontSize: '13px', color: '#6b7280' }}>
                    © 2026 Kosalai. All rights reserved.
                </div>
            </div>
        </div>
    );
}
