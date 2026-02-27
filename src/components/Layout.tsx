import React, { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title = '企业信用风险分析' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } bg-gradient-to-b from-blue-600 to-blue-700 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-blue-500">
          <h1 className="text-xl font-bold">信用风险分析</h1>
          <p className="text-blue-100 text-sm mt-1">Credit Risk Analyzer</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/" icon="📊" label="仪表盘" />
          <NavLink href="/companies" icon="🏢" label="企业管理" />
          <NavLink href="/import" icon="📤" label="数据导入" />
          <NavLink href="/api" icon="🔌" label="API 接入" />
          <NavLink href="/analysis" icon="📈" label="风险分析" />
        </nav>

        <div className="p-4 border-t border-blue-500">
          <p className="text-xs text-blue-100">v1.0.0</p>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="text-2xl font-bold text-gradient">{title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label }) => {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-500/20 transition-colors text-blue-50 hover:text-white"
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </a>
  );
};
