import { useEffect } from "react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy -AI Contract Check";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-text-primary">Privacy Policy</h1>
        
        <section className="mb-10">
          <p className="text-text-secondary mb-6">
            AtAI Contract Check, we believe that privacy and peace of mind go hand in hand. This policy 
            outlines how we handle your information with care and respect while providing our 
            digital wellness services.
          </p>
          <p className="text-text-secondary mb-6">
            Last updated: April 21, 2025
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Information We Collect</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Account Information</h3>
              <p className="text-text-secondary">
                When you create an account, we collect your display name and authentication 
                information to provide you with a personalized experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Usage Data</h3>
              <p className="text-text-secondary">
                We collect anonymous data about how you interact with our platform to improve 
                our services and enhance your experience.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">User Content</h3>
              <p className="text-text-secondary">
                The whispers and messages you choose to share, including whether you share 
                them anonymously or with your name attached.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">How We Use Your Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Providing Services</h3>
              <p className="text-text-secondary">
                We use your information to deliver our core features, including personalized 
                audio experiences and community interactions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Improving Experience</h3>
              <p className="text-text-secondary">
                Anonymous usage data helps us understand how to better serve our community 
                and enhance our platform's features.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Community Safety</h3>
              <p className="text-text-secondary">
                We monitor shared content to maintain a positive and safe environment for 
                all users.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Data Protection</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              We implement industry-standard security measures to protect your information 
              from unauthorized access, disclosure, or misuse.
            </p>
            <p className="text-text-secondary">
              Your data is stored securely and accessed only when necessary to provide our 
              services or comply with legal obligations.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Your Privacy Choices</h2>
          <div className="space-y-4">
            <p className="text-text-secondary">
              You can choose to share whispers anonymously or with your name attached.
            </p>
            <p className="text-text-secondary">
              You have the right to access, modify, or delete your personal information at any time.
            </p>
            <p className="text-text-secondary">
              You can manage your notification preferences and privacy settings within your account.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Contact Us</h2>
          <p className="text-text-secondary mb-4">
            If you have questions about our privacy practices or would like to exercise 
            your privacy rights, please contact us through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
