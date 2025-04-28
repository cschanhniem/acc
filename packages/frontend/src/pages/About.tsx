import { useEffect } from "react";

export default function About() {
  useEffect(() => {
    document.title = "AboutAI Contract Check - Digital Wellness Platform";
  }, []);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-text-primary">AboutAI Contract Check</h1>
        
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Our Mission</h2>
          <p className="text-text-secondary mb-4">
           AI Contract Check is your sanctuary for digital wellness, where tranquility meets connection. 
            We believe in the power of gentle moments, positive interactions, and the soothing 
            influence of ambient sounds to create spaces of peace in our digital lives.
          </p>
          <p className="text-text-secondary mb-4">
            Our platform combines customizable soundscapes with the warmth of human connection, 
            creating a unique space where you can find moments of calm and share positivity 
            with others.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">What We Offer</h2>
          <div className="grid gap-6">
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Ambient Soundscapes</h3>
              <p className="text-text-secondary">
                Immerse yourself in customizable audio environments, from gentle rain to 
                soothing nature sounds, creating your perfect atmosphere for relaxation.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Positive Whispers</h3>
              <p className="text-text-secondary">
                Experience the joy of receiving and sharing uplifting messages throughout 
                your day, fostering moments of connection and encouragement.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Community Connection</h3>
              <p className="text-text-secondary">
                Join a supportive community where kindness flows freely, whether through 
                anonymous whispers or personal connections.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Our Values</h2>
          <div className="grid gap-4">
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Digital Wellness</h3>
              <p className="text-text-secondary">
                We prioritize your mental well-being, offering tools and experiences that 
                promote mindfulness and inner peace.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Positive Interaction</h3>
              <p className="text-text-secondary">
                Every feature is designed to foster meaningful connections and spread 
                positivity within our community.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-medium mb-2 text-text-primary">Accessibility</h3>
              <p className="text-text-secondary">
                We believe in creating experiences that are welcoming and accessible to 
                everyone, with simple, intuitive design.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4 text-text-primary">Join Our Journey</h2>
          <p className="text-text-secondary mb-4">
            Whether you're seeking a moment of calm, looking to spread positivity, or 
            wanting to be part of a supportive community,AI Contract Check welcomes you. Together, 
            we're creating a more peaceful digital world, one whisper at a time.
          </p>
        </section>
      </div>
    </div>
  );
}
