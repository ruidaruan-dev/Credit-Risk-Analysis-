import React, { useRef, useState } from 'react';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { parseCSV, detectColumns, convertToCompany, generateSampleCSV } from '../lib/csvParser';
import type { Company, ImportConfig } from '../types';

interface ImportCSVProps {
  onImport: (companies: Company[]) => void;
}

export const ImportCSV: React.FC<ImportCSVProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Record<string, any>[]>([]);
  const [config, setConfig] = useState<ImportConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [importedCompanies, setImportedCompanies] = useState<Company[]>([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFile(selectedFile);
    setLoading(true);

    try {
      const parsed = await parseCSV(selectedFile);
      setData(parsed);

      // 自动检测列
      const headers = Object.keys(parsed[0] || {});
      const detected = detectColumns(headers);
      setConfig(detected as ImportConfig);

      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (field: keyof ImportConfig, value: string) => {
    setConfig((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handlePreview = () => {
    if (!config) {
      setError('请配置所有必需的字段');
      return;
    }

    const companies: Company[] = [];
    let successCount = 0;

    data.forEach((row, index) => {
      const company = convertToCompany(row, config, index);
      if (company) {
        companies.push(company);
        successCount++;
      }
    });

    if (successCount === 0) {
      setError('未能成功解析任何企业数据，请检查字段映射');
      return;
    }

    setImportedCompanies(companies);
    setStep('preview');
  };

  const handleConfirmImport = () => {
    onImport(importedCompanies);
    setStep('upload');
    setFile(null);
    setData([]);
    setConfig(null);
    setImportedCompanies([]);
  };

  const handleDownloadTemplate = () => {
    const csv = generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'company_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      {step === 'upload' && (
        <Card title="导入企业数据" subtitle="支持 CSV 和 Excel 格式">
          <div className="space-y-6">
            {/* 文件上传区 */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-12 text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
            >
              <Upload className="mx-auto mb-4 text-blue-500" size={40} />
              <p className="font-medium text-lg mb-2">拖拽文件或点击选择</p>
              <p className="text-sm text-slate-500">支持 CSV 和 Excel 文件</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {file && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ 已选择文件：{file.name}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                loading={loading}
              >
                选择文件
              </Button>
              <Button variant="secondary" onClick={handleDownloadTemplate} icon={<Download size={18} />}>
                下载模板
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'mapping' && config && (
        <Card title="字段映射" subtitle="请确认 CSV 文件的列与企业数据字段的对应关系">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="企业名称"
                value={config.nameField}
                onChange={(e) => handleConfigChange('nameField', e.target.value)}
              />
              <Input
                label="行业"
                value={config.industryField}
                onChange={(e) => handleConfigChange('industryField', e.target.value)}
              />
              <Input
                label="注册资本"
                value={config.registeredCapitalField}
                onChange={(e) => handleConfigChange('registeredCapitalField', e.target.value)}
              />
              <Input
                label="授信额度"
                value={config.creditLimitField}
                onChange={(e) => handleConfigChange('creditLimitField', e.target.value)}
              />
              <Input
                label="已用额度"
                value={config.usedCreditField}
                onChange={(e) => handleConfigChange('usedCreditField', e.target.value)}
              />
              <Input
                label="账期天数"
                value={config.paymentTermDaysField}
                onChange={(e) => handleConfigChange('paymentTermDaysField', e.target.value)}
              />
              <Input
                label="到期日期"
                value={config.dueDateField}
                onChange={(e) => handleConfigChange('dueDateField', e.target.value)}
              />
              <Input
                label="逾期次数"
                value={config.overdueCountField}
                onChange={(e) => handleConfigChange('overdueCountField', e.target.value)}
              />
              <Input
                label="最长逾期天数"
                value={config.overdueDaysField}
                onChange={(e) => handleConfigChange('overdueDaysField', e.target.value)}
              />
            </div>

            {/* 可用列列表 */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">CSV 文件中的列：</p>
              <div className="flex flex-wrap gap-2">
                {headers.map((header) => (
                  <span
                    key={header}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {header}
                  </span>
                ))}
              </div>
            </div>

            {/* 预览数据 */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-48 overflow-auto">
              <p className="text-sm font-medium mb-2">数据预览（前 3 行）：</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    {headers.slice(0, 5).map((header) => (
                      <th key={header} className="px-2 py-1 text-left">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 3).map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-200 dark:border-slate-700">
                      {headers.slice(0, 5).map((header) => (
                        <td key={header} className="px-2 py-1">{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button variant="primary" onClick={handlePreview}>
                预览导入
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep('upload');
                  setFile(null);
                  setData([]);
                  setConfig(null);
                }}
              >
                返回
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 'preview' && (
        <Card title="导入预览" subtitle={`共 ${importedCompanies.length} 家企业`}>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left">企业名称</th>
                    <th className="px-4 py-3 text-left">行业</th>
                    <th className="px-4 py-3 text-right">授信额度</th>
                    <th className="px-4 py-3 text-center">风险评分</th>
                    <th className="px-4 py-3 text-center">风险等级</th>
                  </tr>
                </thead>
                <tbody>
                  {importedCompanies.slice(0, 10).map((company) => (
                    <tr key={company.id} className="table-row">
                      <td className="px-4 py-3 font-medium">{company.name}</td>
                      <td className="px-4 py-3">{company.industry}</td>
                      <td className="px-4 py-3 text-right">{company.creditLimit}万</td>
                      <td className="px-4 py-3 text-center font-bold">{company.riskScore}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          company.riskLevel === 'high'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                            : company.riskLevel === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {company.riskLevel === 'high' ? '高' : company.riskLevel === 'medium' ? '中' : '低'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importedCompanies.length > 10 && (
              <p className="text-sm text-slate-500">
                ... 还有 {importedCompanies.length - 10} 家企业
              </p>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-4">
              <Button variant="primary" onClick={handleConfirmImport}>
                确认导入
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setStep('mapping');
                }}
              >
                返回编辑
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
