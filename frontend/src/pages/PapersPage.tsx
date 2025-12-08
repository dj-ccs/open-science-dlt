import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePapersStore } from '../store/papers';
import type { Paper, PaperStatus } from '../types';

const STATUS_LABELS: Record<PaperStatus, { label: string; class: string }> = {
  SUBMITTED: { label: 'Submitted', class: 'badge-warning' },
  IN_REVIEW: { label: 'In Review', class: 'badge-primary' },
  PEER_REVIEWED: { label: 'Peer Reviewed', class: 'badge-success' },
  VERIFIED: { label: 'Verified', class: 'badge bg-science-100 text-science-800' },
};

export default function PapersPage() {
  const { papers, pagination, isLoading, error, fetchPapers, setFilters, filters } = usePapersStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchQuery });
  };

  const handleStatusFilter = (status: string | undefined) => {
    setFilters({ status });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Research Papers</h1>
        <p className="text-gray-600 mt-2">Browse published research on the Open Science platform</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search papers by title, abstract, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value || undefined)}
              className="input py-1.5 w-auto"
            >
              <option value="">All</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="PEER_REVIEWED">Peer Reviewed</option>
              <option value="VERIFIED">Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {/* Papers List */}
      {!isLoading && papers.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No papers found</h3>
          <p className="text-gray-600">Be the first to publish research on the platform!</p>
        </div>
      )}

      {!isLoading && papers.length > 0 && (
        <div className="space-y-4">
          {papers.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => fetchPapers(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn-outline disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchPapers(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="btn-outline disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function PaperCard({ paper }: { paper: Paper }) {
  const statusInfo = STATUS_LABELS[paper.status];

  return (
    <Link to={`/papers/${paper.id}`} className="card p-6 block hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className={statusInfo.class}>{statusInfo.label}</span>
            {paper.doi && (
              <span className="text-xs text-gray-500 font-mono">{paper.doi}</span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {paper.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-3">
            {paper.abstract}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {paper.keywords.slice(0, 5).map((keyword) => (
              <span key={keyword} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {keyword}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>
              {new Date(paper.createdAt).toLocaleDateString()}
            </span>
            {paper._count && (
              <>
                <span>{paper._count.reviews} reviews</span>
                <span>{paper._count.discussions} comments</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
