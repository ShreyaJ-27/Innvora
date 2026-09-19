import React, { useState, useMemo } from 'react';

export default function ExceptionList({
  exceptions = [],
  selectedId,
  onSelectException,
  approvedMap = {},
  onOpenReview
}) {
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      const isApproved = approvedMap[item.id];
      if (activeTab === 'ALL') return true;
      if (activeTab === 'CRITICAL') return item.severity === 'CRITICAL';
      if (activeTab === 'WAITING_ON_ME') return !isApproved;
      if (activeTab === 'APPROVED') return isApproved;
      return true;
    });
  }, [exceptions, activeTab, approvedMap]);

  return (
    <div className="table-card">
      {/* Table Top Controls (Exact style from Image 2) */}
      <div className="table-top-bar">
        <div className="table-heading-row">
          <span className="table-main-title">Active exceptions</span>
          <div className="table-tab-pills">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'WAITING_ON_ME', label: 'Waiting on me' },
              { id: 'APPROVED', label: 'Approved' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`table-tab-pill ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <span className="table-count mono">{filteredExceptions.length} exceptions</span>
      </div>

      {/* Table Header Row */}
      <div className="table-header-row">
        <span className="th-col col-hub">EXCEPTION / HUB</span>
        <span className="th-col col-root">CATEGORY & ROOT CAUSE</span>
        <span className="th-col col-status">STATUS</span>
        <span className="th-col col-capacity">CAPACITY / TIMELINE</span>
        <span className="th-col col-qty">QTY</span>
        <span className="th-col col-note">NOTE</span>
      </div>

      {/* Table Data Rows */}
      <div className="table-body">
        {filteredExceptions.map((ex) => {
          const isSelected = ex.id === selectedId;
          const isApproved = approvedMap[ex.id];

          return (
            <div
              key={ex.id}
              className={`table-row ${isSelected ? 'row-selected' : ''}`}
              onClick={() => onSelectException(ex.id)}
            >
              {/* Col 1: Exception / Hub */}
              <div className="th-col col-hub">
                <div className="hub-primary-name">{ex.hubName}</div>
                <div className="hub-sub-details mono">
                  <span>{ex.hubId}</span>
                  <span className="sep">•</span>
                  <span>{ex.id}</span>
                </div>
              </div>

              {/* Col 2: Category & Root Cause */}
              <div className="th-col col-root">
                <div className="category-title">{ex.category}</div>
                <div className="category-summary">
                  {ex.investigation?.rootCause || 'Under investigation'}
                </div>
              </div>

              {/* Col 3: Status with glowing dot */}
              <div className="th-col col-status">
                {isApproved ? (
                  <span className="status-pill-resolved">
                    <span className="dot dot-green"></span>
                    <span>approved</span>
                  </span>
                ) : (
                  <span className={`status-pill status-${ex.severity.toLowerCase()}`}>
                    <span className={`dot dot-${ex.severity === 'CRITICAL' ? 'red' : (ex.severity === 'HIGH' ? 'orange' : 'yellow')}`}></span>
                    <span>{ex.severity.toLowerCase()}</span>
                  </span>
                )}
              </div>

              {/* Col 4: Capacity Bar & Timeline */}
              <div className="th-col col-capacity">
                <div className="timeline-labels mono">
                  <span>{ex.capacityPercentage}% load</span>
                  <span className={ex.capacityPercentage <= 60 ? 'text-red' : 'text-amber'}>
                    {ex.capacityPercentage <= 60 ? '-24% deficit' : 'nominal'}
                  </span>
                </div>
                <div className="timeline-track">
                  <div
                    className="timeline-fill"
                    style={{
                      width: `${ex.capacityPercentage}%`,
                      backgroundColor: ex.capacityPercentage <= 60 ? '#ef4444' : '#0ea5e9'
                    }}
                  />
                </div>
                <div className="timeline-dates mono">
                  <span>{ex.currentCapacity?.toLocaleString()} / {ex.maxCapacity?.toLocaleString()}</span>
                  <span>{ex.detectedAt}</span>
                </div>
              </div>

              {/* Col 5: QTY */}
              <div className="th-col col-qty mono">
                <div className="qty-total">{ex.affectedOrders?.toLocaleString()}</div>
                <div className="qty-priority text-red">{ex.priorityOrders?.toLocaleString()} Prime</div>
              </div>

              {/* Col 6: Note & Action Tag (like WAIT ME in Image 2) */}
              <div className="th-col col-note">
                {isApproved ? (
                  <span className="note-tag tag-approved mono">RESOLVED</span>
                ) : (
                  <button
                    className="note-tag tag-wait mono"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectException(ex.id);
                      if (onOpenReview) onOpenReview();
                    }}
                  >
                    WAIT ME
                  </button>
                )}
                <span className="note-desc">
                  {isApproved ? 'dispatched to relay' : 'needs approval'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
