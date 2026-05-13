"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* ---------- types ---------- */
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

/* ---------- chart colors (图表不受单色限制) ---------- */
const CHART_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#f97316", "#14b8a6"];

/* ---------- glass tooltip ---------- */
const GlassTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 shadow-float border border-white/60 text-xs">
      {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ---------- component ---------- */
export default function DashboardPage() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [filterCat, setFilterCat] = useState<string>("全部");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [recRes, statRes] = await Promise.all([fetch("/api/records"), fetch("/api/stats")]);
      const recJson = await recRes.json();
      const statJson = await statRes.json();
      if (recJson.success) setRecords(recJson.data);
      if (statJson.success) setStats(statJson.data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* auto-refresh every 30s */
  useEffect(() => {
    const iv = setInterval(fetchData, 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  if (!stats) return <AppLayout pageTitle="可视化大屏"><div className="flex items-center justify-center h-64 text-muted-foreground">加载中...</div></AppLayout>;

  const filtered = filterCat === "全部" ? records : records.filter((r) => r.category === filterCat);
  const filteredStats = filterCat === "全部" ? stats.categoryStats : stats.categoryStats.filter((c) => c.category === filterCat);

  /* chart data */
  const barData = stats.categoryStats.map((c, i) => ({ name: c.category, 合计: c.sum, 均值: Math.round(c.avg), fill: CHART_COLORS[i % CHART_COLORS.length] }));
  const pieData = stats.categoryStats.map((c, i) => ({ name: c.category, value: c.sum, fill: CHART_COLORS[i % CHART_COLORS.length] }));
  const lineData = [...records].reverse().slice(0, 15).map((r) => ({ name: r.title.slice(0, 6), 数值: r.value }));
  const areaData = stats.categoryStats.map((c, i) => ({ name: c.category, 数量: c.count, 合计: c.sum, fill: CHART_COLORS[i % CHART_COLORS.length] }));
  const radarData = stats.categoryStats.map((c) => ({ category: c.category, 均值: Math.round(c.avg / 100), 数量: c.count }));
  const horizontalBarData = [...records].sort((a, b) => b.value - a.value).slice(0, 8).map((r) => ({ name: r.title.slice(0, 8), 数值: r.value }));

  return (
    <AppLayout pageTitle="可视化大屏">
      <div className="space-y-5 max-w-7xl mx-auto">
        {/* Filter Bar - indigo only */}
        <div className="glass-strong rounded-2xl p-3 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterCat("全部")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              filterCat === "全部"
                ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-glow"
                : "glass-subtle text-muted-foreground hover:bg-white/50"
            }`}
          >
            全部
          </button>
          {stats.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterCat === cat
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-glow"
                  : "glass-subtle text-muted-foreground hover:bg-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-muted-foreground">30s 自动刷新</span>
        </div>

        {/* KPI Cards - indigo gradients */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "数据总量", value: stats.total, unit: "条", gradient: "from-indigo-600 to-indigo-500" },
            { label: "数据总值", value: stats.sumValue.toLocaleString(), unit: "", gradient: "from-indigo-500 to-indigo-400" },
            { label: "数据均值", value: Math.round(stats.avgValue).toLocaleString(), unit: "", gradient: "from-indigo-400 to-indigo-300" },
            { label: "最大值", value: stats.maxValue.toLocaleString(), unit: "", gradient: "from-indigo-300 to-blue-200" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-strong rounded-2xl p-5">
              <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">{kpi.value}</span>
                {kpi.unit && <span className="text-sm text-muted-foreground">{kpi.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1: Bar + Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">分类统计</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<GlassTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="合计" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.85} />)}
                </Bar>
                <Bar dataKey="均值" fill="#a5b4fc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">分类占比</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<GlassTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2: Line + Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">数据趋势</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<GlassTooltip />} />
                <Line type="monotone" dataKey="数值" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">分类面积图</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <Tooltip content={<GlassTooltip />} />
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="合计" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3: Radar + Horizontal Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">多维雷达</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(0,0,0,0.06)" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <PolarRadiusAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Radar name="均值" dataKey="均值" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                <Radar name="数量" dataKey="数量" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} strokeWidth={2} />
                <Tooltip content={<GlassTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-strong rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4">数值排名</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={horizontalBarData} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={60} />
                <Tooltip content={<GlassTooltip />} />
                <Bar dataKey="数值" radius={[0, 6, 6, 0]}>
                  {horizontalBarData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-strong rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4">数据明细 ({filtered.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">标题</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">数值</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">分类</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-muted-foreground">描述</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 10).map((r) => (
                  <tr key={r.id} className="border-b border-black/3 hover:bg-indigo-50/30 transition-colors">
                    <td className="py-2.5 px-4 font-medium">{r.title}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold">{r.value.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{r.category}</td>
                    <td className="py-2.5 px-4 text-muted-foreground max-w-[200px] truncate">{r.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-indigo-500 transition-colors">
            ← 返回概览
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
