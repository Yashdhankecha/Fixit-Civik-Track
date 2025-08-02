import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Lock, Eye, Database, Users } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center mb-4">
            <Link
              to="/register"
              className="flex items-center text-secondary-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to Registration
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Privacy Policy
              </h1>
              <p className="text-secondary-600">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                1. Introduction
              </h2>
                             <p className="text-secondary-700 mb-4">
                 FixIt ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our civic issue reporting platform.
               </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                2. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                2.1 Personal Information
              </h3>
              <p className="text-secondary-700 mb-4">
                We collect information you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2 mb-6">
                <li>Name and email address for account creation</li>
                <li>Profile information and preferences</li>
                <li>Issue reports and associated photos</li>
                <li>Location data for service functionality</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                2.2 Location Information
              </h3>
              <p className="text-secondary-700 mb-4">
                With your consent, we collect location data to:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2 mb-6">
                <li>Show relevant civic issues in your area</li>
                <li>Enable accurate issue reporting</li>
                <li>Provide location-based filtering</li>
                <li>Improve service functionality</li>
              </ul>

              <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                2.3 Usage Information
              </h3>
              <p className="text-secondary-700 mb-4">
                We automatically collect certain information about your use of the service:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Device information and browser type</li>
                <li>IP address and general location</li>
                <li>Usage patterns and feature interactions</li>
                <li>Error logs and performance data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p className="text-secondary-700 mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                                 <li>Providing and maintaining the FixIt service</li>
                <li>Processing and displaying issue reports</li>
                <li>Enabling location-based features</li>
                <li>Communicating with you about service updates</li>
                <li>Improving our platform and user experience</li>
                <li>Ensuring platform security and preventing abuse</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p className="text-secondary-700 mb-4">
                We do not sell, trade, or rent your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li><strong>Public Issue Reports:</strong> Issue reports (excluding personal details) are publicly visible to help community awareness</li>
                <li><strong>Local Authorities:</strong> We may share relevant issue data with local government agencies for resolution</li>
                <li><strong>Service Providers:</strong> We work with trusted third-party services for hosting, analytics, and support</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                <li><strong>Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-secondary-700 mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure data storage and backup procedures</li>
                <li>Employee training on data protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-secondary-700 mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from communications</li>
                <li><strong>Location Controls:</strong> Manage location permissions in your device settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                7. Data Retention
              </h2>
              <p className="text-secondary-700 mb-4">
                We retain your information for as long as necessary to provide our services:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Account data is retained while your account is active</li>
                <li>Issue reports are retained for community reference</li>
                <li>Location data is retained for service functionality</li>
                <li>Log data is retained for security and debugging purposes</li>
                <li>Data may be retained longer if required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                8. Cookies and Tracking
              </h2>
              <p className="text-secondary-700 mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Analyze usage patterns and improve our service</li>
                <li>Provide personalized content and features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="text-secondary-700 mt-4">
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-secondary-700 mb-4">
                CivicReporter is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-secondary-700 mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                11. Changes to This Policy
              </h2>
              <p className="text-secondary-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Posting the updated policy on our website</li>
                <li>Sending email notifications to registered users</li>
                <li>Displaying in-app notifications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                12. Contact Us
              </h2>
              <p className="text-secondary-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-secondary-50 p-4 rounded-lg">
                                 <p className="text-secondary-700">
                   <strong>Email:</strong> privacy@fixit.com<br />
                   <strong>Address:</strong> FixIt Privacy Team<br />
                   <strong>Phone:</strong> +1 (555) 123-4567<br />
                   <strong>Data Protection Officer:</strong> dpo@fixit.com
                 </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage; 