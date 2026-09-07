import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 24 }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 16px', gap: '10px' }}>
      <Loader2 size={size} className="spinner" color="var(--primary)" />
      {text && <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
