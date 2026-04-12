import React, { useCallback, useRef, useState } from 'react';

interface UploadZoneProps {
  onFile: (file: File) => void;
}

const ACCEPTED = ['.pdf', '.docx', '.doc', '.txt'];

const UploadZone: React.FC<UploadZoneProps> = ({ onFile }) => {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError(`Unsupported format. Please upload ${ACCEPTED.join(', ')}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max size is 10 MB.');
      return;
    }
    setError('');
    onFile(file);
  }, [onFile]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section className="upload-section">
      <div
        id="upload-zone"
        className={`upload-zone${dragging ? ' dragging' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload resume"
      >
        <input
          ref={inputRef}
          id="resume-file-input"
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          style={{ display: 'none' }}
          onChange={onInputChange}
        />

        <div className="upload-icon">📄</div>
        <h2>Drop your resume here</h2>
        <p>Drag & drop your resume file or click to browse from your computer</p>

        <div className="upload-formats">
          {ACCEPTED.map(f => (
            <span key={f} className="fmt-badge">{f.toUpperCase()}</span>
          ))}
          <span className="fmt-badge">MAX 10 MB</span>
        </div>

        <button id="upload-btn" className="btn-upload" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}>
          <span>📎</span> Choose File
        </button>

        {error && (
          <p style={{ color: 'var(--rose)', fontSize: '.85rem', marginTop: 14 }}>
            ⚠️ {error}
          </p>
        )}
      </div>
    </section>
  );
};

export default UploadZone;
