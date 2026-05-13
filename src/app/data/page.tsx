"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  "销售": { bg: "bg-indigo-50/80", text: "text-indigo-600", dot: "bg-indigo-400" },
  "用户": { bg: "bg-violet-50/80", text: "text-violet-600", dot: "bg-violet-400" },
  "运营": { bg: "bg-emerald-50/80", text: "text-emerald-600", dot: "bg-emerald-400" },
  "流量": { bg: "bg-sky-50/80", text: "text-sky-600", dot: "bg-sky-400" },
  "收入": { bg: "bg-amber-50/80", text: "text-amber-600", dot: "bg-amber-400" },
  "测试": { bg: "bg-rose-50/80", text: "text-rose-600", dot: "bg-rose-400" },
  "默认": { bg: "bg-slate-50/80", text: "text-slate-600", dot: "bg-slate-400" },
};

const COLOR_OPTIONS = [
  { label: "靛蓝", value: "#6366f1" },
  { label: "紫色", value: "#8b5cf6" },
  { label: "紫红", value: "#a855f7" },
  { label: "青色", value: "#06b6d4" },
  { label: "绿色", value: "#10b981" },
  { label: "琥珀", value: "#f59e0b" },
  { label: "红色", value: "#ef4444" },
  { label: "翠绿", value: "#22c55e" },
  { label: "蓝色", value: "#3b82f6" },
  { label: "天蓝", value: "#0ea5e9" },
  { label: "粉色", value: "#ec4899" },
  { label: "橙色", value: "#f97316" },
];

const emptyForm = { title: "", value: "", description: "", category: "默认", color: "#6366f1" };

export default function DataPage() {
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("全部");

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/records");
      const json = await res.json();
      if (json.success) {
        setRecords(json.data);
      }
    } catch (err) {
      console.error("获取数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const categories = ["全部", ...Array.from(new Set(records.map((r) => r.category)))];
  const filteredRecords = filterCategory === "全部"
    ? records
    : records.filter((r) => r.category === filterCategory);

  const handleSubmit = async () => {
    if (!form.title || !form.value) return;

    const payload = {
      title: form.title,
      value: Number(form.value),
      description: form.description,
      category: form.category,
      color: form.color,
    };

    try {
      if (editId) {
        await fetch(`/api/records/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setForm(emptyForm);
      setEditId(null);
      setDialogOpen(false);
      fetchRecords();
    } catch (err) {
      console.error("保存失败:", err);
    }
  };

  const handleEdit = (record: DataRecord) => {
    setForm({
      title: record.title,
      value: String(record.value),
      description: record.description,
      category: record.category,
      color: record.color,
    });
    setEditId(record.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/records/${id}`, { method: "DELETE" });
      fetchRecords();
    } catch (err) {
      console.error("删除失败:", err);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  return (
    <AppLayout pageTitle="数据录入">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">数据录入管理</h1>
            <p className="text-sm text-muted-foreground mt-1">增删改查数据记录，变更后实时同步至大屏</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openCreate}
                className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-glow hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-xl"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                新增数据
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/40 rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-semibold">{editId ? "编辑数据" : "新增数据"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">标题 *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="输入数据标题"
                    className="rounded-xl border-white/30 bg-white/40 focus:bg-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">数值 *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="输入数值"
                    className="rounded-xl border-white/30 bg-white/40 focus:bg-white/60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">描述</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="输入数据描述"
                    className="rounded-xl border-white/30 bg-white/40 focus:bg-white/60"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">分类</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                      <SelectTrigger className="rounded-xl border-white/30 bg-white/40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["销售", "用户", "运营", "流量", "收入", "默认"].map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">颜色</Label>
                    <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                      <SelectTrigger className="rounded-xl border-white/30 bg-white/40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            <span className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                              {c.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-glow hover:shadow-lg transition-all duration-200"
                >
                  {editId ? "保存修改" : "创建记录"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "总记录数", value: String(records.length), icon: "📋", gradient: "from-indigo-400/15 to-indigo-500/10" },
            { label: "分类数", value: String(new Set(records.map((r) => r.category)).size), icon: "🏷️", gradient: "from-violet-400/15 to-purple-500/10" },
            { label: "数值总和", value: records.reduce((sum, r) => sum + r.value, 0).toLocaleString(), icon: "📊", gradient: "from-cyan-400/15 to-blue-500/10" },
            { label: "平均值", value: records.length > 0 ? (records.reduce((sum, r) => sum + r.value, 0) / records.length).toFixed(1) : "0", icon: "📈", gradient: "from-emerald-400/15 to-teal-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="glass-strong rounded-2xl p-5 hover:shadow-float transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1.5 tracking-tight">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium mr-1">筛选:</span>
          {categories.map((cat) => {
            const style = cat !== "全部" ? CATEGORY_STYLES[cat] : null;
            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  filterCategory === cat
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-glow"
                    : "glass-subtle text-muted-foreground hover:bg-white/50 hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {style && <span className={`w-2 h-2 rounded-full ${style.dot}`} />}
                  {cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="glass-strong rounded-2xl p-20 text-center text-muted-foreground">
            <div className="animate-pulse">加载中...</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="glass-strong rounded-2xl p-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-muted-foreground">暂无数据记录</p>
            <p className="text-xs text-muted-foreground/60 mt-1">点击 &ldquo;新增数据&rdquo; 创建第一条记录</p>
          </div>
        ) : (
          <div className="glass-strong rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/30">
                  <TableHead className="text-muted-foreground text-xs font-semibold">标题</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">数值</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">描述</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">分类</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold">颜色</TableHead>
                  <TableHead className="text-muted-foreground text-xs font-semibold text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => {
                  const style = CATEGORY_STYLES[record.category] || CATEGORY_STYLES["默认"];
                  return (
                    <TableRow key={record.id} className="border-border/20 hover:bg-white/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{record.title}</TableCell>
                      <TableCell className="font-mono font-semibold text-indigo-600">{record.value.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{record.description}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${style.bg} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {record.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block w-5 h-5 rounded-lg border border-white/50 shadow-sm" style={{ backgroundColor: record.color }} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50/50 rounded-lg"
                          >
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-muted-foreground hover:text-red-600 hover:bg-red-50/50 rounded-lg"
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
