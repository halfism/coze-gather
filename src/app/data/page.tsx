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

const CATEGORY_COLORS: Record<string, string> = {
  "销售": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "用户": "bg-violet-50 text-violet-700 border-violet-200",
  "运营": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "流量": "bg-sky-50 text-sky-700 border-sky-200",
  "收入": "bg-amber-50 text-amber-700 border-amber-200",
  "默认": "bg-slate-50 text-slate-700 border-slate-200",
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
          <Link href="/data" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/8 text-primary" aria-current="page">
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
            <h2 className="text-sm font-medium text-muted-foreground">数据录入</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-muted-foreground">
                查看大屏
              </Button>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">初</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-background p-6">
          {/* Page Title + Action */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">数据录入管理</h1>
              <p className="text-sm text-muted-foreground mt-1">增删改查数据记录，变更后实时同步至大屏</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  + 新增数据
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editId ? "编辑数据" : "新增数据"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>标题 *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="输入数据标题"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>数值 *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      placeholder="输入数值"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>描述</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="输入数据描述"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>分类</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["销售", "用户", "运营", "流量", "收入", "默认"].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>颜色</Label>
                      <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Button onClick={handleSubmit} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    {editId ? "保存修改" : "创建记录"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "总记录数", value: String(records.length) },
              { label: "分类数", value: String(new Set(records.map((r) => r.category)).size) },
              { label: "数值总和", value: records.reduce((sum, r) => sum + r.value, 0).toLocaleString() },
              { label: "平均值", value: records.length > 0 ? (records.reduce((sum, r) => sum + r.value, 0) / records.length).toFixed(1) : "0" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card rounded-lg shadow-card p-4">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                <div className="text-xl font-bold text-foreground mt-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2 mb-4">
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

          {/* Data Table */}
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">加载中...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              暂无数据记录，点击 &ldquo;新增数据&rdquo; 创建第一条记录
            </div>
          ) : (
            <div className="bg-card rounded-lg shadow-card border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-muted-foreground">标题</TableHead>
                    <TableHead className="text-muted-foreground">数值</TableHead>
                    <TableHead className="text-muted-foreground">描述</TableHead>
                    <TableHead className="text-muted-foreground">分类</TableHead>
                    <TableHead className="text-muted-foreground">颜色</TableHead>
                    <TableHead className="text-muted-foreground text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium text-foreground">{record.title}</TableCell>
                      <TableCell className="font-mono text-primary">{record.value.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{record.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={CATEGORY_COLORS[record.category] || CATEGORY_COLORS["默认"]}
                        >
                          {record.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="inline-block w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: record.color }} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="text-muted-foreground hover:text-primary"
                          >
                            编辑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
