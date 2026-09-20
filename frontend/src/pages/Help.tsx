import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/common/Card';
import {
  BookOpen, Zap, Database, Search, ArrowRight, ChevronDown, ChevronUp
} from 'lucide-react';

const FAQS = [
  {
    q: 'What does the inventory status mean?',
    a: 'Innvora classifies each SKU into one of four states: Healthy (stock above safety buffer), Reorder Soon (approaching reorder point within lead time), Critical (below safety stock — order immediately), and Overstocked (excess stock relative to demand velocity).'
  },
  {
    q: 'How does Innvora calculate the recommended reorder quantity?',
    a: 'The recommended quantity is calculated using: (Lead Time Demand = Daily Rate × Lead Days) + Safety Stock Buffer − Current On-Hand Stock. This gives you the exact quantity needed to cover the replenishment cycle.'
  },
  {
    q: 'What is "days of stock"?',
    a: 'Days of stock is how many days your current available stock will last based on your current daily demand rate. When this drops below your supplier lead time, a reorder recommendation is triggered.'
  },
  {
    q: 'How does the event simulator work?',
    a: 'The demo event simulator sends real inventory events (Sales, Restocks, Transfers, etc.) to the live AWS backend via the API Gateway. These events are processed asynchronously through SQS, update DynamoDB, and get indexed in OpenSearch — all in real time.'
  },
  {
    q: 'Why does the data not persist on refresh?',
    a: 'This is the demo environment. The backend is fully live on AWS, but for this hackathon submission, the demo simulator creates temporary events. In a production setup, events would come from POS systems, ERP integrations, and warehouse management systems.'
  },
  {
    q: 'Can I add my own products?',
    a: 'The "Add Product" UI is fully built but the backend catalog endpoint (POST /products) is not yet connected in this demo. The form captures all required data: SKU, category, pricing, replenishment parameters, and initial stock location.'
  },
];

const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-sand-300 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-4 text-left gap-3 hover:bg-sand-200 px-1 rounded-lg transition-colors"
      >
        <span className="text-sm font-medium text-charcoal-800">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-charcoal-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="w-4 h-4 text-charcoal-400 shrink-0 mt-0.5" />
        )}
      </button>
      {open && (
        <p className="text-xs text-charcoal-600 leading-relaxed pb-4 px-1">{a}</p>
      )}
    </div>
  );
};

const CONCEPTS = [
  { icon: <Zap className="w-4 h-4" />, title: 'Inventory Events', desc: 'Every stock movement (Sale, Restock, Transfer, Return, Adjustment) is captured as an immutable event and processed through the SQS pipeline.' },
  { icon: <Database className="w-4 h-4" />, title: 'Stock State', desc: 'DynamoDB stores the current stock state per product per location. Events are applied atomically via conditional writes to prevent race conditions.' },
  { icon: <Search className="w-4 h-4" />, title: 'Event History', desc: 'Every event is indexed in Amazon OpenSearch. Use the Search page to query by SKU, event type, location, or date range.' },
  { icon: <BookOpen className="w-4 h-4" />, title: 'Replenishment Logic', desc: 'Status classification and reorder recommendations are computed server-side from daily demand velocity, lead times, safety stock, and reorder points.' },
];

export const Help: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Documentation"
        title="Help & Docs"
        subtitle="Understand how Innvora works, what the data means, and how to use the platform."
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main docs area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core concepts */}
          <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Core Concepts</h3>}>
            <div className="grid sm:grid-cols-2 gap-4">
              {CONCEPTS.map((c) => (
                <div key={c.title} className="p-4 bg-sand-200 border border-sand-300 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-charcoal-800 text-sand-200 rounded-md">{c.icon}</div>
                    <h4 className="text-xs font-bold text-charcoal-900">{c.title}</h4>
                  </div>
                  <p className="text-xs text-charcoal-500 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* FAQs */}
          <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Frequently Asked Questions</h3>}>
            {FAQS.map((faq) => (
              <FAQ key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick Links */}
          <Card header={<h3 className="text-sm font-semibold text-charcoal-900">Quick Links</h3>}>
            <div className="space-y-1.5">
              {[
                { label: 'Dashboard Overview', href: '/dashboard' },
                { label: 'Inventory Management', href: '/inventory' },
                { label: 'Replenishment Queue', href: '/reorders' },
                { label: 'Activity Ledger', href: '/activity' },
                { label: 'Search & Export', href: '/search' },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sand-200 text-sm text-charcoal-700 transition-colors group"
                >
                  {link.label}
                  <ArrowRight className="w-3.5 h-3.5 text-charcoal-400 group-hover:text-charcoal-700 transition-colors" />
                </a>
              ))}
            </div>
          </Card>

          {/* AWS Stack */}
          <Card header={<h3 className="text-sm font-semibold text-charcoal-900">AWS Infrastructure</h3>}>
            <div className="space-y-1.5">
              {[
                'API Gateway — Inventory event ingestion',
                'Lambda — Receiver & Processor',
                'SQS — Async event queue',
                'DynamoDB — Inventory state store',
                'OpenSearch — Event search index',
                'VPC + IAM — Network security',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-charcoal-600 py-1.5 border-b border-sand-300 last:border-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-charcoal-500 mt-1 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </Card>

          {/* Contact */}
          <div className="bg-sand-200 border border-sand-400 rounded-xl p-4">
            <p className="text-xs font-semibold text-charcoal-800 mb-1">Built for AWS Hackathon 2026</p>
            <p className="text-xs text-charcoal-500 leading-relaxed">
              Innvora is a full-stack inventory operations platform built on AWS serverless infrastructure.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
