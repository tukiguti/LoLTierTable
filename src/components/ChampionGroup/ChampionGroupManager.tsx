import React, { useState } from 'react';
import type { Champion } from '../../types/champion';
import type { ChampionGroupData, ChampionGroup } from '../../types/championGroup';

interface ChampionGroupManagerProps {
  champions: Champion[];
  onImportToStaging: (champions: Champion[]) => void;
  currentStagingChampions: Champion[];
  currentMode: 'tierlist' | 'matrix' | 'scatter';
}

export const ChampionGroupManager: React.FC<ChampionGroupManagerProps> = ({
  champions,
  onImportToStaging,
  currentStagingChampions,
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [exportName, setExportName] = useState('');
  const [exportDescription, setExportDescription] = useState('');

  // JSONサンプルフォーマット
  const sampleJson = {
    groups: [
      {
        name: "ADCチャンピオン",
        description: "ボットレーンADC向けチャンピオン",
        champions: ["Jinx", "Caitlyn", "Ezreal", "Ashe", "Vayne"],
        version: "14.1"
      },
      {
        name: "メイジ",
        description: "ミッドレーンメイジチャンピオン", 
        champions: ["Orianna", "Syndra", "Azir", "Viktor"],
        version: "14.1"
      }
    ],
    metadata: {
      createdAt: "2024-01-15T10:30:00Z",
      appVersion: "1.0.0",
      totalChampions: 9
    }
  };

  const handleImport = () => {
    try {
      setImportError(null);
      const data: ChampionGroupData = JSON.parse(jsonInput);
      
      if (!data.groups || !Array.isArray(data.groups)) {
        throw new Error('JSONフォーマットが正しくありません。groupsプロパティが必要です。');
      }

      // チャンピオン名をChampionオブジェクトに変換
      const resolvedChampions: Champion[] = [];
      
      for (const group of data.groups) {
        for (const championNameOrId of group.champions) {
          const champion = champions.find(c => 
            c.id === championNameOrId || 
            c.name === championNameOrId ||
            c.id.toLowerCase() === championNameOrId.toLowerCase() ||
            c.name.toLowerCase() === championNameOrId.toLowerCase()
          );
          
          if (champion && !resolvedChampions.find(c => c.id === champion.id)) {
            resolvedChampions.push(champion);
          }
        }
      }

      if (resolvedChampions.length === 0) {
        throw new Error('有効なチャンピオンが見つかりませんでした。チャンピオン名またはIDを確認してください。');
      }

      onImportToStaging(resolvedChampions);
      setJsonInput('');
      alert(`${resolvedChampions.length}体のチャンピオンを一時保存エリアに追加しました！`);
      
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'JSONの解析に失敗しました');
    }
  };

  const handleExport = () => {
    if (!exportName.trim()) {
      alert('グループ名を入力してください');
      return;
    }

    const championGroup: ChampionGroup = {
      name: exportName.trim(),
      description: exportDescription.trim() || undefined,
      champions: currentStagingChampions.map(c => c.id),
      createdAt: new Date().toISOString(),
      version: "14.1"
    };

    const exportData: ChampionGroupData = {
      groups: [championGroup],
      metadata: {
        createdAt: new Date().toISOString(),
        appVersion: "1.0.0",
        totalChampions: currentStagingChampions.length
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportName.replace(/[^a-zA-Z0-9]/g, '_')}_champions.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportName('');
    setExportDescription('');
    alert('JSONファイルをダウンロードしました！');
  };

  const loadSampleJson = () => {
    setJsonInput(JSON.stringify(sampleJson, null, 2));
    setImportError(null);
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setImportError('JSONファイルを選択してください');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setJsonInput(content);
        setImportError(null);
        
        // Auto-import the file content
        const data = JSON.parse(content) as ChampionGroupData;
        const allChampionIds = data.groups.flatMap(group => group.champions);
        const resolvedChampions = allChampionIds
          .map(id => champions.find(c => c.id === id || c.name === id))
          .filter((c): c is Champion => c !== undefined);

        if (resolvedChampions.length === 0) {
          setImportError('有効なチャンピオンが見つかりませんでした');
          return;
        }

        onImportToStaging(resolvedChampions);
        alert(`ファイルから${resolvedChampions.length}体のチャンピオンを読み込みました！`);
        
      } catch (error) {
        setImportError('ファイルの読み込みに失敗しました。有効なJSONファイルを選択してください。');
      }
    };
    
    reader.onerror = () => {
      setImportError('ファイルの読み込み中にエラーが発生しました');
    };
    
    reader.readAsText(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    processFile(file);
    
    // Reset file input
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">チャンピオングループ管理</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              activeTab === 'import'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            インポート
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
              activeTab === 'export'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            エクスポート
          </button>
        </div>
      </div>

      {activeTab === 'import' && (
        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              JSONファイルから読み込み
            </label>
            <div className="flex items-center justify-center w-full">
              <label 
                className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <svg className="w-6 h-6 mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold">クリックしてファイル選択</span> または ドラッグ&ドロップ
                  </p>
                  <p className="text-xs text-gray-400">JSON形式のファイルのみ</p>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Manual Text Input Section */}
          <div className="border-t pt-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  または、JSONテキストを直接ペースト
                </label>
                <button
                  onClick={loadSampleJson}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  サンプルを読み込み
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSONファイルの内容をここにペーストしてください..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {importError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{importError}</p>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={!jsonInput.trim()}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            テキストからインポート
          </button>

          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">JSONフォーマット例:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "groups": [
    {
      "name": "グループ名",
      "description": "説明（オプション）",
      "champions": ["Jinx", "Caitlyn", "Ezreal"],
      "version": "14.1"
    }
  ]
}`}
            </pre>
          </div>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              グループ名 *
            </label>
            <input
              type="text"
              value={exportName}
              onChange={(e) => setExportName(e.target.value)}
              placeholder="例: ADCチャンピオン"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              説明（オプション）
            </label>
            <textarea
              value={exportDescription}
              onChange={(e) => setExportDescription(e.target.value)}
              placeholder="例: ボットレーンADC向けチャンピオン"
              className="w-full h-20 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              現在の一時保存エリア: {currentStagingChampions.length}体のチャンピオン
            </p>
            {currentStagingChampions.length > 0 && (
              <div className="mt-2 text-xs text-blue-600">
                {currentStagingChampions.map(c => c.name).join(', ')}
              </div>
            )}
          </div>

          <button
            onClick={handleExport}
            disabled={!exportName.trim() || currentStagingChampions.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            JSONファイルとしてダウンロード
          </button>
        </div>
      )}
    </div>
  );
};