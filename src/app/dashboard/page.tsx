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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    const interval = setInterval(fetchData, 30000); // Auto refresh every 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  // Clock
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

  // Chart data
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center">
        <div className="text-slate-400 text-lg">加载可视化数据中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-4 md:p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                数据可视化大屏
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                实时
              </Badge>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              数据每30秒自动刷新 | 共 {records.length} 条记录
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-mono text-sm">{currentTime}</span>
            <Link href="/data">
              <button className="px-4 py-2 text-sm bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/60 hover:text-indigo-300 transition-all">
                数据管理
              </button>
            </Link>
            <Link href="/">
              <button className="px-4 py-2 text-sm bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/60 transition-all">
                首页
              </button>
            </Link>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-slate-500">筛选:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "bg-slate-800/40 text-slate-500 border border-slate-700/40 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "数据总量", value: stats?.total ?? 0, suffix: "条", gradient: "from-indigo-500 to-violet-500" },
            { label: "数值总和", value: (stats?.sumValue ?? 0).toLocaleString(), suffix: "", gradient: "from-cyan-500 to-blue-500" },
            { label: "平均数值", value: (stats?.avgValue ?? 0).toFixed(1), suffix: "", gradient: "from-emerald-500 to-teal-500" },
            { label: "最大数值", value: (stats?.maxValue ?? 0).toLocaleString(), suffix: "", gradient: "from-amber-500 to-orange-500" },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.gradient}`} />
              <CardContent className="p-4">
                <div className="text-xs text-slate-400 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-white">
                  {kpi.value}
                  <span className="text-sm text-slate-400 ml-1">{kpi.suffix}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                柱状图 - 数值对比
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full" />
                饼图 - 分类占比
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categorySumData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                折线图 - 数据趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
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
            </CardContent>
          </Card>

          {/* Area Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-violet-400 rounded-full" />
                面积图 - 数值分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                    labelFormatter={(label) => {
                      const item = areaData.find((d) => d.index === Number(label));
                      return item?.name || String(label);
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-400 rounded-full" />
                雷达图 - 分类均值
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 10 }} />
                  <Radar
                    name="平均值"
                    dataKey="value"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Horizontal Bar Chart - Category Count */}
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <span className="w-2 h-2 bg-pink-400 rounded-full" />
                条形图 - 分类统计
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} width={40} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#94a3b8" }} />
                  <Bar dataKey="count" name="记录数" radius={[0, 4, 4, 0]}>
                    {(stats?.categoryStats ?? []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-slate-600">
          数据可视化平台 | Next.js 16 + Prisma 7 + Recharts | 实时数据大屏
        </div>
      </div>
    </div>
  );
}
