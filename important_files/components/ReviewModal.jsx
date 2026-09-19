import React, { useEffect } from 'react';

export default function ReviewModal({
  isOpen,
  exception,
  onClose,
  onApprove,
  onReject
}) {
  // Keyboard shortcuts: 'A' to approve, 'R' to reject, 'Escape' to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onApprove();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onReject();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onApprove, onReject, onClose]);

  if (!isOpen || !exception) return null;

  const { hubName, hubId, recommendation, affectedOrders, priorityOrders } = exception;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-hitl">HITL AUTHORIZATION</span>
            <h2 className="modal-title">Review & Approve Delivery Exception Action</h2>
            <span className="modal-subtitle">
              Authorize automated carrier dispatch and parcel rerouting orders
            </span>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Executive Overview Box */}
          <div className="modal-section-box">
            <div className="box-title">EXCEPTION TARGET & VOLUME</div>
            <div className="modal-grid-2">
              <div className="modal-data-cell">
                <span className="data-lbl">Originating Hub:</span>
                <span className="data-txt mono">
                  <strong>{hubName}</strong> ({hubId})
                </span>
              </div>
              <div className="modal-data-cell">
                <span className="data-lbl">Total At-Risk Orders:</span>
                <span className="data-txt mono text-amber">
                  {affectedOrders?.toLocaleString()} parcels ({priorityOrders?.toLocaleString()} Prime)
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommended Execution Action */}
          <div className="modal-section-box highlight-box">
            <div className="box-title">PROPOSED ACTION PACKAGE</div>
            <h3 className="modal-action-title">{recommendation?.actionTitle}</h3>
            <p className="modal-action-desc">{recommendation?.shortSummary}</p>

            <div className="modal-key-points">
              <div className="key-point">
                <span className="point-icon">✓</span>
                <span className="point-text">
                  <strong>Batch Transfer Target:</strong> {recommendation?.targetHubs?.join(', ')}
                </span>
              </div>
              <div className="key-point">
                <span className="point-icon">✓</span>
                <span className="point-text">
                  <strong>Delivery Preservation:</strong> {recommendation?.impactMitigation?.slaBreachPrevented}
                </span>
              </div>
              <div className="key-point">
                <span className="point-icon">✓</span>
                <span className="point-text">
                  <strong>Route Variance Overhead:</strong> {recommendation?.impactMitigation?.costImpact}
                </span>
              </div>
              <div className="key-point">
                <span className="point-icon">✓</span>
                <span className="point-text">
                  <strong>Relief Velocity:</strong> {recommendation?.impactMitigation?.backlogReduction}
                </span>
              </div>
            </div>
          </div>

          {/* Operator Audit Sign-off notice */}
          <div className="audit-disclaimer">
            <svg className="audit-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p>
              By approving, an immutable audit event will be recorded in the AWS CloudTrail Operations Log. 
              Carriers will immediately receive dynamic waybills via Amazon Relay.
            </p>
          </div>

          {/* Keyboard Shortcuts Prompt */}
          <div className="keyboard-hints">
            <span className="kbd-item"><kbd>A</kbd> Approve & Execute</span>
            <span className="kbd-item"><kbd>R</kbd> Reject Recommendation</span>
            <span className="kbd-item"><kbd>Esc</kbd> Dismiss</span>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="modal-footer">
          <button className="btn-reject" onClick={onReject}>
            <span className="btn-kbd-hint">[R]</span>
            <span>Reject / Dismiss</span>
          </button>
          <div className="footer-right-actions">
            <button className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-approve" onClick={onApprove}>
              <span className="btn-kbd-hint">[A]</span>
              <span>Authorize & Execute Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
