"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface DataRecord {
  id: string;
  title: string;
  value: number;
  description: string;
  category: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStat {
  category: string;
  count: number;
  sum: number;
  avg: number;
}

interface StatsData {
  categories: string[];
  total: number;
  sumValue: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
  categoryStats: CategoryStat[];
}

const CHART_COLORS = [
  "#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#3b82f6", "#ec4899", "#f97316", "#22c55e",
  "#0ea5e9", "#a855f7",
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

const TOOLTIP_STYLE = {
  backgroundColor: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#1e293b",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
};

const GRID_STROKE = "#e2e8f0";
const TICK_STYLE = { fill: "#64748b", fontSize: 11 };

export default function DashboardPage() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("全部");
  const [currentTime, setCurrentTime] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [recordsRes, statsRes] = await Promise.all([
        fetch("/api/records"),
        fetch("/api/stats"),
      ]);
      const recordsJson = await recordsRes.json();
      const statsJson = await statsRes.json();

      if (recordsJson.success) setRecords(recordsJson.data);
      if (statsJson.success) setStats(statsJson.data);
    } catch (err) {
      console.error("获取数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const categories = ["全部", ...Array.from(new Set(records.map((r) => r.category)))];
  const filteredRecords = filterCategory === "全部"
    ? records
    : records.filter((r) => r.category === filterCategory);

  const barChartData = filteredRecords.map((r) => ({
    name: r.title,
    value: r.value,
    fill: r.color,
  }));

  const categorySumData = stats?.categoryStats.map((cs, i) => ({
    name: cs.category,
    value: cs.sum,
    count: cs.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  })) || [];

  const lineChartData = records.slice().reverse().map((r) => ({
    name: r.title.length > 6 ? r.title.slice(0, 6) + "…" : r.title,
    value: r.value,
  }));

  const radarData = stats?.categoryStats.map((cs, i) => ({
    category: cs.category,
    value: cs.avg,
    count: cs.count,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  })) || [];

  const areaData = filteredRecords.slice().reverse().map((r, i) => ({
    index: i + 1,
    name: r.title,
    value: r.value,
  }));

  if (loading) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-muted-foreground text-lg">加载可视化数据中...</div>
      </div>
    );
  }

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
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            概览
          </Link>
          <Link href="/data" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
            数据录入
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/8 text-primary" aria-current="page">
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
            <h2 className="text-sm font-medium text-muted-foreground">可视化大屏</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-mono text-sm hidden sm:block">{currentTime}</span>
            <Link href="/data">
              <button className="px-3 py-1.5 text-sm bg-muted text-muted-foreground rounded-lg hover:bg-secondary hover:text-foreground transition-colors" type="button">
                数据管理
              </button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">初</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">数据可视化大屏</h1>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                  实时
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">数据每30秒自动刷新 | 共 {records.length} 条记录</p>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs text-muted-foreground font-medium">筛选:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* KPI Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "数据总量", value: stats?.total ?? 0, suffix: "条", accent: "border-t-primary" },
              { label: "数值总和", value: (stats?.sumValue ?? 0).toLocaleString(), suffix: "", accent: "border-t-chart-1" },
              { label: "平均数值", value: (stats?.avgValue ?? 0).toFixed(1), suffix: "", accent: "border-t-chart-3" },
              { label: "最大数值", value: (stats?.maxValue ?? 0).toLocaleString(), suffix: "", accent: "border-t-chart-4" },
            ].map((kpi) => (
              <div key={kpi.label} className={`bg-card rounded-lg shadow-card p-4 border-t-2 ${kpi.accent}`}>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</div>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {kpi.value}
                  <span className="text-sm text-muted-foreground ml-1 font-normal">{kpi.suffix}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <h3 className="text-base font-semibold text-foreground">柱状图 - 数值对比</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={TICK_STYLE} angle={-30} textAnchor="end" />
                  <YAxis tick={TICK_STYLE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-chart-1 rounded-full" />
                <h3 className="text-base font-semibold text-foreground">饼图 - 分类占比</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySumData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: "#64748b" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-chart-3 rounded-full" />
                <h3 className="text-base font-semibold text-foreground">折线图 - 数据趋势</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="name" tick={TICK_STYLE} angle={-30} textAnchor="end" />
                  <YAxis tick={TICK_STYLE} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-chart-2 rounded-full" />
                <h3 className="text-base font-semibold text-foreground">面积图 - 数值分布</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValueLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis dataKey="index" tick={TICK_STYLE} />
                  <YAxis tick={TICK_STYLE} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(label: number) => {
                      const item = areaData.find((d) => d.index === label);
                      return item?.name || String(label);
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValueLight)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Radar Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-chart-4 rounded-full" />
                <h3 className="text-base font-semibold text-foreground">雷达图 - 分类均值</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={GRID_STROKE} />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Radar
                    name="平均值"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal Bar Chart */}
            <div className="bg-card rounded-lg shadow-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 bg-chart-5 rounded-full" />
                <h3 className="text-base font-semibold text-foreground">条形图 - 分类统计</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats?.categoryStats.map((cs, i) => ({
                    name: cs.category,
                    count: cs.count,
                    sum: cs.sum,
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                  })) || []}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                  <XAxis type="number" tick={TICK_STYLE} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} width={40} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ color: "#64748b" }} />
                  <Bar dataKey="count" name="记录数" radius={[0, 4, 4, 0]}>
                    {(stats?.categoryStats ?? []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground">
            数据可视化平台 | Next.js 16 + Prisma 7 + Recharts | 实时数据大屏
          </div>
        </main>
      </div>
    </div>
  );
}
