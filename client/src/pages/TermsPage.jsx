import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Users, Lock } from 'lucide-react';

const TermsPage = () => {
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
              <FileText className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">
                Terms & Conditions
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
                1. Acceptance of Terms
              </h2>
                             <p className="text-secondary-700 mb-4">
                 By accessing and using FixIt, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
               </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                2. Description of Service
              </h2>
                             <p className="text-secondary-700 mb-4">
                 FixIt is a community-driven platform that allows users to report and track civic issues in their local area. The service includes:
               </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Reporting civic issues with location data</li>
                <li>Viewing and tracking reported issues</li>
                <li>Interactive mapping of civic problems</li>
                <li>Community engagement features</li>
                <li>Administrative tools for local authorities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                3. User Responsibilities
              </h2>
                             <p className="text-secondary-700 mb-4">
                 As a user of FixIt, you agree to:
               </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Provide accurate and truthful information when reporting issues</li>
                <li>Respect the privacy and rights of others</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not submit false or misleading reports</li>
                <li>Not attempt to gain unauthorized access to the service</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                4. Content Guidelines
              </h2>
              <p className="text-secondary-700 mb-4">
                When submitting reports, you must ensure that:
              </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>All information provided is accurate and factual</li>
                <li>Photos and images are relevant to the reported issue</li>
                <li>Content does not violate any laws or regulations</li>
                <li>Personal information of others is not included without consent</li>
                <li>Content is not defamatory, harassing, or offensive</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                5. Privacy and Data Protection
              </h2>
              <p className="text-secondary-700 mb-4">
                We are committed to protecting your privacy. Our data collection and usage practices are outlined in our Privacy Policy. By using this service, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                6. Location Services
              </h2>
                             <p className="text-secondary-700 mb-4">
                 FixIt uses location services to provide relevant issue reports in your area. By using the service, you consent to:
               </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>Sharing your location data for service functionality</li>
                <li>Allowing the app to access your device's GPS</li>
                <li>Using location data to show nearby civic issues</li>
                <li>Storing location preferences for improved user experience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                7. Intellectual Property
              </h2>
                             <p className="text-secondary-700 mb-4">
                 The FixIt platform, including its design, code, and content, is protected by intellectual property laws. Users retain ownership of their submitted content but grant us a license to use, display, and distribute their reports for the purpose of providing the service.
               </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                8. Limitation of Liability
              </h2>
                             <p className="text-secondary-700 mb-4">
                 FixIt is provided "as is" without warranties of any kind. We are not responsible for:
               </p>
              <ul className="list-disc pl-6 text-secondary-700 space-y-2">
                <li>The accuracy of user-submitted reports</li>
                <li>Actions taken by local authorities based on reports</li>
                <li>Service interruptions or technical issues</li>
                <li>Data loss or security breaches</li>
                <li>Third-party actions or content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                9. Termination
              </h2>
              <p className="text-secondary-700 mb-4">
                We reserve the right to terminate or suspend your account at any time for violations of these terms. You may also terminate your account at any time by contacting our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-secondary-700 mb-4">
                We may update these terms from time to time. We will notify users of any material changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                11. Contact Information
              </h2>
              <p className="text-secondary-700 mb-4">
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <div className="bg-secondary-50 p-4 rounded-lg">
                                 <p className="text-secondary-700">
                   <strong>Email:</strong> legal@fixit.com<br />
                   <strong>Address:</strong> FixIt Legal Team<br />
                   <strong>Phone:</strong> +1 (555) 123-4567
                 </p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsPage; 