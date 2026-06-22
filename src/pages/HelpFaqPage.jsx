import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import emailjs from '@emailjs/browser';
import SEOHead from '../components/SEOHead';
import BackButton from '../components/BackButton';
import './HelpFaqPage.css';

export default function HelpFaqPage() {
    const navigate = useNavigate();
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
            // EmailJS configuration variables
            // These should be configured in your Vercel Environment Variables
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_kosalai';
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_kosalai_support';
            const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY_HERE';

            const templateParams = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim()
            };

            await emailjs.send(serviceId, templateId, templateParams, publicKey);

            toast.success('Support request sent successfully.');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Error sending support request:', error);
            toast.error('Unable to send support request.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
