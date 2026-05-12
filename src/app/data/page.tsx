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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  "销售": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  "用户": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  "运营": "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "流量": "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  "收入": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "默认": "bg-slate-500/20 text-slate-300 border-slate-500/30",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-sm text-slate-500 hover:text-indigo-400 transition-colors mb-2 inline-block">
              &larr; 返回首页
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              数据录入管理
            </h1>
            <p className="text-slate-400 mt-1">增删改查数据记录，变更后实时同步至大屏</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/dashboard">
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-cyan-300">
                查看大屏
              </Button>
            </a>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25">
                  + 新增数据
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editId ? "编辑数据" : "新增数据"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">标题 *</Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="输入数据标题"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">数值 *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.value}
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                      placeholder="输入数值"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">描述</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="输入数据描述"
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">分类</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {["销售", "用户", "运营", "流量", "收入", "默认"].map((c) => (
                            <SelectItem key={c} value={c} className="text-white">{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">颜色</Label>
                      <Select value={form.color} onValueChange={(v) => setForm({ ...form, color: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600">
                          {COLOR_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value} className="text-white">
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
                  <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white">
                    {editId ? "保存修改" : "创建记录"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400">总记录数</div>
              <div className="text-2xl font-bold text-white mt-1">{records.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400">分类数</div>
              <div className="text-2xl font-bold text-white mt-1">{new Set(records.map((r) => r.category)).size}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400">数值总和</div>
              <div className="text-2xl font-bold text-white mt-1">
                {records.reduce((sum, r) => sum + r.value, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-4">
              <div className="text-sm text-slate-400">平均值</div>
              <div className="text-2xl font-bold text-white mt-1">
                {records.length > 0
                  ? (records.reduce((sum, r) => sum + r.value, 0) / records.length).toFixed(1)
                  : "0"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-slate-400">筛选分类:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filterCategory === cat
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Separator className="bg-slate-700/50 mb-6" />

        {/* Data Table */}
        {loading ? (
          <div className="text-center py-20 text-slate-400">加载中...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            暂无数据记录，点击 &ldquo;新增数据&rdquo; 创建第一条记录
          </div>
        ) : (
          <div className="rounded-xl border border-slate-700/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-400">标题</TableHead>
                  <TableHead className="text-slate-400">数值</TableHead>
                  <TableHead className="text-slate-400">描述</TableHead>
                  <TableHead className="text-slate-400">分类</TableHead>
                  <TableHead className="text-slate-400">颜色</TableHead>
                  <TableHead className="text-slate-400 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="border-slate-700/30 hover:bg-slate-800/30">
                    <TableCell className="text-white font-medium">{record.title}</TableCell>
                    <TableCell className="text-indigo-300 font-mono">{record.value.toLocaleString()}</TableCell>
                    <TableCell className="text-slate-400 max-w-[200px] truncate">{record.description}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={CATEGORY_COLORS[record.category] || CATEGORY_COLORS["默认"]}
                      >
                        {record.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: record.color }} />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(record)}
                          className="text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                        >
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                          className="text-slate-400 hover:text-red-300 hover:bg-red-500/10"
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
      </div>
    </div>
  );
}
