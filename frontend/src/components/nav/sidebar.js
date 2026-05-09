// components/StaffSidebar.jsx
// Tailwind CSS — make sure Tailwind is configured in your project

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "overview",  label: "Overview",  icon: "📊", route: "/staff/dashboard" },
  { id: "doctors",   label: "Doctors", icon: "👤", route: "/doctormanagement" },
  { id: "appointments", label: "Appointments", icon: "📅", route: "/staff/appointments" },
];

export default function StaffSidebar({ user, activeTab, setActiveTab, logout }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const initials =
    (user?.firstName?.[0] ?? "") + (user?.lastName?.[0] ?? "");

  return (
    <>
      {/* ── Mobile overlay ─────────────────────────────────── */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        className={[
          "fixed top-0 left-0 h-screen z-30 flex flex-col",
          "bg-slate-900 border-r border-slate-800/60",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          // on mobile hide when collapsed
          collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
        ].join(" ")}
      >
        {/* ── Brand ── */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60 min-h-[72px]">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">
            🏥
          </div>
          {!collapsed && (
            <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap font-[Sora,sans-serif]">
              MediChannel
            </span>
          )}
          {/* collapse toggle — desktop */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-sm"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* ── User card ── */}
        <div
          className={[
            "mx-3 my-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 overflow-hidden",
            collapsed ? "p-2 flex justify-center" : "p-4",
          ].join(" ")}
        >
          {collapsed ? (
            /* collapsed avatar only */
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-1">
              {/* avatar */}
              <div className="relative mb-1">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/25">
                  {initials}
                </div>
                {/* online dot */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-800" />
              </div>

              <p className="text-white font-semibold text-sm leading-tight">
                {user?.firstName} {user?.lastName}
              </p>

              {/* Staff badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold tracking-wide">
                👩‍💼 Staff
              </span>

              <p className="text-slate-500 text-[11px] mt-0.5 truncate max-w-full">
                {user?.staffDetails?.position ?? "Staff Member"}
              </p>
            </div>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {!collapsed && (
            <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              Menu
            </p>
          )}

          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  navigate(t.route);
                }}
                title={collapsed ? t.label : undefined}
                className={[
                  "w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 group relative",
                  collapsed ? "justify-center px-0 py-3" : "px-4 py-3",
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white",
                ].join(" ")}
              >
                {/* active left bar */}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-indigo-300" />
                )}

                <span className="text-base flex-shrink-0">{t.icon}</span>

                {!collapsed && (
                  <span className="whitespace-nowrap">{t.label}</span>
                )}

                {/* tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                    {t.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Footer: dept info + logout ── */}
        <div className="px-3 pb-5 space-y-1 border-t border-slate-800/60 pt-4">
          {/* dept chip — only expanded */}
          {!collapsed && user?.staffDetails?.department && (
            <div className="mx-1 mb-3 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-0.5">
                Department
              </p>
              <p className="text-slate-300 text-xs font-semibold truncate">
                {user.staffDetails.department}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            title={collapsed ? "Sign Out" : undefined}
            className={[
              "w-full flex items-center gap-3 rounded-xl text-sm font-semibold transition-all duration-150 group relative",
              "text-slate-400 hover:bg-red-500/10 hover:text-red-400",
              collapsed ? "justify-center px-0 py-3" : "px-4 py-3",
            ].join(" ")}
          >
            <span className="text-base flex-shrink-0">🚪</span>
            {!collapsed && <span>Sign Out</span>}

            {collapsed && (
              <span className="absolute left-full ml-3 px-2 py-1 rounded-lg bg-slate-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl z-50">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile hamburger (top-left) ── */}
      <button
        onClick={() => setCollapsed(false)}
        className={[
          "fixed top-4 left-4 z-40 lg:hidden",
          "w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-lg",
          !collapsed && "hidden",
        ].join(" ")}
      >
        ☰
      </button>
    </>
  );
}