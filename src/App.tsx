import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Tabs } from './components/ui/Tabs';
import { ImportCSV } from './components/ImportCSV';
import { EditableTable } from './components/EditableTable';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trash2 } from 'lucide-react';
import type { Company, DashboardStats } from './types';
import { calculateDashboardStats, calculateRiskDimensions, calculateRiskScore, getRiskLevel } from './lib/riskEngine';

function App() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // 从 localStorage 加载数据
    const saved = localStorage.getItem('companies');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompanies(parsed);
        setStats(calculateDashboardStats(parsed));
      } catch (error) {
        console.error('Failed to load companies:', error);
      }
    }
  }, []);

  useEffect(() => {
    // 保存数据到 localStorage
    localStorage.setItem('companies', JSON.stringify(companies));
    setStats(calculateDashboardStats(companies));
  }, [companies]);

  const handleImport = (newCompanies: Company[]) => {
    setCompanies((prev) => [...prev, ...newCompanies]);
    setActiveTab('companies');
  };

  const handleUpdateCompany = (company: Company) => {
    // 重新计算风险评分
    const dimensions = calculateRiskDimensions(company);
    const riskScore = calculateRiskScore(dimensions);
    const riskLevel = getRiskLevel(riskScore);

    const updated = {
      ...company,
      riskScore,
      riskLevel,
    };

    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? updated : c))
    );
  };

  const handleDeleteCompany = (id: string) => {
    if (confirm('确定要删除此企业吗？')) {
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可撤销。')) {
      setCompanies([]);
    }
  };

  const riskDistribution = stats ? [
    { name: '低风险', value: stats.lowRiskCount, fill: '#10b981' },
    { name: '中风险', value: stats.mediumRiskCount, fill: '#f59e0b' },
    { name: '高风险', value: stats.highRiskCount, fill: '#ef4444' },
  ] : [];

  const industryData = companies.reduce((acc, company) => {
    const existing = acc.find(item => item.industry === company.industry);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ industry: company.industry, count: 1 });
    }
    return acc;
  }, [] as Array<{ industry: string; count: number }>);

  const tabs = [
    {
      id: 'dashboard',
      label: '仪表盘',
      icon: '📊',
      content: (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="企业总数"
              value={stats?.totalCompanies || 0}
              trend="+12%"
              color="blue"
            />
            <StatCard
              title="高风险"
              value={stats?.highRiskCount || 0}
              trend={`${stats && stats.totalCompanies > 0 ? Math.round((stats.highRiskCount / stats.totalCompanies) * 100) : 0}%`}
              color="red"
            />
            <StatCard
              title="总授信额度"
              value={`${((stats?.totalCreditLimit || 0) / 10000).toFixed(1)}亿`}
              trend="万元"
              color="green"
            />
            <StatCard
              title="平均风险评分"
              value={stats?.averageRiskScore || 0}
              trend="/100"
              color="orange"
            />
          </div>

          {/* 图表 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 风险分布 */}
            <Card title="风险等级分布" subtitle="按风险等级统计企业数量">
              {riskDistribution.length > 0 && stats && stats.totalCompanies > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-500">
                  暂无数据，请先导入企业数据
                </div>
              )}
            </Card>

            {/* 行业分布 */}
            <Card title="行业分布" subtitle="按行业统计企业数量">
              {industryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="industry" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-500">
                  暂无数据
                </div>
              )}
            </Card>
          </div>

          {/* 授信使用率 */}
          <Card title="授信使用情况">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">总体使用率</span>
                  <span className="text-sm font-bold text-blue-600">
                    {stats && stats.totalCreditLimit > 0
                      ? Math.round((stats.totalUsedCredit / stats.totalCreditLimit) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                    style={{
                      width: stats && stats.totalCreditLimit > 0
                        ? `${Math.min((stats.totalUsedCredit / stats.totalCreditLimit) * 100, 100)}%`
                        : '0%',
                    }}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400">已用额度</p>
                  <p className="text-lg font-bold">{stats?.totalUsedCredit || 0}万</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400">总授信额度</p>
                  <p className="text-lg font-bold">{stats?.totalCreditLimit || 0}万</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      id: 'companies',
      label: '企业管理',
      icon: '🏢',
      content: (
        <Card title="企业列表" subtitle={`共 ${companies.length} 家企业`}>
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">暂无企业数据</p>
              <Button variant="primary" onClick={() => setActiveTab('import')}>
                导入数据
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  点击编辑按钮可修改企业信息，修改后风险评分将自动重新计算
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  icon={<Trash2 size={16} />}
                >
                  清空所有
                </Button>
              </div>
              <EditableTable
                companies={companies}
                onUpdate={handleUpdateCompany}
                onDelete={handleDeleteCompany}
              />
            </div>
          )}
        </Card>
      ),
    },
    {
      id: 'import',
      label: '数据导入',
      icon: '📤',
      content: <ImportCSV onImport={handleImport} />,
    },
  ];

  return (
    <Layout title="企业信用风险分析">
      <Tabs items={tabs} defaultTab="dashboard" onChange={setActiveTab} />
    </Layout>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  trend: string;
  color: 'blue' | 'red' | 'green' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, color }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    red: 'from-red-500 to-red-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 rounded-full -mr-12 -mt-12`}></div>
      <div className="relative z-10">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{trend}</p>
      </div>
    </Card>
  );
};

export default App;
