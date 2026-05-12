import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "数据可视化平台",
  description: "数据录入与可视化大屏展示平台",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-6">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            平台运行中
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent mb-4">
            数据可视化平台
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            基于 Next.js 16 + Prisma ORM + Recharts 构建的全栈数据录入与可视化大屏展示系统
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Entry Card */}
          <Link
            href="/data"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 p-8 transition-all duration-300 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/0 to-indigo-600/0 group-hover:from-indigo-600/5 group-hover:to-violet-600/5 transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">数据录入</h2>
              <p className="text-slate-400 leading-relaxed">
                支持标题、数值、描述等字段的增删改查操作，表单提交后实时呈现数据变更
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-indigo-400 group-hover:text-indigo-300 transition-colors">
                进入管理
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Dashboard Card */}
          <Link
            href="/dashboard"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-slate-700/50 p-8 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-cyan-600/0 group-hover:from-cyan-600/5 group-hover:to-emerald-600/5 transition-all duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/25">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">可视化大屏</h2>
              <p className="text-slate-400 leading-relaxed">
                柱状图、折线图、饼图等多种图表实时展示，支持数据分类筛选与动态更新
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-cyan-400 group-hover:text-cyan-300 transition-colors">
                查看大屏
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Tech Stack */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {["Next.js 16", "Prisma 7", "Recharts", "TypeScript 5", "Tailwind CSS 4", "shadcn/ui"].map((tech) => (
            <span key={tech} className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-full">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
