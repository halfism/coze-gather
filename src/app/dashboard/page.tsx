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

/* Blue-only gradient palette: dark → light for category distinction */
const BLUE_SHADES = [
  "#1e40af", // 深蓝
  "#2563eb", // 蓝色
  "#3b82f6", // 标准蓝
  "#60a5fa", // 亮蓝
  "#93c5fd", // 浅蓝
  "#bfdbfe", // 淡蓝
  "#0ea5e9", // 天蓝
  "#0284c7", // 海蓝
  "#7dd3fc", // 清蓝
  "#bae6fd", // 极淡蓝
];

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.15)",
  borderRadius: "12px",
  color: "#1e293b",
  boxShadow: "0 8px 32px rgba(59,130,246,0.08)",
  padding: "10px 14px",
};

const GRID_STROKE = "rgba(148,163,184,0.12)";
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

  /* Bar chart: each bar gets a blue shade */
  const barChartData = filteredRecords.map((r, i) => ({
    name: r.title,
    value: r.value,
    fill: BLUE_SHADES[i % BLUE_SHADES.length],
  }));

  /* Pie chart: blue gradient slices */
  const categorySumData = stats?.categoryStats.map((cs, i) => ({
    name: cs.category,
    value: cs.sum,
    count: cs.count,
    fill: BLUE_SHADES[i % BLUE_SHADES.length],
  })) || [];

  /* Line chart */
  const lineChartData = records.slice().reverse().map((r) => ({
    name: r.title.length > 6 ? r.title.slice(0, 6) + "…" : r.title,
    value: r.value,
  }));

  /* Radar chart */
  const radarData = stats?.categoryStats.map((cs, i) => ({
    category: cs.category,
    value: cs.avg,
    count: cs.count,
  })) || [];

  /* Area chart */
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
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
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
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                实时
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              数据每30秒自动刷新 | 共 {records.length} 条记录 | <span className="font-mono text-xs">{currentTime}</span>
            </p>
          </div>
        </div>

        {/* Category Filter - Blue gradient active */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">筛选:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                filterCategory === cat
                  ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-glow"
                  : "glass-subtle text-muted-foreground hover:bg-white/50 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KPI Stats - All blue shades */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "数据总量", value: stats?.total ?? 0, suffix: "条", shade: "bg-blue-500" },
            { label: "数值总和", value: (stats?.sumValue ?? 0).toLocaleString(), suffix: "", shade: "bg-blue-400" },
            { label: "平均数值", value: (stats?.avgValue ?? 0).toFixed(1), suffix: "", shade: "bg-blue-300" },
            { label: "最大数值", value: (stats?.maxValue ?? 0).toLocaleString(), suffix: "", shade: "bg-blue-600" },
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
                <div className={`w-11 h-11 rounded-xl ${kpi.shade} flex items-center justify-center text-white shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Bar Chart - Blue gradient bars */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-400" />
              <h3 className="text-sm font-semibold">柱状图 - 数值对比</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  {BLUE_SHADES.map((color, i) => (
                    <linearGradient key={`barGrad${i}`} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis dataKey="name" tick={TICK_STYLE} angle={-30} textAnchor="end" />
                <YAxis tick={TICK_STYLE} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barChartData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#barGrad${index % BLUE_SHADES.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart - Blue gradient donut */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-200" />
              <h3 className="text-sm font-semibold">饼图 - 分类占比</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  {BLUE_SHADES.map((color, i) => (
                    <linearGradient key={`pieGrad${i}`} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1} />
                      <stop offset="100%" stopColor={BLUE_SHADES[(i + 2) % BLUE_SHADES.length]} stopOpacity={0.8} />
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
                    <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % BLUE_SHADES.length})`} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Blue gradient stroke */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-300" />
              <h3 className="text-sm font-semibold">折线图 - 数据趋势</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#60a5fa" />
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
                  dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Area Chart - Blue gradient fill */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-200" />
              <h3 className="text-sm font-semibold">面积图 - 数值分布</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
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
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart - Blue gradient fill */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
              <h3 className="text-sm font-semibold">雷达图 - 分类均值</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(59,130,246,0.12)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "#64748b", fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: "#cbd5e1", fontSize: 10 }} />
                <defs>
                  <linearGradient id="radarGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <Radar
                  name="平均值"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="url(#radarGrad)"
                  strokeWidth={2}
                />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Horizontal Bar Chart - Blue gradient */}
          <div className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-300" />
              <h3 className="text-sm font-semibold">条形图 - 分类统计</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats?.categoryStats.map((cs, i) => ({
                  name: cs.category,
                  count: cs.count,
                  sum: cs.sum,
                })) || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <defs>
                  {BLUE_SHADES.map((color, i) => (
                    <linearGradient key={`hBarGrad${i}`} id={`hBarGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={BLUE_SHADES[(i + 3) % BLUE_SHADES.length]} stopOpacity={0.8} />
                      <stop offset="100%" stopColor={color} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
                <XAxis type="number" tick={TICK_STYLE} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend wrapperStyle={{ color: "#64748b", fontSize: 12 }} />
                <Bar dataKey="count" name="记录数" radius={[0, 6, 6, 0]}>
                  {(stats?.categoryStats ?? []).map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#hBarGrad${index % BLUE_SHADES.length})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground/60 pb-4">
          数据可视化平台 | Next.js 16 + Prisma 7 + Recharts | 蓝色毛玻璃浅色主题
        </div>
      </div>
    </AppLayout>
  );
}
