import { Link } from "react-router-dom";
import { Shield, Target, MessageSquareHeart, CheckCircle, ArrowRight, Building2, BarChart2, Sparkles } from "lucide-react";
import MarqueeBanner from "../components/ui/MarqueeBanner";
import ScrollReveal from "../components/ui/ScrollReveal";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/navgurukul-logo.png"
              alt="NavGurukul Logo"
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="border-l border-slate-200 pl-3">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                NavGurukul Dantewada
              </h1>
              <p className="text-xs text-indigo-600 font-semibold mt-1">
                Council Portal
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/feedback"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition hover-underline-link"
            >
              <MessageSquareHeart size={16} />
              <span>Student Feedback</span>
            </Link>
            <Link
              to="/council/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 transition hover-underline-link"
            >
              <span>Council Login</span>
            </Link>
            <Link
              to="/disco/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition hover-underline-link border border-purple-200/60"
            >
              <Shield size={14} className="text-purple-600" />
              <span>DISCO Portal</span>
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/25 transition group"
            >
              <Shield size={16} className="group-hover:rotate-12 transition-transform" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Infinite Marquee Banner highlighting NavGurukul Dantewada */}
      <MarqueeBanner />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-14 pb-12 text-center flex-1">
        <ScrollReveal direction="down" duration={500}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs">
            <Sparkles size={13} className="text-indigo-600 animate-pulse" />
            <span>Official Council Management Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
            <span>NavGurukul Dantewada</span>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={100} duration={650}>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            Centralized Council Governance & Daily Progress Tracking
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={200} duration={650}>
          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Empowering <strong className="text-slate-900">NavGurukul Dantewada</strong> campus bodies with clear accountability, daily goal management, reflective self-audits, automated progress analytics, and open student communication.
          </p>
        </ScrollReveal>

        {/* 3 Core Access Portals Cards with modern hover elevations and scroll reveals */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Admin Portal Card */}
          <ScrollReveal direction="up" delay={250} duration={600}>
            <div className="h-full bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs card-hover-elevate flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 heading-accent-underline">Admin Portal</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Centralized control for managing councils, assigning multiple members and designations, monitoring daily goals, and reviewing student complaints.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Manage councils & member assignments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Council goals monitoring & audit logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Weekly & monthly performance overview</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/admin/login"
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition shadow-xs group-hover:shadow-md group-hover:shadow-indigo-500/20"
              >
                <span>Login as Admin</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Council Member Portal Card */}
          <ScrollReveal direction="up" delay={350} duration={600}>
            <div className="h-full bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs card-hover-emerald flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Target size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 heading-accent-underline">Council Member Portal</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Personalized dashboard for council coordinators to plan daily activities, mark completion status, submit reflections, and track weekly progress.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Create & prioritize daily goals</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Evening reflection & incomplete reasons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>View council-specific student feedback</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/council/login"
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition shadow-xs group-hover:shadow-md group-hover:shadow-slate-900/20"
              >
                <span>Login as Council Member</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Public Feedback Card */}
          <ScrollReveal direction="up" delay={450} duration={600}>
            <div className="h-full bg-white rounded-2xl p-7 border border-slate-200/90 shadow-xs card-hover-amber flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <MessageSquareHeart size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 heading-accent-underline">Student Feedback</h3>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Open public portal for all campus learners. Submit suggestions, constructive feedback, or grievances without needing an account or login.
                </p>
                <ul className="mt-5 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>No login or registration required</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Select any council directly</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                    <span>Optional anonymity & contact info</span>
                  </li>
                </ul>
              </div>
              <Link
                to="/feedback"
                className="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition shadow-xs group-hover:shadow-md group-hover:shadow-amber-500/20"
              >
                <span>Submit Feedback</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Core Principles with Scroll Reveal */}
      <section className="max-w-5xl mx-auto px-6 py-14 border-t border-slate-200/80 w-full">
        <ScrollReveal direction="up">
          <div className="text-center mb-10">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1.5">
              NavGurukul Dantewada Governance Framework
            </h3>
            <h4 className="text-2xl font-bold text-slate-900 heading-accent-underline">
              Built on Three Core Principles
            </h4>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ScrollReveal direction="up" delay={150}>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs card-hover-elevate text-center group h-full">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center mx-auto mb-4 text-base group-hover:scale-110 transition-transform">
                01
              </div>
              <h5 className="font-bold text-slate-900 text-lg">Accountability</h5>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Every council member establishes daily goals and completes reflective self-audits every evening.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={250}>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs card-hover-elevate text-center group h-full">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold flex items-center justify-center mx-auto mb-4 text-base group-hover:scale-110 transition-transform">
                02
              </div>
              <h5 className="font-bold text-slate-900 text-lg">Transparency</h5>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Automated weekly and monthly analytics offer real-time clarity into council performance and goal consistency.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={350}>
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs card-hover-elevate text-center group h-full">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-extrabold flex items-center justify-center mx-auto mb-4 text-base group-hover:scale-110 transition-transform">
                03
              </div>
              <h5 className="font-bold text-slate-900 text-lg">Student Participation</h5>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Frictionless feedback collection gives students an active voice in shaping campus activities and student life.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 NavGurukul Dantewada. Council Portal v2.0.</p>
          <div className="flex items-center gap-5">
            <Link to="/feedback" className="hover:text-indigo-600 transition hover-underline-link">Feedback Form</Link>
            <Link to="/council/login" className="hover:text-emerald-600 transition hover-underline-link">Council Portal</Link>
            <Link to="/disco/login" className="hover:text-purple-600 transition hover-underline-link">DISCO Portal</Link>
            <Link to="/admin/login" className="hover:text-indigo-600 transition hover-underline-link">Admin Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
