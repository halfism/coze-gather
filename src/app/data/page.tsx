"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";

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

/* ---------- helpers ---------- */
const INDIGO_SHADES = [
  "bg-indigo-600",
  "bg-indigo-500",
  "bg-indigo-400",
  "bg-indigo-300",
  "bg-blue-400",
  "bg-blue-300",
];

function getCategoryDot(category: string, categories: string[]) {
  const idx = categories.indexOf(category);
  const shade = INDIGO_SHADES[idx % INDIGO_SHADES.length];
  return shade;
}

/* ---------- component ---------- */
export default function DataPage() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filterCat, setFilterCat] = useState<string>("全部");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", value: "", description: "", category: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* fetch */
  const fetchData = useCallback(async () => {
    try {
      const [recRes, statRes] = await Promise.all([fetch("/api/records"), fetch("/api/stats")]);
      const recJson = await recRes.json();
      const statJson = await statRes.json();
      if (recJson.success) setRecords(recJson.data);
      if (statJson.success) setCategories(statJson.data.categories);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* stats */
  const total = records.length;
  const sumValue = records.reduce((s, r) => s + r.value, 0);
  const avgValue = total > 0 ? (sumValue / total).toFixed(0) : "0";
  const maxValue = total > 0 ? Math.max(...records.map((r) => r.value)) : 0;

  /* filtered */
  const filtered = filterCat === "全部" ? records : records.filter((r) => r.category === filterCat);

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId ? `/api/records/${editId}` : "/api/records";
      const method = editId ? "PUT" : "POST";
      const body: Record<string, unknown> = {
        title: form.title,
        value: Number(form.value),
        description: form.description,
        category: form.category || "未分类",
      };
      if (!editId) body.color = "#6366f1";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (json.success) {
        setShowForm(false);
        setEditId(null);
        setForm({ title: "", value: "", description: "", category: "" });
        fetchData();
      }
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false);
    }
  };

  /* edit */
  const handleEdit = (r: DataRecord) => {
    setEditId(r.id);
    setForm({ title: r.title, value: String(r.value), description: r.description, category: r.category });
    setShowForm(true);
  };

  /* delete */
  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/records/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      /* ignore */
    } finally {
      setDeleting(null);
    }
  };

  /* ---------- render ---------- */
  return (
    <AppLayout pageTitle="数据录入">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Stats Cards - indigo gradients */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "数据总量", value: total, unit: "条", gradient: "from-indigo-600 to-indigo-500", iconBg: "from-indigo-500/15 to-indigo-400/10", iconColor: "text-indigo-500" },
            { label: "数据总值", value: sumValue.toLocaleString(), unit: "", gradient: "from-indigo-500 to-indigo-400", iconBg: "from-indigo-400/15 to-indigo-300/10", iconColor: "text-indigo-400" },
            { label: "数据均值", value: Number(avgValue).toLocaleString(), unit: "", gradient: "from-indigo-400 to-indigo-300", iconBg: "from-indigo-300/15 to-indigo-200/10", iconColor: "text-indigo-300" },
            { label: "最大值", value: maxValue.toLocaleString(), unit: "", gradient: "from-indigo-300 to-blue-200", iconBg: "from-blue-300/15 to-blue-200/10", iconColor: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight">{s.value}</span>
                {s.unit && <span className="text-sm text-muted-foreground">{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="glass-strong rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2 flex-1">
            <button
              onClick={() => setFilterCat("全部")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                filterCat === "全部"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-glow"
                  : "glass-subtle text-muted-foreground hover:bg-white/50"
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 inline-flex items-center gap-1.5 ${
                  filterCat === cat
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-400 text-white shadow-glow"
                    : "glass-subtle text-muted-foreground hover:bg-white/50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${getCategoryDot(cat, categories)}`} />
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => { setEditId(null); setForm({ title: "", value: "", description: "", category: "" }); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-sm font-medium shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            新增数据
          </button>
        </div>

        {/* Table */}
        <div className="glass-strong rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground">标题</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground">数值</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground">分类</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-muted-foreground">描述</th>
                  <th className="text-right py-3.5 px-5 text-xs font-semibold text-muted-foreground">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">加载中...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-16 text-center text-muted-foreground">暂无数据</td></tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="border-b border-black/3 hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3.5 px-5 font-medium">{r.title}</td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-semibold">{r.value.toLocaleString()}</span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md glass-subtle text-xs font-medium">
                          <span className={`w-2 h-2 rounded-full ${getCategoryDot(r.category, categories)}`} />
                          {r.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-muted-foreground max-w-[200px] truncate">{r.description}</td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => handleEdit(r)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium glass-subtle text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium glass-subtle text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-all disabled:opacity-40"
                          >
                            {deleting === r.id ? "删除中" : "删除"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link href="/" className="text-xs text-muted-foreground hover:text-indigo-500 transition-colors">
            ← 返回概览
          </Link>
        </div>
      </div>

      {/* Modal - glass */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md shadow-float border border-white/60">
            <h3 className="text-base font-semibold mb-5">{editId ? "编辑数据" : "新增数据"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">标题 *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all placeholder:text-muted-foreground/40"
                  placeholder="输入标题"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">数值 *</label>
                <input
                  required
                  type="number"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all placeholder:text-muted-foreground/40"
                  placeholder="输入数值"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">分类</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all placeholder:text-muted-foreground/40"
                  placeholder="输入分类"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">描述</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-300 transition-all placeholder:text-muted-foreground/40 resize-none"
                  placeholder="输入描述"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl glass text-sm font-medium text-muted-foreground hover:bg-white/50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-sm font-medium shadow-glow hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? "提交中..." : editId ? "更新" : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
