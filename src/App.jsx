import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Home, ClipboardList, FolderOpen, BookOpen, Plus, Search, MapPin, Droplet,
  Trash2, Download, Check, ChevronDown, ChevronUp, AlertTriangle, Bug,
  Users, RotateCcw, Save, X
} from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// ---------- Reference data (Krachi Nchumuru District, Oti Region) ----------
const COMMUNITIES = ['Chinderi', 'Banda', 'Borae', 'Bejamse', 'Akaniem', 'Anyinamae', 'Chayo', 'Grubi', 'Other'];
const DWELLING_TYPES = ['Compound house', 'Single/detached house', 'Semi-detached', 'Kiosk/Structure', 'Other'];
const WATER_SOURCES = ['Pipe-borne (in house)', 'Pipe-borne (public standpipe)', 'Borehole', 'Hand-dug well (unprotected)', 'River/Stream/Lake', 'Sachet/Tanker water', 'Other'];
const TOILET_FACILITIES = ['Water Closet (WC)', 'KVIP', 'Pit latrine (covered)', 'Pit latrine (uncovered)', 'Pan/Bucket latrine', 'None / Open defecation'];
const WASTE_DISPOSAL = ['Door-to-door collection', 'Public/Communal dump', 'Burning', 'Burying', 'Indiscriminate dumping'];
const COMPOUND_CLEANLINESS = ['Clean', 'Fairly clean', 'Dirty'];
const VECTOR_FLAGS = [
  'Mosquito breeding sites (stagnant water)',
  'Rodent evidence (droppings/burrows)',
  'Fly breeding (exposed refuse/faeces)',
  'Bush overgrowth around compound',
  'Stagnant wastewater/blocked drains',
];
const COMPLIANCE = ['Compliant', 'Minor non-compliance', 'Major non-compliance'];
const ACTIONS_TAKEN = [
  'Verbal advice given',
  'Written notice/warning issued',
  'Follow-up visit scheduled',
  'Referred to District Environmental Health Unit',
  'Prosecution recommended',
];
const STAMP_COLORS = {
  'Compliant': '#2F6B3A',
  'Minor non-compliance': '#B5651D',
  'Major non-compliance': '#9C3B2E',
};

// Inspection categories beyond the original house-to-house checklist
const INSPECTION_TYPES = ['Household', 'Food Vendor', 'Hotel/Guest House', 'Vendor Medical Screening', 'Industry', 'School'];
const FOOD_STORAGE_OPTIONS = ['Covered & elevated', 'Refrigerated', 'Covered, ground level', 'Exposed/uncovered'];
const EFFLUENT_DISPOSAL_OPTIONS = ['Treated before discharge', 'Municipal sewer connection', 'Soakaway/on-site pit', 'Discharged untreated', 'Other'];
const FOOD_TYPES_SOLD = ['Cooked food/chop bar', 'Raw meat/fish', 'Fruits & vegetables', 'Packaged/dry goods', 'Beverages/sachet water', 'Mixed/other'];
const INDUSTRY_TYPES = ['Food processing', 'Agro-processing', 'Timber/sawmill', 'Quarry/mining-related', 'Manufacturing/light industry', 'Other'];

const TYPE_LABELS = {
  'Household': { subject: 'Head of household', premise: 'House / compound number' },
  'Food Vendor': { subject: 'Vendor / business name', premise: 'Stall / shop number' },
  'Hotel/Guest House': { subject: 'Establishment name', premise: 'Premise number' },
  'Vendor Medical Screening': { subject: 'Vendor / trader name', premise: 'Market stall / ID number' },
  'Industry': { subject: 'Company / industry name', premise: 'Facility number' },
  'School': { subject: 'School name', premise: 'GES/School ID number' },
};


const STORAGE_KEY = 'inspections';
const OFFICER_KEY = 'current-officer-name';

const uid = () => `KN-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

function emptyForm() {
  return {
    id: null,
    inspectionType: 'Household',
    date: new Date().toISOString().slice(0, 10),
    community: '',
    communityOther: '',
    houseId: '',
    gpsNote: '',
    // Household
    headOfHousehold: '',
    householdSize: '',
    dwellingType: '',
    toiletFacility: '',
    refuseContainer: '',
    compoundCleanliness: '',
    overcrowding: '',
    ventilation: '',
    // Shared across most non-household types
    premiseName: '',
    waterSource: '',
    wasteDisposal: '',
    // Food Vendor
    foodTypeSold: '',
    foodHandlerCert: '',
    certExpiry: '',
    handwashFacility: '',
    foodStorage: '',
    // Hotel / Guest House
    numRooms: '',
    toiletRatioAdequate: '',
    fireSafety: '',
    beddingHygiene: '',
    // Vendor Medical Screening
    occupationTrade: '',
    medicalCertPresent: '',
    certIssuingFacility: '',
    screenedCommunicable: '',
    fitForPublicContact: '',
    // Industry
    industryType: '',
    epaPermit: '',
    effluentDisposal: '',
    airEmissionControl: '',
    workersWelfare: '',
    hazardousWasteStorage: '',
    // School
    numPupils: '',
    pupilToiletRatio: '',
    canteenPresent: '',
    // Common
    vectorFlags: [],
    violations: '',
    complianceStatus: '',
    actionTaken: '',
    followUpDate: '',
    notes: '',
  };
}

// The "subject" is whoever/whatever the inspection is about — a household head
// for house-to-house visits, or the business/institution name for everything else.
function subjectNameOf(form) {
  return form.inspectionType === 'Household' ? form.headOfHousehold : form.premiseName;
}

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ---------- Small building blocks ----------
function Section({ n, title, icon: Icon, children }) {
  return (
    <div className="rule-card">
      <div className="section-head">
        <span className="eyebrow">{n}</span>
        <Icon size={16} strokeWidth={2} />
        <h3>{title}</h3>
      </div>
      <div className="section-body">{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}{required && <em>*</em>}</span>
      {children}
    </label>
  );
}

function Stamp({ status, size = 'md' }) {
  if (!status) return null;
  const color = STAMP_COLORS[status] || '#4A6650';
  return (
    <span className={`stamp stamp-${size}`} style={{ color, borderColor: color }}>
      {status === 'Compliant' ? 'COMPLIANT' : status === 'Minor non-compliance' ? 'MINOR ISSUE' : 'MAJOR ISSUE'}
    </span>
  );
}

// ---------- Main App ----------
export default function App() {
  const [tab, setTab] = useState('dashboard');
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [officerName, setOfficerName] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [filterCommunity, setFilterCommunity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Listen live to the shared Firestore database, updates instantly for every officer
  useEffect(() => {
    const q = query(collection(db, 'inspections'), orderBy('savedAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setInspections(snapshot.docs.map((d) => d.data()));
        setLoading(false);
      },
      (err) => {
        setLoadError(true);
        setLoading(false);
      }
    );
    // officer name stays personal to this device
    try {
      const me = localStorage.getItem(OFFICER_KEY);
      if (me) setOfficerName(me);
    } catch (e) { /* no saved name yet */ }
    return () => unsubscribe();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const saveOfficerName = (name) => {
    setOfficerName(name);
    try { localStorage.setItem(OFFICER_KEY, name); } catch (e) { /* ignore */ }
  };

  const updateForm = (patch) => setForm((f) => ({ ...f, ...patch }));
  const toggleVector = (flag) => setForm((f) => ({
    ...f,
    vectorFlags: f.vectorFlags.includes(flag) ? f.vectorFlags.filter((x) => x !== flag) : [...f.vectorFlags, flag],
  }));

  const resetForm = () => { setForm(emptyForm()); setFormError(''); };

  const submitInspection = async () => {
    const community = form.community === 'Other' ? form.communityOther.trim() : form.community;
    const subjectName = subjectNameOf(form).trim();
    if (!community || !form.houseId.trim() || !subjectName || !form.complianceStatus) {
      setFormError('Please fill in community, ID number, name, and compliance status before saving.');
      return;
    }
    setFormError('');
    const record = { ...form, community, officer: officerName || 'Unassigned', savedAt: new Date().toISOString() };
    if (!record.id) record.id = uid();

    try {
      await setDoc(doc(db, 'inspections', record.id), record);
      showToast(`Inspection ${record.id} saved.`);
      resetForm();
      setTab('records');
    } catch (e) {
      setFormError('Could not save to the shared database. Check your internet connection and try again.');
    }
  };

  const deleteInspection = async (id) => {
    try {
      await deleteDoc(doc(db, 'inspections', id));
      showToast('Record deleted.');
    } catch (e) {
      showToast('Could not delete, check your internet connection.');
    }
  };

  const editInspection = (rec) => {
    setForm({
      ...emptyForm(),
      ...rec,
      inspectionType: rec.inspectionType || 'Household',
      communityOther: COMMUNITIES.includes(rec.community) ? '' : rec.community,
      community: COMMUNITIES.includes(rec.community) ? rec.community : 'Other',
    });
    setTab('new');
  };

  const resetAll = async () => {
    try {
      await Promise.all(inspections.map((r) => deleteDoc(doc(db, 'inspections', r.id))));
      setConfirmReset(false);
      showToast('All records cleared.');
    } catch (e) {
      showToast('Could not clear records, check your internet connection.');
    }
  };

  // ---------- Derived data ----------
  const filtered = useMemo(() => {
    return inspections.filter((r) => {
      if (filterCommunity !== 'All' && r.community !== filterCommunity) return false;
      if (filterStatus !== 'All' && r.complianceStatus !== filterStatus) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!(r.headOfHousehold || '').toLowerCase().includes(q) && !(r.houseId || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [inspections, filterCommunity, filterStatus, search]);

  const stats = useMemo(() => {
    const total = inspections.length;
    const compliant = inspections.filter((i) => i.complianceStatus === 'Compliant').length;
    const minor = inspections.filter((i) => i.complianceStatus === 'Minor non-compliance').length;
    const major = inspections.filter((i) => i.complianceStatus === 'Major non-compliance').length;
    const byCommunity = COMMUNITIES.filter((c) => c !== 'Other').map((c) => ({
      name: c, count: inspections.filter((i) => i.community === c).length,
    })).filter((d) => d.count > 0);
    const byType = INSPECTION_TYPES.map((t) => ({
      name: t, count: inspections.filter((i) => (i.inspectionType || 'Household') === t).length,
    })).filter((d) => d.count > 0);
    const vectorTally = {};
    inspections.forEach((i) => (i.vectorFlags || []).forEach((f) => { vectorTally[f] = (vectorTally[f] || 0) + 1; }));
    const violationChart = Object.entries(vectorTally).map(([name, count]) => ({
      name: name.split(' (')[0], count,
    })).sort((a, b) => b.count - a.count);
    const pieData = [
      { name: 'Compliant', value: compliant },
      { name: 'Minor non-compliance', value: minor },
      { name: 'Major non-compliance', value: major },
    ].filter((d) => d.value > 0);
    return { total, compliant, minor, major, byCommunity, byType, violationChart, pieData };
  }, [inspections]);

  const exportCsv = () => {
    const headers = ['ID', 'Date', 'Officer', 'Inspection Type', 'Community', 'ID Number', 'Name/Subject', 'Water Source', 'Waste Disposal', 'Vector Flags', 'Compliance Status', 'Action Taken', 'Follow-up Date', 'Notes'];
    const rows = inspections.map((r) => [
      r.id, r.date, r.officer, r.inspectionType || 'Household', r.community, r.houseId, subjectNameOf(r),
      r.waterSource, r.wasteDisposal,
      (r.vectorFlags || []).join('; '), r.complianceStatus, r.actionTaken, r.followUpDate || '', (r.notes || '').replace(/\n/g, ' '),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krachi-nchumuru-inspections-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new', label: 'New Inspection', icon: Plus },
    { id: 'records', label: 'Records', icon: FolderOpen },
    { id: 'guide', label: 'Field Guide', icon: BookOpen },
  ];

  return (
    <div className="app-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Zilla+Slab:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .app-root {
          --paper: #E9E2CC;
          --card: #F4EFDE;
          --ink: #1F3D2B;
          --ink-soft: #4A6650;
          --stamp-red: #9C3B2E;
          --stamp-green: #2F6B3A;
          --laterite: #B5651D;
          --rule: #C7BC9C;
          font-family: 'IBM Plex Sans', sans-serif;
          background-color: var(--paper);
          background-image: repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(31,61,43,0.07) 28px);
          color: var(--ink);
          min-height: 100vh;
          padding: 0 0 40px 0;
        }
        .app-header {
          background: var(--ink);
          color: var(--paper);
          padding: 18px 20px 22px;
          border-bottom: 6px double var(--laterite);
        }
        .app-header h1 {
          font-family: 'Zilla Slab', serif;
          font-weight: 700;
          font-size: 1.35rem;
          letter-spacing: 0.02em;
          margin: 0 0 2px;
        }
        .app-header .subtitle {
          font-size: 0.8rem;
          opacity: 0.85;
          font-family: 'IBM Plex Mono', monospace;
          letter-spacing: 0.04em;
        }
        .officer-row {
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
        }
        .officer-row input {
          background: rgba(244,239,222,0.12);
          border: 1px solid rgba(244,239,222,0.4);
          color: var(--paper);
          border-radius: 4px;
          padding: 5px 8px;
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.8rem;
          flex: 1;
          max-width: 220px;
        }
        .officer-row input::placeholder { color: rgba(244,239,222,0.55); }

        .tabs {
          display: flex;
          gap: 4px;
          padding: 10px 14px 0;
          overflow-x: auto;
        }
        .tab-btn {
          font-family: 'Zilla Slab', serif;
          font-weight: 600;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px 8px;
          background: #DCD4B7;
          color: var(--ink-soft);
          border: 1px solid var(--rule);
          border-bottom: none;
          border-radius: 8px 8px 0 0;
          cursor: pointer;
          white-space: nowrap;
          transform: translateY(4px);
          transition: transform 0.15s ease, background 0.15s ease;
        }
        .tab-btn.active {
          background: var(--card);
          color: var(--ink);
          transform: translateY(0);
          box-shadow: 0 -2px 0 var(--laterite) inset;
        }

        .content {
          background: var(--card);
          margin: 0 12px;
          padding: 18px 16px 24px;
          border: 1px solid var(--rule);
          border-radius: 0 6px 6px 6px;
          box-shadow: 0 2px 8px rgba(31,61,43,0.08);
        }

        .rule-card {
          background: var(--card);
          border: 1px solid var(--rule);
          border-radius: 8px;
          margin-bottom: 14px;
          overflow: hidden;
        }
        .section-head {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(31,61,43,0.06);
          padding: 9px 12px;
          border-bottom: 1px solid var(--rule);
        }
        .section-head h3 {
          font-family: 'Zilla Slab', serif;
          font-size: 0.95rem;
          margin: 0;
          font-weight: 600;
        }
        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.72rem;
          background: var(--ink);
          color: var(--paper);
          padding: 1px 6px;
          border-radius: 3px;
        }
        .section-body {
          padding: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px 12px;
        }
        .field { display: flex; flex-direction: column; gap: 4px; font-size: 0.82rem; }
        .field-label { font-weight: 500; color: var(--ink-soft); }
        .field-label em { color: var(--stamp-red); font-style: normal; margin-left: 3px; }
        .field input, .field select, .field textarea {
          font-family: 'IBM Plex Sans', sans-serif;
          font-size: 0.85rem;
          padding: 7px 8px;
          border: 1px solid var(--rule);
          border-radius: 5px;
          background: #FBF9F1;
          color: var(--ink);
        }
        .field textarea { resize: vertical; min-height: 56px; }
        .field.full { grid-column: 1 / -1; }

        .checkbox-grid { display: flex; flex-direction: column; gap: 7px; grid-column: 1 / -1; }
        .checkbox-row { display: flex; align-items: flex-start; gap: 8px; font-size: 0.83rem; cursor: pointer; }
        .checkbox-row input { margin-top: 2px; }

        .radio-pills { display: flex; flex-wrap: wrap; gap: 6px; grid-column: 1/-1; }
        .pill {
          border: 1px solid var(--rule);
          border-radius: 20px;
          padding: 6px 12px;
          font-size: 0.8rem;
          cursor: pointer;
          background: #FBF9F1;
        }
        .pill.selected.Compliant { background: var(--stamp-green); color: #fff; border-color: var(--stamp-green); }
        .pill.selected.Minor { background: var(--laterite); color: #fff; border-color: var(--laterite); }
        .pill.selected.Major { background: var(--stamp-red); color: #fff; border-color: var(--stamp-red); }

        .btn {
          font-family: 'Zilla Slab', serif;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 10px 18px;
          border-radius: 6px;
          border: 1px solid var(--ink);
          background: var(--ink);
          color: var(--paper);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }
        .btn.secondary { background: transparent; color: var(--ink); }
        .btn.danger { background: var(--stamp-red); border-color: var(--stamp-red); }
        .form-error {
          color: var(--stamp-red);
          font-size: 0.82rem;
          display: flex; align-items: center; gap: 6px;
          margin-bottom: 10px;
        }
        .toast {
          position: fixed;
          bottom: 18px; left: 50%; transform: translateX(-50%);
          background: var(--ink); color: var(--paper);
          padding: 9px 16px; border-radius: 6px; font-size: 0.85rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 50;
        }

        .stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px,1fr)); gap: 10px; margin-bottom: 16px; }
        .stat-card { background: var(--card); border: 1px solid var(--rule); border-radius: 8px; padding: 12px; text-align: center; }
        .stat-card .num { font-family: 'IBM Plex Mono', monospace; font-size: 1.5rem; font-weight: 600; }
        .stat-card .label { font-size: 0.72rem; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.05em; }

        .chart-card { background: var(--card); border: 1px solid var(--rule); border-radius: 8px; padding: 12px; margin-bottom: 16px; }
        .chart-card h4 { font-family: 'Zilla Slab', serif; margin: 0 0 8px; font-size: 0.9rem; }

        .record-row { border: 1px solid var(--rule); border-radius: 8px; margin-bottom: 8px; background: var(--card); }
        .record-summary { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; cursor: pointer; gap: 8px; }
        .record-summary .left { display: flex; flex-direction: column; }
        .record-summary .house { font-family: 'IBM Plex Mono', monospace; font-size: 0.78rem; color: var(--ink-soft); }
        .record-summary .name { font-weight: 600; font-size: 0.9rem; }
        .record-detail { padding: 0 12px 12px; border-top: 1px dashed var(--rule); font-size: 0.83rem; }
        .record-detail dl { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; margin: 10px 0; }
        .record-detail dt { color: var(--ink-soft); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; }
        .record-detail dd { margin: 0; }
        .record-actions { display: flex; gap: 8px; margin-top: 10px; }

        .stamp {
          display: inline-block;
          font-family: 'Zilla Slab', serif;
          font-weight: 700;
          letter-spacing: 0.08em;
          border: 2.5px double currentColor;
          border-radius: 40% 60% 55% 45% / 50% 45% 55% 50%;
          padding: 4px 10px;
          transform: rotate(-6deg);
          mix-blend-mode: multiply;
          background: rgba(255,255,255,0.4);
        }
        .stamp-md { font-size: 0.68rem; }
        .stamp-sm { font-size: 0.6rem; padding: 2px 7px; }
        .type-badge {
          display: inline-block;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          background: rgba(31,61,43,0.08);
          padding: 2px 7px;
          border-radius: 4px;
        }

        .filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .filter-row select, .filter-row input {
          font-size: 0.82rem; padding: 6px 8px; border: 1px solid var(--rule); border-radius: 5px; background: #FBF9F1; color: var(--ink);
        }
        .search-box { display: flex; align-items: center; gap: 6px; border: 1px solid var(--rule); border-radius: 5px; padding: 4px 8px; background: #FBF9F1; flex: 1; min-width: 160px; }
        .search-box input { border: none; background: transparent; flex: 1; padding: 4px; }

        .guide-block { margin-bottom: 16px; }
        .guide-block h4 { font-family: 'Zilla Slab', serif; font-size: 0.92rem; margin: 0 0 6px; color: var(--ink); }
        .guide-block p, .guide-block li { font-size: 0.85rem; line-height: 1.5; }
        .empty-state { text-align: center; padding: 30px 10px; color: var(--ink-soft); }
      `}</style>

      <header className="app-header">
        <h1>Krachi Nchumuru District — Environmental Health Register</h1>
        <div className="subtitle">HOUSE-TO-HOUSE INSPECTION LOG · OTI REGION</div>
        <div className="officer-row">
          <Users size={14} />
          <input
            placeholder="Inspecting officer's name"
            value={officerName}
            onChange={(e) => saveOfficerName(e.target.value)}
          />
        </div>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </nav>

      <div className="content">
        {loading ? (
          <div className="empty-state">Loading register…</div>
        ) : (
          <>
            {tab === 'dashboard' && (
              <Dashboard stats={stats} total={inspections.length} />
            )}
            {tab === 'new' && (
              <InspectionForm
                form={form} updateForm={updateForm} toggleVector={toggleVector}
                onSave={submitInspection} onCancel={resetForm} error={formError}
              />
            )}
            {tab === 'records' && (
              <Records
                records={filtered} allCount={inspections.length}
                search={search} setSearch={setSearch}
                filterCommunity={filterCommunity} setFilterCommunity={setFilterCommunity}
                filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                expanded={expanded} setExpanded={setExpanded}
                onEdit={editInspection} onDelete={deleteInspection}
                onExport={exportCsv}
              />
            )}
            {tab === 'guide' && (
              <FieldGuide onReset={() => setConfirmReset(true)} confirmReset={confirmReset}
                onConfirm={resetAll} onCancelReset={() => setConfirmReset(false)} />
            )}
          </>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

// ---------- Dashboard ----------
function Dashboard({ stats, total }) {
  if (total === 0) {
    return (
      <div className="empty-state">
        <ClipboardList size={28} style={{ marginBottom: 8 }} />
        <p>No inspections logged yet. Head to <strong>New Inspection</strong> to record your first house-to-house visit.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="stat-row">
        <div className="stat-card"><div className="num">{stats.total}</div><div className="label">Total Inspections</div></div>
        <div className="stat-card"><div className="num" style={{ color: '#2F6B3A' }}>{stats.compliant}</div><div className="label">Compliant</div></div>
        <div className="stat-card"><div className="num" style={{ color: '#B5651D' }}>{stats.minor}</div><div className="label">Minor Issues</div></div>
        <div className="stat-card"><div className="num" style={{ color: '#9C3B2E' }}>{stats.major}</div><div className="label">Major Issues</div></div>
      </div>

      {stats.byCommunity.length > 0 && (
        <div className="chart-card">
          <h4>Inspections by Community</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byCommunity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C7BC9C" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1F3D2B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.byType.length > 0 && (
        <div className="chart-card">
          <h4>Inspections by Type</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C7BC9C" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4A6650" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.pieData.length > 0 && (
        <div className="chart-card">
          <h4>Compliance Breakdown</h4>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.pieData} dataKey="value" nameKey="name" outerRadius={80} label>
                {stats.pieData.map((entry, i) => (
                  <Cell key={i} fill={STAMP_COLORS[entry.name]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {stats.violationChart.length > 0 && (
        <div className="chart-card">
          <h4>Vector & Pest Flags Observed</h4>
          <ResponsiveContainer width="100%" height={Math.max(180, stats.violationChart.length * 40)}>
            <BarChart data={stats.violationChart} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C7BC9C" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#9C3B2E" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ---------- New Inspection Form ----------
function InspectionForm({ form, updateForm, toggleVector, onSave, onCancel, error }) {
  const type = form.inspectionType;
  const labels = TYPE_LABELS[type];
  const showVectorSection = type !== 'Vendor Medical Screening';

  return (
    <div>
      {error && <div className="form-error"><AlertTriangle size={16} /> {error}</div>}

      <Section n="1" title="Inspection Type" icon={ClipboardList}>
        <div className="radio-pills">
          {INSPECTION_TYPES.map((t) => (
            <div
              key={t}
              className={`pill ${type === t ? 'selected Compliant' : ''}`}
              onClick={() => updateForm({ inspectionType: t })}
            >
              {t}
            </div>
          ))}
        </div>
      </Section>

      <Section n="2" title="Visit Information" icon={MapPin}>
        <Field label="Date of visit" required>
          <input type="date" value={form.date} onChange={(e) => updateForm({ date: e.target.value })} />
        </Field>
        <Field label="Community / settlement" required>
          <select value={form.community} onChange={(e) => updateForm({ community: e.target.value })}>
            <option value="">Select…</option>
            {COMMUNITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        {form.community === 'Other' && (
          <Field label="Specify community">
            <input value={form.communityOther} onChange={(e) => updateForm({ communityOther: e.target.value })} />
          </Field>
        )}
        <Field label={labels.premise} required>
          <input placeholder="e.g. Plot 14, Zongo Line" value={form.houseId} onChange={(e) => updateForm({ houseId: e.target.value })} />
        </Field>
        <Field label="GPS / landmark note">
          <input placeholder="optional" value={form.gpsNote} onChange={(e) => updateForm({ gpsNote: e.target.value })} />
        </Field>
      </Section>

      {type === 'Household' && (
        <>
          <Section n="3" title="Household Information" icon={Users}>
            <Field label="Head of household" required>
              <input value={form.headOfHousehold} onChange={(e) => updateForm({ headOfHousehold: e.target.value })} />
            </Field>
            <Field label="Household size">
              <input type="number" min="0" value={form.householdSize} onChange={(e) => updateForm({ householdSize: e.target.value })} />
            </Field>
            <Field label="Dwelling type">
              <select value={form.dwellingType} onChange={(e) => updateForm({ dwellingType: e.target.value })}>
                <option value="">Select…</option>
                {DWELLING_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </Section>

          <Section n="4" title="Water & Sanitation" icon={Droplet}>
            <Field label="Main water source">
              <select value={form.waterSource} onChange={(e) => updateForm({ waterSource: e.target.value })}>
                <option value="">Select…</option>
                {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Toilet facility">
              <select value={form.toiletFacility} onChange={(e) => updateForm({ toiletFacility: e.target.value })}>
                <option value="">Select…</option>
                {TOILET_FACILITIES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Solid waste disposal method">
              <select value={form.wasteDisposal} onChange={(e) => updateForm({ wasteDisposal: e.target.value })}>
                <option value="">Select…</option>
                {WASTE_DISPOSAL.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </Field>
            <Field label="Refuse container present">
              <select value={form.refuseContainer} onChange={(e) => updateForm({ refuseContainer: e.target.value })}>
                <option value="">Select…</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
          </Section>

          <Section n="5" title="Compound & Structural Observation" icon={Home}>
            <Field label="Compound cleanliness">
              <select value={form.compoundCleanliness} onChange={(e) => updateForm({ compoundCleanliness: e.target.value })}>
                <option value="">Select…</option>
                {COMPOUND_CLEANLINESS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Overcrowding observed">
              <select value={form.overcrowding} onChange={(e) => updateForm({ overcrowding: e.target.value })}>
                <option value="">Select…</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
            <Field label="Ventilation adequate">
              <select value={form.ventilation} onChange={(e) => updateForm({ ventilation: e.target.value })}>
                <option value="">Select…</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
          </Section>
        </>
      )}

      {type === 'Food Vendor' && (
        <Section n="3" title="Food Vendor Details" icon={Users}>
          <Field label="Vendor / business name" required>
            <input value={form.premiseName} onChange={(e) => updateForm({ premiseName: e.target.value })} />
          </Field>
          <Field label="Type of food sold">
            <select value={form.foodTypeSold} onChange={(e) => updateForm({ foodTypeSold: e.target.value })}>
              <option value="">Select…</option>
              {FOOD_TYPES_SOLD.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Food handler's medical certificate">
            <select value={form.foodHandlerCert} onChange={(e) => updateForm({ foodHandlerCert: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes, valid</option>
              <option value="Expired">Present but expired</option>
              <option value="No">No certificate</option>
            </select>
          </Field>
          <Field label="Certificate expiry date">
            <input type="date" value={form.certExpiry} onChange={(e) => updateForm({ certExpiry: e.target.value })} />
          </Field>
          <Field label="Handwashing facility present">
            <select value={form.handwashFacility} onChange={(e) => updateForm({ handwashFacility: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Water source">
            <select value={form.waterSource} onChange={(e) => updateForm({ waterSource: e.target.value })}>
              <option value="">Select…</option>
              {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Food storage practice">
            <select value={form.foodStorage} onChange={(e) => updateForm({ foodStorage: e.target.value })}>
              <option value="">Select…</option>
              {FOOD_STORAGE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Waste disposal method">
            <select value={form.wasteDisposal} onChange={(e) => updateForm({ wasteDisposal: e.target.value })}>
              <option value="">Select…</option>
              {WASTE_DISPOSAL.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
        </Section>
      )}

      {type === 'Hotel/Guest House' && (
        <Section n="3" title="Establishment Details" icon={Home}>
          <Field label="Establishment name" required>
            <input value={form.premiseName} onChange={(e) => updateForm({ premiseName: e.target.value })} />
          </Field>
          <Field label="Number of rooms">
            <input type="number" min="0" value={form.numRooms} onChange={(e) => updateForm({ numRooms: e.target.value })} />
          </Field>
          <Field label="Water source">
            <select value={form.waterSource} onChange={(e) => updateForm({ waterSource: e.target.value })}>
              <option value="">Select…</option>
              {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Toilet-to-room ratio adequate">
            <select value={form.toiletRatioAdequate} onChange={(e) => updateForm({ toiletRatioAdequate: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Waste disposal method">
            <select value={form.wasteDisposal} onChange={(e) => updateForm({ wasteDisposal: e.target.value })}>
              <option value="">Select…</option>
              {WASTE_DISPOSAL.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Fire safety equipment present">
            <select value={form.fireSafety} onChange={(e) => updateForm({ fireSafety: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Bedding / linen hygiene">
            <select value={form.beddingHygiene} onChange={(e) => updateForm({ beddingHygiene: e.target.value })}>
              <option value="">Select…</option>
              {COMPOUND_CLEANLINESS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </Section>
      )}

      {type === 'Vendor Medical Screening' && (
        <Section n="3" title="Screening Details" icon={Users}>
          <Field label="Vendor / trader name" required>
            <input value={form.premiseName} onChange={(e) => updateForm({ premiseName: e.target.value })} />
          </Field>
          <Field label="Occupation / trade">
            <input placeholder="e.g. Cooked food seller" value={form.occupationTrade} onChange={(e) => updateForm({ occupationTrade: e.target.value })} />
          </Field>
          <Field label="Medical certificate present">
            <select value={form.medicalCertPresent} onChange={(e) => updateForm({ medicalCertPresent: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes, valid</option>
              <option value="Expired">Present but expired</option>
              <option value="No">No certificate</option>
            </select>
          </Field>
          <Field label="Certificate issuing facility">
            <input value={form.certIssuingFacility} onChange={(e) => updateForm({ certIssuingFacility: e.target.value })} />
          </Field>
          <Field label="Certificate expiry date">
            <input type="date" value={form.certExpiry} onChange={(e) => updateForm({ certExpiry: e.target.value })} />
          </Field>
          <Field label="Screened for communicable disease">
            <select value={form.screenedCommunicable} onChange={(e) => updateForm({ screenedCommunicable: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Fit for public contact">
            <select value={form.fitForPublicContact} onChange={(e) => updateForm({ fitForPublicContact: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
        </Section>
      )}

      {type === 'Industry' && (
        <Section n="3" title="Industry Details" icon={Home}>
          <Field label="Company / industry name" required>
            <input value={form.premiseName} onChange={(e) => updateForm({ premiseName: e.target.value })} />
          </Field>
          <Field label="Type of industry">
            <select value={form.industryType} onChange={(e) => updateForm({ industryType: e.target.value })}>
              <option value="">Select…</option>
              {INDUSTRY_TYPES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="EPA permit present">
            <select value={form.epaPermit} onChange={(e) => updateForm({ epaPermit: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Effluent / liquid waste disposal">
            <select value={form.effluentDisposal} onChange={(e) => updateForm({ effluentDisposal: e.target.value })}>
              <option value="">Select…</option>
              {EFFLUENT_DISPOSAL_OPTIONS.map((e2) => <option key={e2} value={e2}>{e2}</option>)}
            </select>
          </Field>
          <Field label="Air emission control present">
            <select value={form.airEmissionControl} onChange={(e) => updateForm({ airEmissionControl: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Workers' welfare facilities adequate">
            <select value={form.workersWelfare} onChange={(e) => updateForm({ workersWelfare: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Hazardous waste properly stored">
            <select value={form.hazardousWasteStorage} onChange={(e) => updateForm({ hazardousWasteStorage: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
              <option value="N/A">Not applicable</option>
            </select>
          </Field>
        </Section>
      )}

      {type === 'School' && (
        <Section n="3" title="School Details" icon={Home}>
          <Field label="School name" required>
            <input value={form.premiseName} onChange={(e) => updateForm({ premiseName: e.target.value })} />
          </Field>
          <Field label="Number of pupils">
            <input type="number" min="0" value={form.numPupils} onChange={(e) => updateForm({ numPupils: e.target.value })} />
          </Field>
          <Field label="Water source">
            <select value={form.waterSource} onChange={(e) => updateForm({ waterSource: e.target.value })}>
              <option value="">Select…</option>
              {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Pupil-to-toilet ratio adequate">
            <select value={form.pupilToiletRatio} onChange={(e) => updateForm({ pupilToiletRatio: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Handwashing facilities present">
            <select value={form.handwashFacility} onChange={(e) => updateForm({ handwashFacility: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          <Field label="Waste disposal method">
            <select value={form.wasteDisposal} onChange={(e) => updateForm({ wasteDisposal: e.target.value })}>
              <option value="">Select…</option>
              {WASTE_DISPOSAL.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>
          <Field label="Canteen / food service present">
            <select value={form.canteenPresent} onChange={(e) => updateForm({ canteenPresent: e.target.value })}>
              <option value="">Select…</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
        </Section>
      )}

      {showVectorSection && (
        <Section n="4" title="Vector & Pest Observations" icon={Bug}>
          <div className="checkbox-grid">
            {VECTOR_FLAGS.map((flag) => (
              <label key={flag} className="checkbox-row">
                <input type="checkbox" checked={form.vectorFlags.includes(flag)} onChange={() => toggleVector(flag)} />
                {flag}
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section n="5" title="Findings & Compliance" icon={ClipboardList}>
        <Field label="Violations / issues identified" required>
          <textarea placeholder="Describe specific breaches observed…" value={form.violations} onChange={(e) => updateForm({ violations: e.target.value })} />
        </Field>
        <div className="radio-pills">
          {COMPLIANCE.map((c) => (
            <div
              key={c}
              className={`pill ${form.complianceStatus === c ? `selected ${c.split(' ')[0]}` : ''}`}
              onClick={() => updateForm({ complianceStatus: c })}
            >
              {c}
            </div>
          ))}
        </div>
        <Field label="Action taken">
          <select value={form.actionTaken} onChange={(e) => updateForm({ actionTaken: e.target.value })}>
            <option value="">Select…</option>
            {ACTIONS_TAKEN.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Follow-up date (if any)">
          <input type="date" value={form.followUpDate} onChange={(e) => updateForm({ followUpDate: e.target.value })} />
        </Field>
        <Field label="Additional notes">
          <textarea value={form.notes} onChange={(e) => updateForm({ notes: e.target.value })} />
        </Field>
      </Section>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={onSave}><Save size={15} /> Save Inspection</button>
        <button className="btn secondary" onClick={onCancel}><X size={15} /> Clear Form</button>
      </div>
    </div>
  );
}

// ---------- Records ----------
function Records({ records, allCount, search, setSearch, filterCommunity, setFilterCommunity, filterStatus, setFilterStatus, expanded, setExpanded, onEdit, onDelete, onExport }) {
  return (
    <div>
      <div className="filter-row">
        <div className="search-box">
          <Search size={14} />
          <input placeholder="Search household head or house ID…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filterCommunity} onChange={(e) => setFilterCommunity(e.target.value)}>
          <option value="All">All communities</option>
          {COMMUNITIES.filter((c) => c !== 'Other').map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="All">All statuses</option>
          {COMPLIANCE.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="btn secondary" onClick={onExport}><Download size={14} /> Export CSV</button>
      </div>

      {allCount === 0 ? (
        <div className="empty-state">No inspections recorded yet.</div>
      ) : records.length === 0 ? (
        <div className="empty-state">No records match your filters.</div>
      ) : (
        records.map((r) => (
          <div key={r.id} className="record-row">
            <div className="record-summary" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div className="left">
                <span className="name">{subjectNameOf(r) || 'Unnamed'} — {r.community}</span>
                <span className="house">
                  <span className="type-badge">{r.inspectionType || 'Household'}</span>
                  {' '}{r.houseId} · {fmtDate(r.date)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Stamp status={r.complianceStatus} size="sm" />
                {expanded === r.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>
            {expanded === r.id && (
              <div className="record-detail">
                <dl>
                  <dt>Officer</dt><dd>{r.officer || '—'}</dd>
                  <dt>Water source</dt><dd>{r.waterSource || '—'}</dd>
                  <dt>Waste disposal</dt><dd>{r.wasteDisposal || '—'}</dd>
                  <dt>Vector flags</dt><dd>{(r.vectorFlags || []).length ? r.vectorFlags.join(', ') : 'None observed'}</dd>
                  <dt>Action taken</dt><dd>{r.actionTaken || '—'}</dd>
                  <dt>Follow-up date</dt><dd>{r.followUpDate ? fmtDate(r.followUpDate) : '—'}</dd>
                  <dt>GPS / landmark</dt><dd>{r.gpsNote || '—'}</dd>
                </dl>
                {r.violations && <p style={{ fontSize: '0.83rem' }}><strong>Violations:</strong> {r.violations}</p>}
                {r.notes && <p style={{ fontSize: '0.83rem' }}><strong>Notes:</strong> {r.notes}</p>}
                <div className="record-actions">
                  <button className="btn secondary" onClick={() => onEdit(r)}>Edit</button>
                  <button className="btn danger" onClick={() => onDelete(r.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ---------- Field Guide ----------
function FieldGuide({ onReset, confirmReset, onConfirm, onCancelReset }) {
  return (
    <div>
      <div className="guide-block">
        <h4>Inspection Categories</h4>
        <p>This register now covers six categories: house-to-house household visits, food vendors, hotels/guest houses, vendor medical screening, industries, and schools. Select the category at the top of the New Inspection form, the checklist below it adjusts automatically.</p>
      </div>
      <div className="guide-block">
        <h4>Legal & Policy Basis</h4>
        <ul>
          <li><strong>Public Health Act, 2012 (Act 851):</strong> general environmental sanitation, nuisance abatement, and powers of environmental health officers to inspect premises and issue notices.</li>
          <li><strong>Environmental Sanitation Policy (revised 2010):</strong> national standards for household sanitation, solid and liquid waste management.</li>
          <li><strong>Local Governance Act, 2016 (Act 936):</strong> basis for District Assembly bye-laws and the authority of EHOs as designated enforcement officers.</li>
          <li><strong>Environmental Protection Agency Act, 1994 (Act 490):</strong> pollution control provisions relevant where inspections identify environmental hazards.</li>
        </ul>
      </div>
      <div className="guide-block">
        <h4>Compliance Rating Guide</h4>
        <p><Stamp status="Compliant" size="sm" /> — household meets basic sanitation, water, and waste standards with no notable hazards.</p>
        <p><Stamp status="Minor non-compliance" size="sm" /> — isolated issues (e.g. uncovered latrine, minor refuse spillage) correctable with advice.</p>
        <p><Stamp status="Major non-compliance" size="sm" /> — open defecation, indiscriminate dumping, breeding sites, or conditions posing a public health risk; typically requires a written notice or referral.</p>
      </div>
      <div className="guide-block">
        <h4>Data & Storage</h4>
        <p>Inspection records are saved to a shared online database, so every officer sees the same live register updating in real time, no matter whose phone made the entry. Your officer name field is saved only on this device.</p>
      </div>
      <div className="guide-block">
        <h4>Reset Register</h4>
        {!confirmReset ? (
          <button className="btn danger" onClick={onReset}><RotateCcw size={14} /> Clear all inspection records</button>
        ) : (
          <div>
            <p style={{ color: '#9C3B2E' }}>This permanently deletes every saved inspection for all users of this app. Are you sure?</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn danger" onClick={onConfirm}>Yes, clear everything</button>
              <button className="btn secondary" onClick={onCancelReset}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
