import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 2024</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Not a Label ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Name and contact information (email address, phone number)</li>
              <li>Username and password</li>
              <li>Artist/band name and biography</li>
              <li>Payment and billing information</li>
              <li>Social media profiles and links</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Music and Content</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Audio files and music tracks</li>
              <li>Metadata (song titles, album art, genre, etc.)</li>
              <li>Lyrics and song descriptions</li>
              <li>Performance and analytics data</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Platform usage patterns and preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <div className="space-y-4">
              <p><strong>Service Provision:</strong> To provide, maintain, and improve our platform and services.</p>
              <p><strong>Music Distribution:</strong> To distribute your music to streaming platforms and digital stores.</p>
              <p><strong>Analytics:</strong> To provide you with performance analytics and insights.</p>
              <p><strong>AI Services:</strong> To power our AI-driven career guidance and content generation features.</p>
              <p><strong>Communication:</strong> To send you service-related notifications, updates, and promotional content.</p>
              <p><strong>Support:</strong> To respond to your inquiries and provide customer support.</p>
              <p><strong>Legal Compliance:</strong> To comply with applicable laws and protect our rights.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            
            <h3 className="text-xl font-medium mb-3">With Your Consent</h3>
            <p className="mb-4">
              We share your music and associated metadata with streaming platforms and digital stores as part of our distribution service.
            </p>

            <h3 className="text-xl font-medium mb-3">Service Providers</h3>
            <p className="mb-4">
              We work with third-party service providers for payment processing, analytics, cloud storage, and AI services. 
              These providers are bound by confidentiality agreements.
            </p>

            <h3 className="text-xl font-medium mb-3">Legal Requirements</h3>
            <p className="mb-4">
              We may disclose information when required by law, to protect our rights, or to ensure platform safety and security.
            </p>

            <h3 className="text-xl font-medium mb-3">Business Transfers</h3>
            <p className="mb-4">
              In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. AI and Machine Learning</h2>
            <div className="space-y-4">
              <p>
                We use artificial intelligence and machine learning technologies to enhance our services, including:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Analyzing music for genre classification and recommendations</li>
                <li>Generating personalized career advice and insights</li>
                <li>Creating content suggestions and marketing materials</li>
                <li>Improving platform features and user experience</li>
              </ul>
              <p>
                Your data may be used to train and improve our AI models, but we ensure this is done in a privacy-preserving manner.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <div className="space-y-4">
              <p>
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication requirements</li>
                <li>Secure cloud infrastructure and backup systems</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
            
            <h3 className="text-xl font-medium mb-3">Access and Correction</h3>
            <p className="mb-4">You can access and update your personal information through your account settings.</p>

            <h3 className="text-xl font-medium mb-3">Data Portability</h3>
            <p className="mb-4">You can download your music files and data from the platform at any time.</p>

            <h3 className="text-xl font-medium mb-3">Deletion</h3>
            <p className="mb-4">You can delete your account and request removal of your personal information, subject to legal requirements.</p>

            <h3 className="text-xl font-medium mb-3">Communication Preferences</h3>
            <p className="mb-4">You can manage your notification preferences and unsubscribe from promotional emails.</p>

            <h3 className="text-xl font-medium mb-3">Cookies</h3>
            <p className="mb-4">You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
            <p className="mb-4">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. 
              If we become aware of such collection, we will take steps to delete the information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Data Retention</h2>
            <p className="mb-4">
              We retain your information for as long as necessary to provide our services, comply with legal obligations, 
              and resolve disputes. Music files may be retained for distribution purposes even after account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Third-Party Links</h2>
            <p className="mb-4">
              Our platform may contain links to third-party websites or services. We are not responsible for the privacy 
              practices of these third parties. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of significant changes through the platform 
              or by email. Your continued use constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Us</h2>
            <div className="space-y-4">
              <p>If you have questions about this Privacy Policy or our privacy practices, please contact us:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@not-a-label.art</p>
                <p><strong>Address:</strong> Not a Label Privacy Team</p>
                <p><strong>Data Protection Officer:</strong> dpo@not-a-label.art</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Regional Specific Rights</h2>
            
            <h3 className="text-xl font-medium mb-3">GDPR (EU Users)</h3>
            <p className="mb-4">
              If you are in the European Union, you have additional rights under GDPR, including the right to access, 
              rectify, erase, restrict processing, object to processing, and data portability.
            </p>

            <h3 className="text-xl font-medium mb-3">CCPA (California Users)</h3>
            <p className="mb-4">
              California residents have rights under the CCPA, including the right to know, delete, and opt-out of the sale of personal information. 
              We do not sell personal information.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            This privacy policy is effective as of January 2024. By using Not a Label, you consent to the collection and use of information in accordance with this policy.
          </p>
        </div>
      </div>
    </div>
  )
}