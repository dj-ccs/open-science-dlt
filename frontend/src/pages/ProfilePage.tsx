import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import type { User, ReputationEvent } from '../types';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [reputation, setReputation] = useState<ReputationEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadUser(id);
    }
  }, [id]);

  const loadUser = async (userId: string) => {
    setIsLoading(true);
    setError('');
    try {
      const [userData, reputationData] = await Promise.all([
        api.getUser(userId),
        api.getUserReputation(userId),
      ]);
      setUser(userData);
      setReputation(reputationData);
    } catch (err) {
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h2>
        <p className="text-gray-600">{error || 'The requested user could not be found.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="card p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-primary-700">
                {user.displayName?.[0] || user.stellarPublicKey.slice(0, 2)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {user.displayName || 'Anonymous Researcher'}
            </h1>
            {user.affiliation && (
              <p className="text-gray-600 mb-2">{user.affiliation}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              {user.orcidVerified && (
                <span className="badge-success">ORCID Verified</span>
              )}
            </div>
            {user.bio && (
              <p className="text-gray-700">{user.bio}</p>
            )}
          </div>

          {/* Reputation Score */}
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">{user.reputationScore}</div>
            <div className="text-sm text-gray-500">Reputation</div>
          </div>
        </div>
      </div>

      {/* Stellar Identity */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stellar Identity</h2>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Public Key:</span>
          <code className="font-mono text-sm text-gray-700 bg-gray-100 px-2 py-1 rounded">
            {user.stellarPublicKey}
          </code>
          <a
            href={`https://stellar.expert/explorer/testnet/account/${user.stellarPublicKey}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            View on Explorer
          </a>
        </div>
      </div>

      {/* Reputation History */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Reputation History</h2>
        {reputation.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reputation events yet</p>
        ) : (
          <div className="space-y-3">
            {reputation.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {formatEventType(event.eventType)}
                  </p>
                  <p className="text-sm text-gray-500">{event.reason}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`text-lg font-semibold ${event.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {event.points >= 0 ? '+' : ''}{event.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatEventType(type: string): string {
  const labels: Record<string, string> = {
    PAPER_SUBMITTED: 'Paper Submitted',
    PAPER_REVIEWED: 'Paper Reviewed',
    PAPER_VERIFIED: 'Paper Verified',
    REVIEW_VALIDATED: 'Review Validated',
    VERIFICATION_SUCCESSFUL: 'Verification Successful',
    GOVERNANCE_PARTICIPATION: 'Governance Participation',
    COMMUNITY_CONTRIBUTION: 'Community Contribution',
    PENALTY_SPAM: 'Spam Penalty',
    PENALTY_MISCONDUCT: 'Misconduct Penalty',
  };
  return labels[type] || type;
}
