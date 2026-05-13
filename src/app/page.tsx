import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "概览 - 数据可视化平台",
  description: "数据可视化平台概览",
};

export default function HomePage() {
  return (
    <div className="flex h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-card border-r border-border/30 overflow-y-auto hidden md:flex flex-col">
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-base tracking-tight">DataViz</span>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 flex-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/8 text-primary" aria-current="page">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            概览
          </Link>
          <Link href="/data" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
            数据录入
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            可视化大屏
          </Link>
        </nav>
        <div className="p-3 border-t border-border/20">
          <div className="px-3 py-2 text-xs text-muted-foreground">DataViz Platform v1.0</div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card sticky top-0 z-40 h-14 flex items-center justify-between px-5 border-b border-border/30">
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </Link>
            <h2 className="text-sm font-medium text-muted-foreground">概览</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-secondary transition-colors" type="button">
              <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">初</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">欢迎回来，小初</h1>
            <p className="text-sm text-muted-foreground mt-1">以下是你的数据平台概览</p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "总记录数", value: "12", change: "+3 本月新增", iconBg: "bg-primary/10", iconColor: "text-primary", changeColor: "text-chart-4" },
              { label: "数值总和", value: "173,464", change: "+12.5% 较上月", iconBg: "bg-chart-4/10", iconColor: "text-chart-4", changeColor: "text-chart-4" },
              { label: "平均值", value: "14,455", change: "跨所有分类", iconBg: "bg-chart-3/10", iconColor: "text-chart-3", changeColor: "text-muted-foreground" },
              { label: "分类数", value: "5", change: "销售/用户/运营/流量/收入", iconBg: "bg-chart-5/10", iconColor: "text-chart-5", changeColor: "text-muted-foreground" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-lg shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                    <svg className={`w-4 h-4 ${stat.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className={`text-xs font-medium mt-1 ${stat.changeColor}`}>{stat.change}</div>
              </div>
            ))}
          </div>

          {/* Category Distribution + Recent Records */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg shadow-card p-5">
              <h2 className="text-base font-semibold text-foreground mb-4">分类分布</h2>
              <div className="space-y-3">
                {[
                  { name: "流量", value: "131,580", pct: 75, color: "bg-chart-2" },
                  { name: "销售", value: "21,172", pct: 12, color: "bg-chart-1" },
                  { name: "收入", value: "14,590", pct: 8, color: "bg-chart-3" },
                  { name: "用户", value: "5,998", pct: 4, color: "bg-chart-4" },
                  { name: "运营", value: "123.5", pct: 1, color: "bg-chart-5" },
                ].map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground">{cat.value}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">最近记录</h2>
                <Link href="/data" className="text-sm font-medium text-primary hover:underline">查看全部</Link>
              </div>
              <div className="divide-y divide-border/40">
                {[
                  { name: "页面访问量", category: "流量", value: "89,430", date: "2026-05-12", dotColor: "bg-chart-2" },
                  { name: "独立访客", category: "流量", value: "42,150", date: "2026-05-12", dotColor: "bg-sky-500" },
                  { name: "线上销售额", category: "销售", value: "12,580", date: "2026-05-12", dotColor: "bg-chart-1" },
                  { name: "会员收入", category: "收入", value: "8,920", date: "2026-05-12", dotColor: "bg-chart-3" },
                  { name: "新增用户", category: "用户", value: "3,580", date: "2026-05-12", dotColor: "bg-chart-4" },
                ].map((rec) => (
                  <div key={rec.name} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${rec.dotColor}`} />
                      <div>
                        <span className="text-sm font-medium text-foreground">{rec.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{rec.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-foreground">{rec.value}</div>
                      <div className="text-xs text-muted-foreground">{rec.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/data" className="group bg-card rounded-lg shadow-card p-5 hover:shadow-float transition-shadow border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">数据录入</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">添加、编辑、删除数据记录</p>
                </div>
              </div>
            </Link>
            <Link href="/dashboard" className="group bg-card rounded-lg shadow-card p-5 hover:shadow-float transition-shadow border border-transparent hover:border-primary/20">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">可视化大屏</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">查看数据图表与趋势分析</p>
                </div>
              </div>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
