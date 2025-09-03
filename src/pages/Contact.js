import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, Users, Shield } from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-xl">
            <MessageCircle className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Contact Us
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions about our voting platform? We're here to help! Reach out to us and we'll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Details */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="flex items-center font-bold text-gray-900">
                  <Mail className="h-5 w-5 mr-2 text-indigo-600" />
                  Get in Touch
                </Card.Title>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">support@pollhub.in</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">+91 265 234 5678</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-600">Tech Hub, Alkapuri<br />Vadodara, Gujarat 390007</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Business Hours</p>
                    <p className="text-sm text-gray-600">Mon - Fri: 10:00 AM - 7:00 PM<br />Sat: 10:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Quick Info */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <Card.Content className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 mr-3" />
                  <h3 className="text-lg font-semibold">Why Contact Us?</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Technical Support
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Account Issues
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Feature Requests
                  </li>
                  <li className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    General Inquiries
                  </li>
                </ul>
              </Card.Content>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <Card.Header>
                <Card.Title className="text-xl font-bold text-gray-900">Send us a Message</Card.Title>
                <Card.Description className="text-gray-600">
                  Fill out the form below and we'll respond within 24 hours
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white transition-colors"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white transition-colors"
                      placeholder="What is this regarding?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 bg-white transition-colors resize-none"
                      placeholder="Please describe your inquiry in detail..."
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-gray-500">
                      * Required fields
                    </p>
                    <Button
                      type="submit"
                      loading={isSubmitting}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                </form>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
