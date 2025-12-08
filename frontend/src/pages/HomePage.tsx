import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Open Science on the Blockchain
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              A decentralized platform for transparent, immutable scientific publishing.
              Prevent suppression. Enable verification. Build trust.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/papers" className="btn bg-white text-primary-700 hover:bg-gray-100 px-6 py-3">
                Browse Research
              </Link>
              <Link to="/register" className="btn bg-primary-500 text-white hover:bg-primary-400 border border-primary-400 px-6 py-3">
                Join Platform
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Open Science DLT?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Immutable Records"
              description="Research published on Stellar blockchain cannot be altered or suppressed. Your work is permanently preserved."
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Transparent Reviews"
              description="Peer reviews are recorded on-chain, creating an auditable trail of scientific discourse."
            />
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              }
              title="Reproducibility Tracking"
              description="Independent verifications are documented, building confidence in research findings."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Submit"
              description="Upload your research paper with metadata. Content is stored on IPFS."
            />
            <StepCard
              number="2"
              title="Record"
              description="Submission is recorded on Stellar blockchain with timestamp proof."
            />
            <StepCard
              number="3"
              title="Review"
              description="Community peer review with transparent, on-chain feedback."
            />
            <StepCard
              number="4"
              title="Verify"
              description="Independent researchers can verify and reproduce results."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard value="100%" label="Open Access" />
            <StatCard value="Stellar" label="Blockchain" />
            <StatCard value="IPFS" label="Storage" />
            <StatCard value="MIT" label="License" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-science-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Publish Openly?</h2>
          <p className="text-xl text-science-100 mb-8 max-w-2xl mx-auto">
            Join the movement for transparent, verifiable science.
            Your research deserves to be preserved forever.
          </p>
          <Link to="/register" className="btn bg-white text-science-700 hover:bg-gray-100 px-8 py-3 text-lg">
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card p-6 text-center">
      <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-600">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold text-primary-600 mb-2">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}
