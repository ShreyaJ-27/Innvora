import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-bar">
      <div className="footer-left">
        <span className="footer-sys mono">SYS_BUILD: v3.4.2-rel</span>
        <span className="footer-sep">•</span>
        <span className="footer-text">AMAZON LOGISTICS INTERNAL OPERATIONS INFRASTRUCTURE</span>
      </div>

      <div className="footer-center">
        <span className="sla-badge">SLA COMPLIANCE: 99.82%</span>
      </div>

      <div className="footer-right mono">
        <span>GATEWAY: ap-south-1 (MUMBAI)</span>
        <span className="footer-sep">•</span>
        <span>LATENCY: 18ms</span>
      </div>
    </footer>
  );
}
