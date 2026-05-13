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
import { AppLayout } from "@/components/app-layout";

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
];

const PIE_COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.5)",
  borderRadius: "12px",
  color: "#1e293b",
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

const GRID_STROKE = "rgba(148,163,184,0.15)";
const TICK_STYLE = { fill: "#94a3b8", fontSize: 11 };

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
      <AppLayout pageTitle="可视化大屏">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="glass-strong rounded-2xl p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-muted-foreground">加载可视化数据中...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="可视化大屏">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">数据可视化大屏</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50/80 text-emerald-600 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                实时
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              数据每30秒自动刷新 | 共 {records.length} 条记录 | <span className="font-mono text-xs">{currentTime}</span>
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">筛选:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                filterCategory === cat
                  ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-glow"
                  : "glass-subtle text-muted-foreground hover:bg-white/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "数据总量", value: stats?.total ?? 0, suffix: "条", gradient: "from-indigo-500 to-violet-600", icon: "📊" },
            { label: "数值总和", value: (stats?.sumValue ?? 0).toLocaleString(), suffix: "", gradient: "from-cyan-500 to-blue-600", icon: "💰" },
            { label: "平均数值", value: (stats?.avgValue ?? 0).toFixed(1), suffix: "", gradient: "from-emerald-500 to-teal-600", icon: "📈" },
            { label: "最大数值", value: (stats?.maxValue ?? 0).toLocaleString(), suffix: "", gradient: "from-amber-500 to-orange-600", icon: "🏆" },
          ].map((kpi) => (
            <div key={kpi.label} className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight">
                    {kpi.value}
                    {kpi.suffix && <span className="text-sm text-muted-foreground ml-1 font-normal">{kpi.suffix}</span>}
                  </p>
                </div>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center text-white text-lg shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                  {kpi.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" />
              <h3 className="text-sm font-semibold">柱状图 - 数值对比</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} angle={-30} textAnchor="end" />
                <YAxis tick={TICK_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600" />
              <h3 className="text-sm font-semibold">饼图 - 分类占比</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {PIE_COLORS.map((color, i) => (
                    <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
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
                  {categorySumData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % PIE_COLORS.length})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600" />
              <h3 className="text-sm font-semibold">折线图 - 数据趋势</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} angle={-30} textAnchor="end" />
                <YAxis tick={TICK_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="url(#lineGrad)"
                  strokeWidth={2.5}
                  dot={{ fill: "#10b981", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600" />
              <h3 className="text-sm font-semibold">面积图 - 数值分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
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
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" />
              <h3 className="text-sm font-semibold">雷达图 - 分类均值</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(148,163,184,0.2)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <Radar
                  name="平均值"
                  dataKey="value"
                  stroke="#f59e0b"
                  fill="url(#radarGrad)"
                  strokeWidth={2}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Horizontal Bar Chart */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" />
              <h3 className="text-sm font-semibold">条形图 - 分类统计</h3>
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
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Bar dataKey="count" name="记录数" radius={[0, 6, 6, 0]}>
                  {(stats?.categoryStats ?? []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/60 pb-4">
          数据可视化平台 | Next.js 16 + Prisma 7 + Recharts | 毛玻璃浅色主题
        </div>
      </div>
    </AppLayout>
  );
}
