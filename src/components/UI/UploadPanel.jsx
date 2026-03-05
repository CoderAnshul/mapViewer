import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import usePlotStore from '../../store/plotStore';
import { parseDXF } from '../../utils/dxfParser';

export default function UploadPanel() {
  const setShowUpload = usePlotStore((s) => s.setShowUpload);
  const setPlots = usePlotStore((s) => s.setPlots);
  const setIsLoading = usePlotStore((s) => s.setIsLoading);

  const [status, setStatus] = useState('idle'); // idle | parsing | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [fileName, setFileName] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    setFileName(file.name);
    setStatus('parsing');
    setIsLoading(true);

    try {
      const text = await file.text();
      const result = await parseDXF(text);
      const plots = result.plots || [];
      if (!plots.length) throw new Error('No plot entities found in file');
      setPlots(plots);
      setStatus('success');
      setTimeout(() => {
        setShowUpload(false);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to parse file');
      setIsLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/dxf': ['.dxf'],
      'image/svg+xml': ['.svg'],
      'text/plain': ['.dxf', '.txt'],
    },
    multiple: false,
  });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass rounded-3xl p-8 w-full max-w-md mx-4 shadow-2xl fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Upload CAD File
            </h2>
            <p className="text-white/40 text-sm mt-0.5">DXF format supported</p>
          </div>
          <button
            onClick={() => setShowUpload(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X size={16} className="text-white/60" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          {...getRootProps()}
          className={`upload-zone p-8 text-center cursor-pointer mb-4 ${isDragActive ? 'drag-over' : ''}`}
        >
          <input {...getInputProps()} />

          {status === 'idle' && (
            <>
              <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(96,186,255,0.1)', border: '1px solid rgba(96,186,255,0.3)' }}>
                <Upload size={22} className="text-[#60BAFF]" />
              </div>
              <p className="text-white/70 font-medium mb-1">
                {isDragActive ? 'Drop your DXF file here' : 'Drag & drop your DXF file'}
              </p>
              <p className="text-white/30 text-sm">or click to browse</p>
              <p className="text-white/20 text-xs mt-3">Supports: .dxf, .svg</p>
            </>
          )}

          {status === 'parsing' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#60BAFF] border-t-transparent rounded-full spinner" />
              <p className="text-white/70">Parsing {fileName}…</p>
              <p className="text-white/30 text-sm">Extracting plot boundaries</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle size={24} className="text-green-400" />
              </div>
              <p className="text-green-400 font-medium">Plots loaded successfully!</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-400" />
              </div>
              <p className="text-red-400 font-medium">Parse failed</p>
              <p className="text-white/30 text-xs">{errorMsg}</p>
              <button
                className="text-[#60BAFF] text-sm underline mt-1"
                onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 glass-light rounded-xl p-3">
          <FileText size={15} className="text-[#60BAFF] flex-shrink-0 mt-0.5" />
          <p className="text-white/40 text-xs leading-relaxed">
            Upload a DXF CAD file exported from AutoCAD or similar software.
            Plot polygons (LWPOLYLINE entities) will be automatically detected and imported as interactive 3D tiles.
          </p>
        </div>
      </div>
    </div>
  );
}
