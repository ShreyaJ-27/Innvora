import React from 'react';

export default function WorkflowStepper({ approved, showReview, isAnalyzing }) {
  // Steps in the AmazonFlow resolution lifecycle
  const steps = [
    { id: 'detect', label: '1. Detect', desc: 'Anomaly Triggered', status: 'completed' },
    { id: 'investigate', label: '2. Investigate', desc: 'Telemetry & Root Cause', status: isAnalyzing ? 'active' : 'completed' },
    { id: 'impact', label: '3. Estimate Impact', desc: 'SLA & Volume Quantified', status: isAnalyzing ? 'active' : 'completed' },
    { id: 'recommend', label: '4. Recommend Action', desc: 'AI Reassignment Ready', status: isAnalyzing ? 'active' : 'completed' },
    { 
      id: 'approval', 
      label: '5. Human Approval', 
      desc: approved ? 'Approved by Operator' : (showReview ? 'Review in Progress' : 'Awaiting Review'),
      status: approved ? 'completed' : (showReview ? 'active' : 'pending')
    },
    { 
      id: 'record', 
      label: '6. Action Recorded', 
      desc: approved ? 'Dispatched to Fulfillment' : 'Standby for Execution',
      status: approved ? 'completed-success' : 'pending'
    }
  ];

  return (
    <div className="workflow-stepper-container">
      <div className="stepper-header">
        <span className="stepper-title">RESOLUTION PIPELINE PROGRESSION</span>
        <span className="stepper-sub">HITL Workflow State Engine</span>
      </div>

      <div className="stepper-track">
        {steps.map((step, idx) => {
          const isCompleted = step.status === 'completed' || step.status === 'completed-success';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';

          return (
            <React.Fragment key={step.id}>
              <div className={`step-node ${step.status}`}>
                <div className="step-circle">
                  {isCompleted ? (
                    <svg className="step-icon-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="mono">{idx + 1}</span>
                  )}
                </div>
                <div className="step-content">
                  <span className="step-label">{step.label}</span>
                  <span className="step-desc">{step.desc}</span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'connector-done' : ''}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
