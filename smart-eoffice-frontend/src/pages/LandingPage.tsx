import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import screenAsset from '@/assets/screen.png';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setActiveAccordion((prev) => (prev === index ? null : index));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3ED] text-[#292A27] font-sans antialiased selection:bg-[#526A55]/20 selection:text-[#526A55]">
      {/* ─── 1. Header / Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[#F5F3ED]/90 backdrop-blur-md border-b border-[#D8D7D1]/70 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-[#3B4E3D] text-[#F5F3ED] rounded-xl flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-[#2B3E30] transition-colors">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#292A27] group-hover:text-[#3B4E3D] transition-colors">
                SITA Smart E-Office
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6A64]">
                Digital Document Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold uppercase tracking-wider text-[#6B6A64]">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-[#3B4E3D] relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#3B4E3D] after:rounded-full"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="hover:text-[#3B4E3D] transition-colors py-1"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#3B4E3D] transition-colors py-1"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('benefits')}
              className="hover:text-[#3B4E3D] transition-colors py-1"
            >
              Benefits
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-sita')}
              className="hover:text-[#3B4E3D] transition-colors py-1"
            >
              About SITA
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden sm:inline-flex px-4 py-2 rounded-full border border-[#292A27]/20 text-xs font-bold text-[#292A27] hover:bg-[#ECEAE3] transition-colors"
            >
              Get Started
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full bg-[#3B4E3D] text-[#F5F3ED] text-xs font-bold hover:bg-[#2B3E30] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B4E3D]/50"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* ─── 2. Hero Section ──────────────────────────────────────────── */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Eyebrow Label */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#3B4E3D]/10 border border-[#3B4E3D]/20 text-[#3B4E3D] text-[11px] font-bold uppercase tracking-widest">
          <span>SMART DIGITAL DOCUMENT MANAGEMENT</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#292A27] tracking-tight max-w-4xl mx-auto leading-[1.15]">
          Transform Document Management into a Smarter Digital Workflow
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-[#6B6A64] max-w-2xl mx-auto font-medium leading-relaxed">
          Create, submit, review, approve, track, and archive organizational documents through one centralized digital workflow.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#3B4E3D] text-[#F5F3ED] text-sm font-bold hover:bg-[#2B3E30] transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#3B4E3D]"
          >
            Sign In to Smart E-Office
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('features')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ECEAE3] border border-[#D8D7D1] text-sm font-bold text-[#292A27] hover:bg-[#D8D7D1]/60 transition-all"
          >
            Explore Features
          </button>
        </div>

        {/* Hero Screen Frame Mockup */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-[#E5E3DC] p-3 sm:p-4 rounded-3xl border border-[#292A27]/15 shadow-2xl">
            {/* Safari/Browser Bar Header */}
            <div className="bg-[#D8D7D1]/80 rounded-t-2xl px-4 py-2.5 flex items-center justify-between border-b border-[#292A27]/10 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-[#E56A54]" />
                <div className="w-3 h-3 rounded-full bg-[#E5B554]" />
                <div className="w-3 h-3 rounded-full bg-[#54B56A]" />
              </div>
              <div className="bg-[#F5F3ED] px-6 py-1 rounded-md text-[11px] text-[#6B6A64] font-mono border border-[#D8D7D1]">
                https://smart-eoffice.sita.gov.et
              </div>
              <div className="w-12" />
            </div>

            {/* Screen Content Image */}
            <div className="rounded-xl overflow-hidden border border-[#292A27]/10 bg-white shadow-inner">
              <img
                src={screenAsset}
                alt="SITA Smart E-Office Dashboard Interface Screenshot"
                className="w-full h-auto object-cover max-h-[640px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. Quick Stats Bar ───────────────────────────────────────── */}
      <section className="py-10 bg-[#F5F3ED] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#3B4E3D]">3</span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6A64]">Core User Roles</p>
          </div>
          <div className="space-y-1 border-y md:border-y-0 md:border-x border-[#D8D7D1] py-4 md:py-0">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#3B4E3D]">8+</span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6A64]">Core Modules</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#3B4E3D]">100%</span>
            <p className="text-xs font-bold uppercase tracking-wider text-[#6B6A64]">End-to-End Workflow</p>
          </div>
        </div>
      </section>

      {/* ─── 4. Value Proposition Cards ───────────────────────────────── */}
      <section id="benefits" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-6 space-y-4 hover:border-[#3B4E3D]/40 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#292A27]">Centralized Documents</h3>
            <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
              Store all organizational files in one secure, searchable shared repository, accessible anytime.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-6 space-y-4 hover:border-[#3B4E3D]/40 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#292A27]">Faster Workflows</h3>
            <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
              Automate routing and approvals to significantly reduce processing times and bottlenecks.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-6 space-y-4 hover:border-[#3B4E3D]/40 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#292A27]">Transparent Tracking</h3>
            <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
              Monitor document status in real-time with comprehensive audit trails and version history.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-6 space-y-4 hover:border-[#3B4E3D]/40 transition-colors shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-[#292A27]">Secure Access</h3>
            <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
              Ensure data protection with role-based permissions and enterprise-grade security protocols.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 5. Features Suite Section ─────────────────────────────────── */}
      <section id="features" className="py-20 bg-[#ECEAE3]/60 border-y border-[#D8D7D1] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight">
              Everything You Need for Digital Document Management
            </h2>
            <p className="text-sm text-[#6B6A64] max-w-2xl mx-auto font-medium">
              A comprehensive suite of tools designed to streamline your organizational processes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                📄
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Document Management</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Create, edit, and organize files in a structured digital environment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                ⚡
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Approval Workflow</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Set up multi-step approval chains with automated routing.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                👁️
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Tracking</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Monitor where documents are in the process at any time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                📜
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Version History</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Keep track of changes and easily revert to previous versions.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                🔔
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Notifications</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Receive automated alerts for pending actions and updates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                🏛️
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Archive</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Securely store completed documents for compliance and retrieval.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                📑
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Audit Logs</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Maintain a detailed record of all user actions and system events.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                📊
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Reports</h4>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Generate insights on workflow efficiency and document volumes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. End-to-End Document Lifecycle Section ─────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight">
            End-to-End Document Lifecycle
          </h2>
          <p className="text-sm text-[#6B6A64] max-w-2xl mx-auto font-medium">
            Seamlessly manage documents from creation to final storage.
          </p>
        </div>

        <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-3xl p-6 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
            {/* Steps 1-5 */}
            {[
              { num: '1', name: 'Draft', active: false },
              { num: '2', name: 'Submitted', active: false },
              { num: '3', name: 'Pending Approval', active: true },
              { num: '4', name: 'Approved', active: false },
              { num: '5', name: 'Archived', active: false },
            ].map((step, i) => (
              <div
                key={i}
                className={`bg-[#F5F3ED] border rounded-2xl p-4 text-center space-y-3 flex flex-col items-center justify-center transition-all ${
                  step.active
                    ? 'border-[#3B4E3D] ring-2 ring-[#3B4E3D]/20 shadow-md'
                    : 'border-[#D8D7D1]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    step.active
                      ? 'bg-[#3B4E3D] text-[#F5F3ED]'
                      : 'bg-[#ECEAE3] text-[#292A27] border border-[#D8D7D1]'
                  }`}
                >
                  {step.num}
                </div>
                <span className="text-xs font-bold text-[#292A27]">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 7. How It Works Section ──────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-[#ECEAE3]/60 border-y border-[#D8D7D1] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight">
              How It Works
            </h2>
            <p className="text-sm text-[#6B6A64] max-w-2xl mx-auto font-medium">
              A simplified, powerful workflow for all your documentation needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3 relative pl-6 border-l-2 border-[#3B4E3D]">
              <span className="text-xs font-bold text-[#3B4E3D]">1. Create & Submit</span>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Author or draft documents directly in the system and submit them to the appropriate workflow.
              </p>
            </div>

            <div className="space-y-3 relative pl-6 border-l-2 border-[#3B4E3D]">
              <span className="text-xs font-bold text-[#3B4E3D]">2. Review</span>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Assigned reviewers receive notifications to examine, comment on, or request changes to the document.
              </p>
            </div>

            <div className="space-y-3 relative pl-6 border-l-2 border-[#3B4E3D]">
              <span className="text-xs font-bold text-[#3B4E3D]">3. Approve & Process</span>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Authorized personnel sign off digitally, advancing the document to its final processing stage.
              </p>
            </div>

            <div className="space-y-3 relative pl-6 border-l-2 border-[#3B4E3D]">
              <span className="text-xs font-bold text-[#3B4E3D]">4. Store & Archive</span>
              <p className="text-xs text-[#6B6A64] leading-relaxed font-medium">
                Completed documents are securely stored, easily searchable, and retained according to policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Role-Based Access Control Section ─────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight">
            Role-Based Access Control
          </h2>
          <p className="text-sm text-[#6B6A64] max-w-2xl mx-auto font-medium">
            Tailored interfaces and permissions for every user level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Administrator */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                  👑
                </div>
                <h3 className="text-base font-bold text-[#292A27]">Administrator</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#6B6A64] font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Manage user accounts and permissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Configure system settings and workflows</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Access global audit logs and security reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Department Manager (Featured) */}
          <div className="bg-[#F5F3ED] border-2 border-[#3B4E3D] rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between relative shadow-lg">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#3B4E3D] text-[#F5F3ED] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs">
              MOST ACTIVE
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B4E3D]/15 text-[#3B4E3D] flex items-center justify-center font-bold">
                  👔
                </div>
                <h3 className="text-base font-bold text-[#292A27]">Department Manager</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#6B6A64] font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Review and approve department documents</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Monitor team productivity and bottlenecks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Generate department-specific reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Employee */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold">
                  💼
                </div>
                <h3 className="text-base font-bold text-[#292A27]">Employee</h3>
              </div>
              <ul className="space-y-3 text-xs text-[#6B6A64] font-medium">
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Create, upload, and submit documents</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Track the status of personal submissions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="text-[#3B4E3D] font-bold">✓</span>
                  <span>Access approved documents relevant to role</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. The Transformation Section ────────────────────────────── */}
      <section className="py-20 bg-[#ECEAE3]/60 border-y border-[#D8D7D1] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight">
              The Transformation
            </h2>
            <p className="text-sm text-[#6B6A64] max-w-2xl mx-auto font-medium">
              Moving from legacy systems to modern efficiency.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="flex-1 bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-6 text-center space-y-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#292A27]/10 text-[#292A27] flex items-center justify-center mx-auto font-bold text-lg">
                📁
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Paper-Based</h4>
              <p className="text-xs text-[#6B6A64]">Slow, prone to loss, manual routing.</p>
            </div>

            <span className="text-xl font-bold text-[#3B4E3D] hidden md:inline">→</span>

            <div className="flex-1 bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-6 text-center space-y-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center mx-auto font-bold text-lg">
                💻
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Digital</h4>
              <p className="text-xs text-[#6B6A64]">Organized, secure, searchable files.</p>
            </div>

            <span className="text-xl font-bold text-[#3B4E3D] hidden md:inline">→</span>

            <div className="flex-1 bg-[#F5F3ED] border border-[#D8D7D1] rounded-2xl p-6 text-center space-y-3 w-full">
              <div className="w-10 h-10 rounded-xl bg-[#3B4E3D]/20 text-[#3B4E3D] flex items-center justify-center mx-auto font-bold text-lg">
                🤖
              </div>
              <h4 className="text-sm font-bold text-[#292A27]">Automated</h4>
              <p className="text-xs text-[#6B6A64]">Intelligent routing, instant alerts, analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. Supporting SITA's Digital Vision & Security Accordion ─── */}
      <section id="about-sita" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Vision Text */}
          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#292A27] tracking-tight leading-tight">
              Supporting SITA's Digital Transformation Vision
            </h2>
            <p className="text-xs sm:text-sm text-[#6B6A64] leading-relaxed font-medium">
              The Smart E-Office platform aligns directly with SITA's mandate to leverage information technology as a strategic resource for government. By digitizing document workflows, we are enabling more efficient, transparent, and responsive public service delivery.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  🌱
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292A27]">Eco-Friendly Operations</h4>
                  <p className="text-xs text-[#6B6A64] mt-0.5">Reduced paper consumption and physical storage requirements.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-[#3B4E3D]/10 text-[#3B4E3D] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                  🏛️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#292A27]">Institutional Compliance</h4>
                  <p className="text-xs text-[#6B6A64] mt-0.5">Built to meet rigorous government standards for data handling.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Security Accordion */}
          <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#292A27] uppercase tracking-wider px-2">
              Security & Governance
            </h3>

            <div className="space-y-2">
              {[
                { title: 'Role-Based Access', detail: 'Strict clearance isolation between Employee, Manager, and Admin tiers.' },
                { title: 'Controlled Permissions', detail: 'Granular view, edit, download, and approval permissions.' },
                { title: 'Activity Tracking', detail: 'Comprehensive audit logging for all document interactions.' },
                { title: 'Document History', detail: 'Complete version timeline tracking with instant audit trail.' },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#F5F3ED] border border-[#D8D7D1] rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-4 py-3.5 text-xs font-bold text-[#292A27] flex items-center justify-between hover:bg-[#ECEAE3] transition-colors text-left"
                  >
                    <span>{item.title}</span>
                    <span className="text-[#3B4E3D] font-bold">{activeAccordion === idx ? '−' : '+'}</span>
                  </button>
                  {activeAccordion === idx && (
                    <div className="px-4 pb-3.5 text-xs text-[#6B6A64] leading-relaxed border-t border-[#D8D7D1]/50 pt-2">
                      {item.detail}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. Call-to-Action Banner ────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-[#2B3E30] text-[#F5F3ED] rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Move Document Management into the Digital Age?
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F3ED]/80 font-medium leading-relaxed">
              Join thousands of users streamlining their daily operations with SITA Smart E-Office.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#F5F3ED] text-[#2B3E30] text-xs font-extrabold hover:bg-white transition-all shadow-md"
              >
                Sign In Now
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-[#F5F3ED]/30 text-[#F5F3ED] text-xs font-bold hover:bg-white/10 transition-all"
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 12. Footer Section ───────────────────────────────────────── */}
      <footer className="bg-[#ECEAE3] border-t border-[#D8D7D1] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#3B4E3D] text-[#F5F3ED] rounded-xl flex items-center justify-center font-bold text-sm">
                  S
                </div>
                <span className="text-sm font-extrabold text-[#292A27]">
                  SITA Smart E-Office
                </span>
              </div>
              <p className="text-xs text-[#6B6A64] leading-relaxed">
                An institutional digital workflow platform securely managing the creation, review, tracking, and archiving of organizational documents.
              </p>
            </div>

            {/* Link Col 1 */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#292A27]">Platform</h5>
              <ul className="space-y-2 text-xs text-[#6B6A64] font-medium">
                <li><button type="button" onClick={() => scrollToSection('features')} className="hover:text-[#3B4E3D]">Features</button></li>
                <li><button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-[#3B4E3D]">How It Works</button></li>
                <li><button type="button" onClick={() => scrollToSection('benefits')} className="hover:text-[#3B4E3D]">Benefits</button></li>
                <li><button type="button" onClick={() => navigate('/login')} className="hover:text-[#3B4E3D]">Sign In</button></li>
              </ul>
            </div>

            {/* Link Col 2 */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#292A27]">Support</h5>
              <ul className="space-y-2 text-xs text-[#6B6A64] font-medium">
                <li><a href="#help" className="hover:text-[#3B4E3D]">Help Center</a></li>
                <li><a href="#status" className="hover:text-[#3B4E3D]">System Status</a></li>
                <li><a href="#accessibility" className="hover:text-[#3B4E3D]">Accessibility</a></li>
                <li><a href="#contact" className="hover:text-[#3B4E3D]">Contact Support</a></li>
              </ul>
            </div>

            {/* Link Col 3 */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#292A27]">Legal</h5>
              <ul className="space-y-2 text-xs text-[#6B6A64] font-medium">
                <li><a href="#privacy" className="hover:text-[#3B4E3D]">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-[#3B4E3D]">Terms of Service</a></li>
                <li><a href="#security" className="hover:text-[#3B4E3D]">Security Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#D8D7D1] text-center text-xs text-[#6B6A64] font-medium">
            © 2026 SITA - Sidama Innovation & Technology Agency. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
