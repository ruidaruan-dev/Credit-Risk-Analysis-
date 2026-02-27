import React, { useState } from 'react';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import type { Company } from '../types';

interface EditableTableProps {
  companies: Company[];
  onUpdate: (company: Company) => void;
  onDelete: (id: string) => void;
}

export const EditableTable: React.FC<EditableTableProps> = ({ companies, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Company>>({});

  const handleEdit = (company: Company) => {
    setEditingId(company.id);
    setEditData(company);
  };

  const handleSave = () => {
    if (editingId && editData) {
      onUpdate({
        ...companies.find((c) => c.id === editingId)!,
        ...editData,
        updatedAt: new Date().toISOString(),
      });
      setEditingId(null);
      setEditData({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleFieldChange = (field: keyof Company, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header">
            <th className="px-4 py-3 text-left">企业名称</th>
            <th className="px-4 py-3 text-left">行业</th>
            <th className="px-4 py-3 text-right">授信额度</th>
            <th className="px-4 py-3 text-right">已用额度</th>
            <th className="px-4 py-3 text-right">账期天数</th>
            <th className="px-4 py-3 text-center">风险评分</th>
            <th className="px-4 py-3 text-center">风险等级</th>
            <th className="px-4 py-3 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="table-row">
              {editingId === company.id ? (
                <>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="input-field text-sm py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      value={editData.industry || ''}
                      onChange={(e) => handleFieldChange('industry', e.target.value)}
                      className="input-field text-sm py-1"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={editData.creditLimit || ''}
                      onChange={(e) => handleFieldChange('creditLimit', parseFloat(e.target.value))}
                      className="input-field text-sm py-1 text-right"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={editData.usedCredit || ''}
                      onChange={(e) => handleFieldChange('usedCredit', parseFloat(e.target.value))}
                      className="input-field text-sm py-1 text-right"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={editData.paymentTermDays || ''}
                      onChange={(e) => handleFieldChange('paymentTermDays', parseInt(e.target.value))}
                      className="input-field text-sm py-1 text-right"
                    />
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{editData.riskScore}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      editData.riskLevel === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                        : editData.riskLevel === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {editData.riskLevel === 'high' ? '高' : editData.riskLevel === 'medium' ? '中' : '低'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={handleSave}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors"
                        title="保存"
                      >
                        <Save size={16} className="text-green-600" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        title="取消"
                      >
                        <X size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3">{company.industry}</td>
                  <td className="px-4 py-3 text-right">{company.creditLimit}万</td>
                  <td className="px-4 py-3 text-right">{company.usedCredit}万</td>
                  <td className="px-4 py-3 text-right">{company.paymentTermDays}天</td>
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
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(company)}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => onDelete(company.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
