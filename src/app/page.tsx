import type { Metadata } from "next";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";

export const metadata: Metadata = {
  title: "概览 - 数据可视化平台",
  description: "数据可视化平台概览",
};

export default function HomePage() {
  return (
    <AppLayout pageTitle="数据概览">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Hero Banner */}
        <div className="glass-strong rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-indigo-300/5" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-indigo-400/10 to-indigo-200/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-br from-indigo-300/8 to-indigo-100/8 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-indigo-700 to-indigo-400 bg-clip-text text-transparent">
                数据可视化平台
              </span>
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              集数据录入、实时统计与多维度可视化于一体，为企业决策提供数据驱动的洞察支持。
            </p>
            <div className="flex gap-3 mt-5">
              <Link
                href="/data"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-sm font-medium shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                录入数据
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-sm font-medium text-foreground hover:bg-white/60 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                可视化大屏
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards - indigo gradients only */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "数据总量",
              value: "13",
              unit: "条",
              change: "+3 本周",
              gradient: "from-indigo-600 to-indigo-500",
              iconBg: "from-indigo-500/15 to-indigo-400/10",
              iconColor: "text-indigo-500",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              ),
            },
            {
              label: "数据总值",
              value: "17.4万",
              unit: "",
              change: "+12.5%",
              gradient: "from-indigo-500 to-indigo-400",
              iconBg: "from-indigo-400/15 to-indigo-300/10",
              iconColor: "text-indigo-400",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              label: "分类数量",
              value: "6",
              unit: "个",
              change: "收入/流量/用户",
              gradient: "from-indigo-400 to-indigo-300",
              iconBg: "from-indigo-300/15 to-indigo-200/10",
              iconColor: "text-indigo-300",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              ),
            },
            {
              label: "数据均值",
              value: "1.34万",
              unit: "",
              change: "范围 3.2-89430",
              gradient: "from-indigo-300 to-blue-200",
              iconBg: "from-indigo-200/15 to-blue-200/10",
              iconColor: "text-indigo-300",
              icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              ),
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                    {stat.unit && <span className="text-sm text-muted-foreground">{stat.unit}</span>}
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center ${stat.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                  {stat.icon}
                </div>
              </div>
              <p className="mt-2.5 text-[11px] text-muted-foreground/80">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Category Distribution + Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-5">分类分布</h3>
            <div className="space-y-4">
              {[
                { name: "流量", count: 2, pct: 100, gradient: "from-indigo-600 to-indigo-500" },
                { name: "收入", count: 2, pct: 100, gradient: "from-indigo-500 to-indigo-400" },
                { name: "销售", count: 3, pct: 75, gradient: "from-indigo-400 to-indigo-300" },
                { name: "用户", count: 2, pct: 50, gradient: "from-indigo-300 to-indigo-200" },
                { name: "运营", count: 3, pct: 37, gradient: "from-blue-300 to-blue-200" },
                { name: "测试", count: 1, pct: 12, gradient: "from-blue-200 to-blue-100" },
              ].map((cat) => (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-8">{cat.name}</span>
                  <div className="flex-1 h-2.5 bg-white/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${cat.gradient} rounded-full transition-all duration-700`}
                      style={{ width: `${cat.pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-6 text-right">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Access - all indigo tones */}
          <div className="glass-strong rounded-2xl p-6">
            <h3 className="text-sm font-semibold mb-5">快捷入口</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  href: "/data",
                  label: "数据录入",
                  desc: "新增与管理数据",
                  iconBg: "from-indigo-500/10 to-indigo-400/5",
                  iconColor: "text-indigo-500",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  ),
                },
                {
                  href: "/dashboard",
                  label: "可视化大屏",
                  desc: "图表与数据分析",
                  iconBg: "from-indigo-400/10 to-indigo-300/5",
                  iconColor: "text-indigo-400",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
                {
                  href: "/data",
                  label: "批量操作",
                  desc: "导入与导出数据",
                  iconBg: "from-indigo-300/10 to-indigo-200/5",
                  iconColor: "text-indigo-300",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  ),
                },
                {
                  href: "/dashboard",
                  label: "报表中心",
                  desc: "查看统计报表",
                  iconBg: "from-blue-300/10 to-blue-200/5",
                  iconColor: "text-blue-400",
                  icon: (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`glass-subtle rounded-xl p-4 hover:bg-white/50 hover:shadow-float transition-all duration-300 group border border-transparent hover:border-white/60`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-3 ${item.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="glass rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js 16", "React 19", "TypeScript 5", "Prisma 7", "Recharts", "Tailwind CSS 4", "shadcn/ui"].map(
              (tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 rounded-lg glass-subtle text-[11px] font-medium text-muted-foreground"
                >
                  {tech}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
