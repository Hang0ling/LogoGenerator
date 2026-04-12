import React, { useState, useEffect, useCallback } from 'react';
import { generateLogoFromGemini } from './services/geminiService';
import { processImage, convertToSvgWrapper, downloadFile } from './utils/imageProcessor';
import { Button } from './components/Button';
import { GenerationStatus, LogoGenerationRequest } from './types';

// Icons
const RefreshIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const WandIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;

const STYLE_OPTIONS = [
  "Minimalist Geometry (极简几何)",
  "Abstract Tech (抽象科技)",
  "Lettermark / Typography (字母文字)",
  "Organic / Nature (自然有机)",
  "Cyberpunk / Neon (赛博朋克)",
  "Corporate / Professional (商务专业)"
];

const COLOR_OPTIONS = [
  "Blue & White (科技蓝白)",
  "Purple & Pink (活力紫粉)",
  "Black & White (经典黑白)",
  "Orange & Dark (动感橙黑)",
  "Green & White (清新绿白)",
  "Gold & Navy (高端金蓝)"
];

export default function App() {
  const [formData, setFormData] = useState<LogoGenerationRequest>({
    name: '',
    style: STYLE_OPTIONS[0],
    colorScheme: COLOR_OPTIONS[0]
  });

  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [rawImageBase64, setRawImageBase64] = useState<string | null>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Generate Logo Function
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setStatus(GenerationStatus.GENERATING);
    setErrorMsg('');
    setRemoveBg(false); // Reset toggle on new generation

    try {
      const base64Data = await generateLogoFromGemini(formData);
      // Prepend header if missing
      const fullBase64 = `data:image/png;base64,${base64Data}`;
      setRawImageBase64(fullBase64);
      setDisplayImage(fullBase64);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate logo. Please try again.");
      setStatus(GenerationStatus.ERROR);
    }
  };

  // Process Image Effect (Runs when raw image or removeBg option changes)
  useEffect(() => {
    const updatePreview = async () => {
      if (!rawImageBase64) return;
      
      try {
        // We always process at 512px for the preview
        const processed = await processImage(rawImageBase64, removeBg, 512);
        setDisplayImage(processed);
      } catch (err) {
        console.error("Processing error", err);
      }
    };

    updatePreview();
  }, [rawImageBase64, removeBg]);

  // Download Handler
  const handleDownload = async (size: number, format: 'png' | 'svg') => {
    if (!rawImageBase64) return;

    try {
      // 1. Process image to correct size and transparency
      const processedBase64 = await processImage(rawImageBase64, removeBg, size);
      
      const fileName = `logo-${formData.name.toLowerCase().replace(/\s+/g, '-')}-${size}x${size}.${format}`;

      if (format === 'svg') {
        // For SVG, we wrap the processed PNG
        const svgContent = convertToSvgWrapper(processedBase64, size);
        downloadFile(svgContent, fileName, 'svg');
      } else {
        // For PNG, processedBase64 is already the data URL
        downloadFile(processedBase64, fileName, 'png');
      }

    } catch (err) {
      console.error("Download processing failed", err);
      alert("Failed to process image for download.");
    }
  };

  return (
    <div className="min-h-screen bg-dark text-gray-100 p-6 md:p-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Column: Controls */}
        <div className="space-y-8">
          <header>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
              LogoGen AI
            </h1>
            <p className="text-gray-400 text-lg">
              输入名称，AI 自动为您打造专属品牌 Logo。
            </p>
          </header>

          <form onSubmit={handleGenerate} className="space-y-6 bg-card p-6 rounded-2xl border border-gray-800 shadow-xl">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">网站/品牌名称</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="例如: TechNova"
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">设计风格</label>
              <select
                name="style"
                value={formData.style}
                onChange={handleInputChange}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {STYLE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">配色方案</label>
              <select
                name="colorScheme"
                value={formData.colorScheme}
                onChange={handleInputChange}
                className="w-full bg-dark border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
              >
                {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <Button 
              type="submit" 
              className="w-full py-4 text-lg font-semibold tracking-wide"
              isLoading={status === GenerationStatus.GENERATING}
            >
              {status === GenerationStatus.GENERATING ? '正在构思与绘制...' : '开始生成 Logo'}
            </Button>
            
            {errorMsg && (
              <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}
          </form>
        </div>

        {/* Right Column: Preview & Export */}
        <div className="flex flex-col h-full space-y-8">
          <div className="flex-grow flex items-center justify-center bg-card rounded-2xl border border-gray-800 shadow-xl p-8 relative overflow-hidden min-h-[400px]">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            {status === GenerationStatus.IDLE && (
              <div className="text-center text-gray-500">
                <div className="w-24 h-24 mx-auto mb-4 border-4 border-dashed border-gray-700 rounded-xl flex items-center justify-center">
                  <span className="text-4xl">?</span>
                </div>
                <p>等待生成...</p>
              </div>
            )}

            {status === GenerationStatus.GENERATING && (
              <div className="text-center space-y-4 z-10">
                <div className="relative w-32 h-32 mx-auto">
                  <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <p className="text-indigo-400 animate-pulse">AI 正在绘图中...</p>
              </div>
            )}

            {(status === GenerationStatus.SUCCESS || status === GenerationStatus.PROCESSING) && displayImage && (
               <div className="relative z-10 group">
                  <div className={`transition-all duration-500 ${status === GenerationStatus.PROCESSING ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                    <img 
                      src={displayImage} 
                      alt="Generated Logo" 
                      className="max-w-full max-h-[400px] rounded-lg shadow-2xl mx-auto"
                      style={removeBg ? { backgroundImage: 'linear-gradient(45deg, #2a2a2a 25%, transparent 25%), linear-gradient(-45deg, #2a2a2a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #2a2a2a 75%), linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px' } : {}}
                    />
                  </div>
               </div>
            )}
          </div>

          {/* Export Controls */}
          {status === GenerationStatus.SUCCESS && (
            <div className="bg-card rounded-2xl border border-gray-800 p-6 space-y-6 animate-fade-in-up">
              
              {/* Magic Wand Toggle */}
              <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <WandIcon />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">智能抠图</span>
                    <span className="text-xs text-gray-400">移除背景白色像素</span>
                  </div>
                </div>
                <button 
                  onClick={() => setRemoveBg(!removeBg)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${removeBg ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${removeBg ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Download Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* PNG Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">常用尺寸 (PNG)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleDownload(512, 'png')} className="text-xs col-span-2">
                      <DownloadIcon /><span className="ml-2">512px (原图)</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(48, 'png')} className="text-xs">
                      <DownloadIcon /><span className="ml-2">48x48</span>
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(24, 'png')} className="text-xs">
                      <DownloadIcon /><span className="ml-2">24x24</span>
                    </Button>
                  </div>
                </div>

                {/* SVG Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">矢量格式 (SVG)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" onClick={() => handleDownload(512, 'svg')} className="text-xs col-span-2">
                       <DownloadIcon /><span className="ml-2">512px SVG</span>
                    </Button>
                    <Button variant="secondary" onClick={() => handleDownload(48, 'svg')} className="text-xs">
                       <DownloadIcon /><span className="ml-2">48x48 SVG</span>
                    </Button>
                    <Button variant="secondary" onClick={() => handleDownload(24, 'svg')} className="text-xs">
                       <DownloadIcon /><span className="ml-2">24x24 SVG</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-500 text-center mt-2">
                    SVG 包含嵌入的高清位图
                  </p>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}