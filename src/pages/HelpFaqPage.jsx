import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './HelpFaqPage.css';

const faqs = [
    {
        question: 'How do I create a listing?',
        answer: 'To create a listing, you must first log in. Once logged in, click the "Sell" button in the bottom navigation menu or "Post a New Listing" from your profile. Fill out the required details including photos, description, and price, then click submit.'
    },
    {
        question: 'Is posting a listing free?',
        answer: 'Yes, posting a basic listing on Kosalai is completely free for all users.'
    },
    {
        question: 'How do I contact a seller?',
        answer: 'To contact a seller, open their listing and click either "Call Seller" or "WhatsApp Seller". You must be logged in to view seller contact details to protect user privacy.'
    },
    {
        question: 'How do I edit my listing?',
        answer: 'Go to "My Profile", then select "My Listings". Find the listing you want to edit and click the edit icon. You can update photos, price, or description.'
    },
    {
        question: 'How do I report a suspicious listing?',
        answer: 'If you find a listing that violates our terms or appears fraudulent, click the "Report" flag icon on the listing page. Our moderation team will investigate it promptly.'
    },
    {
        question: 'How do I delete my account?',
        answer: 'To delete your account and all associated data, please contact our support team using the form below. We will process your deletion request within 7 business days.'
    },
    {
        question: 'How do I contact Kosalai support?',
        answer: 'You can contact our support team by filling out the Contact Support form below or by emailing us directly at support@kosalai.in.'
    }
];

export default function HelpFaqPage() {
    const navigate = useNavigate();
    const [openFaqIndex, setOpenFaqIndex] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const toggleFaq = (index) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic Validation
        if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (formData.message.trim().length < 10) {
            toast.error('Message must be at least 10 characters long.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('support_requests')
                .insert([{
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim(),
                    status: 'pending'
                }]);

            if (error) throw error;

            toast.success('Your support request has been submitted successfully. Our team will contact you soon.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error submitting support request:', error);
            toast.error('Unable to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="help-faq-page">
            <SEOHead
                title="Kosalai - Help & Support"
                description="Need assistance? Find answers to common questions or contact the Kosalai support team."
            />
            
            <div className="help-header">
                <BackButton fallbackPath="/" />
                <h1 className="help-title">Help &amp; Support</h1>
                <p className="help-subtitle">
                    Need assistance? Find answers to common questions or contact the Kosalai support team.
                </p>
            </div>

            <div className="help-content-container">
                {/* FAQ Section */}
                <div className="help-card">
                    <h2>Frequently Asked Questions</h2>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div key={index} className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                                <button className="faq-question" onClick={() => toggleFaq(index)}>
                                    <span>{faq.question}</span>
                                    <span className="faq-icon">▼</span>
                                </button>
                                <div className="faq-answer">
                                    {faq.answer}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="help-card">
                    <h2>Contact Support</h2>
                    <form className="support-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name *</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                className="form-input" 
                                placeholder="Your full name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email Address *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                className="form-input" 
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="subject">Subject *</label>
                            <input 
                                type="text" 
                                id="subject" 
                                name="subject" 
                                className="form-input" 
                                placeholder="How can we help you?"
                                value={formData.subject}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="message">Message *</label>
                            <textarea 
                                id="message" 
                                name="message" 
                                className="form-textarea" 
                                placeholder="Describe your issue or question in detail..."
                                value={formData.message}
                                onChange={handleInputChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Send Support Request'}
                        </button>
                    </form>

                    <div className="contact-info-section">
                        <h2>Contact Information</h2>
                        <p>If you prefer, you can reach us directly via email:</p>
                        <p>Email: <a href="mailto:support@kosalai.in">support@kosalai.in</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
