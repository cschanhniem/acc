import { useEffect } from "react";

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service -AI Contract Check";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-text-primary">Terms of Service</h1>
        
        <section className="mb-10">
          <p className="text-text-secondary mb-6">
            Welcome to AI Contract Check. By using our platform, you agree to these terms, which are 
            designed to create a positive and supportive environment for all users.
          </p>
          <p className="text-text-secondary mb-6">
            Last updated: April 21, 2025
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Acceptance of Terms</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              By accessing or usingAI Contract Check, you agree to be bound by these Terms of Service 
              and our Privacy Policy. If you disagree with any part of the terms, you may not 
              access our services.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">User Guidelines</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Community Standards</h3>
              <p className="text-text-secondary">
                Users must maintain a positive and supportive atmosphere. Share only uplifting 
                and encouraging content that promotes well-being and peaceful interactions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Content Guidelines</h3>
              <p className="text-text-secondary">
                All shared content must be appropriate, respectful, and aligned with our mission 
                of promoting digital wellness. Harmful, hateful, or inappropriate content is not 
                permitted.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Anonymous Sharing</h3>
              <p className="text-text-secondary">
                When sharing anonymously, users must maintain the same high standards of positivity 
                and respect as with named messages.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Account Responsibilities</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              You are responsible for maintaining the security of your account and any activities 
              that occur under your account.
            </p>
            <p className="text-text-secondary">
              You agree not to share your account credentials or transfer your account to 
              another person.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Service Modifications</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              We reserve the right to modify or discontinue any part of our service at any 
              time, with or without notice.
            </p>
            <p className="text-text-secondary">
              We may update these terms as our services evolve. Continued use of the platform 
              after changes constitutes acceptance of the updated terms.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Intellectual Property</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              TheAI Contract Check platform, including its original content and features, is owned 
              by us and protected by applicable laws.
            </p>
            <p className="text-text-secondary">
              By sharing content on our platform, you grant us a non-exclusive right to use, 
              modify, and display that content in connection with our services.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Limitation of Liability</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              We strive to provide a peaceful and supportive environment but cannot guarantee 
              uninterrupted access to our services or the conduct of other users.
            </p>
            <p className="text-text-secondary">
              We are not liable for any indirect, incidental, or consequential damages arising 
              from your use of our services.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Contact Us</h2>
          <p className="text-text-secondary mb-4">
            If you have questions about these terms or need to report a violation, please 
            contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
