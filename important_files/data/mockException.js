export const INITIAL_EXCEPTIONS = [
  {
    id: "EXP-8821",
    hubId: "HUB-BOM-02",
    hubName: "Mumbai Hub 02",
    zone: "West Division — Western Corridor",
    severity: "CRITICAL",
    category: "Capacity Deficit",
    detectedAt: "10 mins ago",
    currentCapacity: 2800,
    maxCapacity: 5000,
    capacityPercentage: 56,
    affectedOrders: 1400,
    priorityOrders: 600,
    standardOrders: 800,
    status: "AWAITING_APPROVAL", // DETECTED, INVESTIGATING, IMPACT_ESTIMATED, AWAITING_APPROVAL, RECORDED
    investigation: {
      rootCause: "Inbound volume surge from Bhiwandi fulfillment center combined with Shift-B sorter throughput drop (-22%).",
      telemetryAlerts: [
        "Inbound feeder dock queue: +41 vehicles vs scheduled",
        "Sorter line #4 throughput: 1,420 u/h (nominal: 2,100 u/h)",
        "Staging bay congestion: 94% capacity occupied"
      ],
      estimatedBacklogTime: "4.8 hours until full gridlock"
    },
    recommendation: {
      actionTitle: "Reassign 320 Priority Shipments to Thane Hub 01 & Bhiwandi West",
      shortSummary: "Divert 320 same-day Prime parcels to Thane Hub 01 and Bhiwandi West spoke to prevent SLA breaches.",
      confidence: 91,
      confidenceBreakdown: [
        { factor: "Alternate Hub Ingestion Headroom", score: 95, note: "Thane Hub 01 operating at only 42% capacity with ready staging bays." },
        { factor: "Transit Route Feasibility", score: 89, note: "Eastern Express Highway corridor clear of construction delays." },
        { factor: "SLA Preservation Probability", score: 93, note: "Projected 99.4% on-time delivery retention for reassigned orders." }
      ],
      impactMitigation: {
        slaBreachPrevented: "320 Priority Deliveries Saved",
        costImpact: "+₹4,200 total dynamic routing variance",
        backlogReduction: "-38% pressure reduction on Mumbai Hub 02 within 45 min",
        estimatedCompletionTime: "Immediate automated batch transfer upon approval"
      },
      targetHubs: ["Thane Hub 01", "Bhiwandi Spoke 04"],
      suggestedActionCode: "REROUTE_BATCH_PRIORITY_320"
    }
  },
  {
    id: "EXP-8819",
    hubId: "HUB-DEL-01",
    hubName: "Delhi Hub 01",
    zone: "North Division — NCR Cluster",
    severity: "CRITICAL",
    category: "Mechanical Breakdown",
    detectedAt: "24 mins ago",
    currentCapacity: 3900,
    maxCapacity: 6000,
    capacityPercentage: 65,
    affectedOrders: 820,
    priorityOrders: 380,
    standardOrders: 440,
    status: "AWAITING_APPROVAL",
    investigation: {
      rootCause: "Automated optical scanner rail misalignment on Secondary Sorter Bay #2 causing recurring parcel ejection faults.",
      telemetryAlerts: [
        "Optical scanner read failure rate: 18.4% (threshold: 0.5%)",
        "Belt drive motor thermal reading: 78°C (warning state)"
      ],
      estimatedBacklogTime: "2.5 hours before overflow to manual sort"
    },
    recommendation: {
      actionTitle: "Dynamic Lane Reroute: Channel Inbound Flow to Noida Hub 03",
      shortSummary: "Reroute 280 incoming freight containers to Noida Hub 03 and throttle inbound line 2 by 40%.",
      confidence: 88,
      confidenceBreakdown: [
        { factor: "Noida Hub Sorter Availability", score: 92, note: "Dual optical lines active with surplus capacity." },
        { factor: "Secondary Transit SLA Delta", score: 86, note: "+18 min transit overhead absorbed within buffer." }
      ],
      impactMitigation: {
        slaBreachPrevented: "280 Critical Shipments Preserved",
        costImpact: "+₹2,100 fuel subsidy",
        backlogReduction: "-55% mechanical line pressure",
        estimatedCompletionTime: "20 minutes to enact telemetry reroute"
      },
      targetHubs: ["Noida Hub 03"],
      suggestedActionCode: "REROUTE_DEL_NOIDA_280"
    }
  },
  {
    id: "EXP-8814",
    hubId: "HUB-BLR-03",
    hubName: "Bengaluru South 03",
    zone: "South Division — Tech Corridor",
    severity: "HIGH",
    category: "Fleet Shortage",
    detectedAt: "45 mins ago",
    currentCapacity: 3400,
    maxCapacity: 4500,
    capacityPercentage: 75,
    affectedOrders: 450,
    priorityOrders: 210,
    standardOrders: 240,
    status: "AWAITING_APPROVAL",
    investigation: {
      rootCause: "Local power substation outage tripped EV Fast-Charging cluster; 18 3-wheeler delivery vans uncharged for morning wave.",
      telemetryAlerts: [
        "EV fleet readiness: 64% (required: 92%)",
        "Electronic dispatch queue delayed by 38 mins"
      ],
      estimatedBacklogTime: "1.2 hours until next delivery window drops"
    },
    recommendation: {
      actionTitle: "Activate Third-Party Flex Delivery Fleet & Surge Dispatch from Whitefield",
      shortSummary: "Summon 12 Amazon Flex contractors and re-index routes to start immediate parcel pickup.",
      confidence: 94,
      confidenceBreakdown: [
        { factor: "Flex Contractor Density", score: 96, note: "19 drivers currently within 3km radius." },
        { factor: "Route Readiness", score: 92, note: "Optimized route packs pre-computed for Koramangala & HSR." }
      ],
      impactMitigation: {
        slaBreachPrevented: "210 Priority Orders Protected",
        costImpact: "₹1,800 surge incentive tier",
        backlogReduction: "Zero delivery window slippage",
        estimatedCompletionTime: "15 minutes dispatch activation"
      },
      targetHubs: ["Whitefield Reserve Hub"],
      suggestedActionCode: "DISPATCH_FLEX_SURGE_12"
    }
  },
  {
    id: "EXP-8809",
    hubId: "HUB-HYD-01",
    hubName: "Hyderabad Central",
    zone: "South Division — Deccan Hub",
    severity: "MEDIUM",
    category: "Weather Disruption",
    detectedAt: "1 hour ago",
    currentCapacity: 4100,
    maxCapacity: 5500,
    capacityPercentage: 74,
    affectedOrders: 310,
    priorityOrders: 120,
    standardOrders: 190,
    status: "AWAITING_APPROVAL",
    investigation: {
      rootCause: "Severe localized monsoon downpour on NH44 bypass causing 45-min bottleneck for regional arterial line-hauls.",
      telemetryAlerts: [
        "Telemetry speed sensor on NH44 corridor: 14 km/h (average: 55 km/h)",
        "Waterlogging reported at Exit 8 underpass"
      ],
      estimatedBacklogTime: "Predictive rain clearance in 90 minutes"
    },
    recommendation: {
      actionTitle: "Enable Dynamic SLA Customer Notification & Intermodal Rail Bypass",
      shortSummary: "Trigger 45-minute proactive delivery window update for affected customers; route non-urgent parcels via Outer Ring Road.",
      confidence: 87,
      confidenceBreakdown: [
        { factor: "Customer CSAT Protection", score: 91, note: "Proactive notice reduces WISMO queries by 84%." },
        { factor: "Alternate Arterial Congestion", score: 83, note: "ORR clear with negligible transit increment." }
      ],
      impactMitigation: {
        slaBreachPrevented: "Zero Customer Complaints via Automated Advisory",
        costImpact: "₹0 routing delta",
        backlogReduction: "Prevents secondary dock jams",
        estimatedCompletionTime: "Instant notification broadcast"
      },
      targetHubs: ["Outer Ring Road Ring 02"],
      suggestedActionCode: "NOTIFY_ADVISORY_ORR"
    }
  }
];

export const INITIAL_ACTIVITY_LOG = [
  {
    id: "ACT-103",
    timestamp: "14 mins ago",
    hubName: "Pune Central Hub",
    action: "Approved: Re-routed 180 parcels to Hinjewadi Spoke",
    operator: "K. Deshmukh (Lead Ops)",
    impact: "100% SLA preserved",
    status: "EXECUTED"
  },
  {
    id: "ACT-102",
    timestamp: "42 mins ago",
    hubName: "Kolkata Hub 01",
    action: "Auto-Resolved: Conveyor speed calibrated to 2.2 m/s",
    operator: "AmazonFlow Autonomous Agent",
    impact: "Throughput restored to 3,400 u/h",
    status: "COMPLETED"
  },
  {
    id: "ACT-101",
    timestamp: "1 hour ago",
    hubName: "Jaipur North 02",
    action: "Approved: Dynamic SLA window adjusted (+2h) for heavy sandstorm",
    operator: "R. Sharma (Ops Manager)",
    impact: "940 customers notified proactively",
    status: "EXECUTED"
  }
];

export const DISRUPTION_PRESETS = [
  {
    id: `EXP-${Math.floor(8830 + Math.random() * 50)}`,
    hubId: "HUB-MAA-04",
    hubName: "Chennai North 04",
    zone: "South Division — Coastal Cluster",
    severity: "CRITICAL",
    category: "Sorter Calibration Drift",
    detectedAt: "Just now",
    currentCapacity: 1950,
    maxCapacity: 4800,
    capacityPercentage: 40,
    affectedOrders: 1650,
    priorityOrders: 720,
    standardOrders: 930,
    status: "AWAITING_APPROVAL",
    investigation: {
      rootCause: "Primary sorter induction sensor fault at Conveyor Bay 3 causing 60% rejected parcels to recirculate indefinitely.",
      telemetryAlerts: [
        "Recirculation loop count: 4.8x nominal baseline",
        "Induction gate response latency: 450ms (threshold: 80ms)"
      ],
      estimatedBacklogTime: "Critical gridlock within 40 minutes"
    },
    recommendation: {
      actionTitle: "Dynamic Line Diversion: Divert 400 Priority Packets to Sriperumbudur Hub",
      shortSummary: "Emergency switch to Sriperumbudur Hub line 1 while executing automated reboot of Conveyor Bay 3 sensors.",
      confidence: 89,
      confidenceBreakdown: [
        { factor: "Sriperumbudur Line Availability", score: 94, note: "Spare sorting capacity of 1,200 units/hr." },
        { factor: "Emergency Shunt Van ETA", score: 85, note: "Shuttle trucks ready on bay 6." }
      ],
      impactMitigation: {
        slaBreachPrevented: "400 Express Prime Parcels Saved",
        costImpact: "+₹3,500 dedicated logistics transfer",
        backlogReduction: "-45% conveyor choke point release",
        estimatedCompletionTime: "12 minutes execution time"
      },
      targetHubs: ["Sriperumbudur Hub 01"],
      suggestedActionCode: "DVERT_MAA_SRIPERUMBUDUR_400"
    }
  },
  {
    id: `EXP-${Math.floor(8880 + Math.random() * 50)}`,
    hubId: "HUB-AMD-02",
    hubName: "Ahmedabad Hub 02",
    zone: "West Division — Gujarat Industrial",
    severity: "HIGH",
    category: "Last-Mile Courier Shortage",
    detectedAt: "Just now",
    currentCapacity: 2600,
    maxCapacity: 3800,
    capacityPercentage: 68,
    affectedOrders: 640,
    priorityOrders: 310,
    standardOrders: 330,
    status: "AWAITING_APPROVAL",
    investigation: {
      rootCause: "Unexpected festival traffic cordon around Old City preventing van entry for afternoon drop cycle.",
      telemetryAlerts: [
        "6 urban van routes blocked by police barricade",
        "Delayed departure timer: +52 min on 14 vans"
      ],
      estimatedBacklogTime: "Evening prime delivery window at risk"
    },
    recommendation: {
      actionTitle: "Switch to Two-Wheeler Walker & Micro-Hub Drop Distribution",
      shortSummary: "Transfer parcels to 24 two-wheeler couriers staged at Gandhinagar cross-dock for localized alley delivery.",
      confidence: 93,
      confidenceBreakdown: [
        { factor: "Two-Wheeler Availability", score: 95, note: "24 couriers stationed ready for micro-distribution." },
        { factor: "Alleyway Accessibility", score: 91, note: "Bypasses all vehicular cordon zones." }
      ],
      impactMitigation: {
        slaBreachPrevented: "310 Priority Shipments Preserved",
        costImpact: "+₹1,200 micro-courier incentive",
        backlogReduction: "Cordon bypass restores 100% flow",
        estimatedCompletionTime: "Immediate dispatch"
      },
      targetHubs: ["Gandhinagar Cross-Dock Spoke"],
      suggestedActionCode: "DEPLOY_MICRO_COURIERS_24"
    }
  }
];
