import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 2024</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Not a Label ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Not a Label is a platform that provides independent musicians with tools for music distribution, analytics, 
              AI-powered career guidance, and community features. We offer both free and premium services to help artists 
              grow their careers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <div className="space-y-4">
              <p>
                <strong>Account Creation:</strong> You must provide accurate and complete information when creating an account.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 13 years old to use this service. Users under 18 require parental consent.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Music Rights and Content</h2>
            <div className="space-y-4">
              <p>
                <strong>Ownership:</strong> You retain all rights to your original music and content uploaded to the Platform.
              </p>
              <p>
                <strong>License to Platform:</strong> By uploading content, you grant Not a Label a non-exclusive license to distribute, 
                promote, and display your content as part of our services.
              </p>
              <p>
                <strong>Content Responsibility:</strong> You are solely responsible for ensuring you have the right to upload and distribute any content.
              </p>
              <p>
                <strong>Prohibited Content:</strong> Content that is illegal, infringing, harmful, or violates community standards is prohibited.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Distribution and Revenue</h2>
            <div className="space-y-4">
              <p>
                <strong>Distribution Service:</strong> We provide music distribution to various streaming platforms and digital stores.
              </p>
              <p>
                <strong>Revenue Sharing:</strong> Revenue sharing terms are specified in your selected plan and distribution agreements.
              </p>
              <p>
                <strong>Payment Processing:</strong> Payments are processed according to the payment schedule of each platform.
              </p>
              <p>
                <strong>Taxes:</strong> You are responsible for any applicable taxes on your earnings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. AI Services</h2>
            <p className="mb-4">
              Our AI-powered features are provided "as is" and are intended to assist with career guidance and content creation. 
              AI-generated content should be reviewed and customized by users before use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data</h2>
            <p className="mb-4">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>{' '}
              to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Subscription and Billing</h2>
            <div className="space-y-4">
              <p>
                <strong>Free and Paid Plans:</strong> We offer both free and paid subscription plans with different features and limits.
              </p>
              <p>
                <strong>Billing:</strong> Paid subscriptions are billed in advance on a monthly or annual basis.
              </p>
              <p>
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.
              </p>
              <p>
                <strong>Refunds:</strong> Refunds are generally not provided, except as required by applicable law.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Prohibited Uses</h2>
            <div className="space-y-2">
              <p>You may not use the Platform to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Upload content you don't have rights to</li>
                <li>Engage in copyright infringement</li>
                <li>Spam or send unsolicited communications</li>
                <li>Attempt to hack or compromise the Platform</li>
                <li>Create fake accounts or manipulate metrics</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend accounts that violate these terms or for any other reason at our discretion. 
              Upon termination, your access to the Platform will cease, though you retain rights to your original content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
            <p className="mb-4">
              The Platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service, 
              specific results from our distribution services, or the success of your music career.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p className="mb-4">
              Not a Label shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. 
              Continued use of the Platform constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@not-a-label.art" className="text-primary hover:underline">
                legal@not-a-label.art
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            These terms are effective as of January 2024. By using Not a Label, you agree to these terms and conditions.
          </p>
        </div>
      </div>
    </div>
  )
}