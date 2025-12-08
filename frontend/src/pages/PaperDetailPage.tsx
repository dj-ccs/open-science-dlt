import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePapersStore } from '../store/papers';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import type { Discussion, PaperStatus } from '../types';

const STATUS_LABELS: Record<PaperStatus, { label: string; class: string }> = {
  SUBMITTED: { label: 'Submitted', class: 'badge-warning' },
  IN_REVIEW: { label: 'In Review', class: 'badge-primary' },
  PEER_REVIEWED: { label: 'Peer Reviewed', class: 'badge-success' },
  VERIFIED: { label: 'Verified', class: 'badge bg-science-100 text-science-800' },
};

export default function PaperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentPaper: paper, isLoading, error, fetchPaper } = usePapersStore();
  const { isAuthenticated, user } = useAuthStore();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPaper(id);
      loadDiscussions(id);
    }
  }, [id, fetchPaper]);

  const loadDiscussions = async (paperId: string) => {
    try {
      const data = await api.getDiscussions(paperId);
      setDiscussions(data);
    } catch {
      // Discussions endpoint might not exist yet
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmitting(true);
    try {
      const discussion = await api.createDiscussion(id, { content: newComment });
      setDiscussions([discussion, ...discussions]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Paper Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The requested paper could not be found.'}</p>
        <Link to="/papers" className="btn-primary">
          Browse Papers
        </Link>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[paper.status];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back link */}
      <Link to="/papers" className="text-primary-600 hover:text-primary-700 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Papers
      </Link>

      {/* Paper Header */}
      <div className="card p-8 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className={statusInfo.class}>{statusInfo.label}</span>
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 font-mono"
            >
              {paper.doi}
            </a>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">{paper.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
          <span>Published {new Date(paper.createdAt).toLocaleDateString()}</span>
          {paper.submitter && (
            <Link to={`/users/${paper.submitter.id}`} className="text-primary-600 hover:text-primary-700">
              by {paper.submitter.displayName || paper.submitter.stellarPublicKey.slice(0, 12) + '...'}
            </Link>
          )}
        </div>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 mb-6">
          {paper.keywords.map((keyword) => (
            <span key={keyword} className="badge bg-gray-100 text-gray-700">
              {keyword}
            </span>
          ))}
        </div>

        {/* Abstract */}
        <div className="prose max-w-none">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Abstract</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{paper.abstract}</p>
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blockchain Record</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-32 flex-shrink-0">Stellar TX:</span>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${paper.stellarTxHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary-600 hover:text-primary-700 break-all"
            >
              {paper.stellarTxHash}
            </a>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-32 flex-shrink-0">IPFS Hash:</span>
            <a
              href={`https://ipfs.io/ipfs/${paper.ipfsHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary-600 hover:text-primary-700 break-all"
            >
              {paper.ipfsHash}
            </a>
          </div>
          {paper.stellarLedger && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 w-32 flex-shrink-0">Ledger:</span>
              <span className="font-mono">{paper.stellarLedger}</span>
            </div>
          )}
        </div>
      </div>

      {/* Discussion Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Discussion ({discussions.length})
        </h2>

        {/* New Comment Form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts on this research..."
              className="input min-h-[100px] mb-3"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="btn-primary"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-gray-600 mb-2">Sign in to join the discussion</p>
            <Link to="/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        )}

        {/* Comments List */}
        {discussions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No comments yet. Be the first to start the discussion!
          </p>
        ) : (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <CommentCard
                key={discussion.id}
                discussion={discussion}
                currentUserId={user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentCard({
  discussion,
  currentUserId,
}: {
  discussion: Discussion;
  currentUserId?: string;
}) {
  const isOwner = currentUserId === discussion.authorId;

  return (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary-700">
            {discussion.author?.displayName?.[0] || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {discussion.author?.displayName || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(discussion.createdAt).toLocaleDateString()}
            </span>
            {discussion.isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
            {isOwner && (
              <span className="badge-primary text-xs">You</span>
            )}
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{discussion.content}</p>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button className="text-gray-500 hover:text-primary-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {discussion.likesCount}
            </button>
            <button className="text-gray-500 hover:text-primary-600">
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
