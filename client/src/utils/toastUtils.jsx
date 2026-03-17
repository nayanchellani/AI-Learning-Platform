import toast from 'react-hot-toast';
import './toastUtils.css';

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const customToast = {
  success: (message) => {
    toast.custom((t) => (
      <div className={`custom-toast custom-toast-success ${t.visible ? 'enter' : 'leave'}`}>
        <span className="toast-icon"><CheckIcon /></span>
        <span className="toast-message">{message}</span>
      </div>
    ), { duration: 3000 });
  },

  error: (message) => {
    toast.custom((t) => (
      <div className={`custom-toast custom-toast-error ${t.visible ? 'enter' : 'leave'}`}>
        <span className="toast-icon"><ErrorIcon /></span>
        <span className="toast-message">{message}</span>
      </div>
    ), { duration: 4000 });
  },

  action: (message, onReset, onSave) => {
    toast.custom((t) => (
      <div className={`custom-toast custom-toast-warning ${t.visible ? 'enter' : 'leave'}`}>
        <span className="toast-icon"><InfoIcon /></span>
        <span className="toast-message">{message}</span>
        <div className="toast-actions">
          {onReset && (
            <button 
              className="toast-btn toast-btn-plain" 
              onClick={() => { onReset(); toast.dismiss(t.id); }}
            >
              Reset
            </button>
          )}
          {onSave && (
            <button 
              className="toast-btn toast-btn-primary" 
              onClick={() => { onSave(); toast.dismiss(t.id); }}
            >
              Save
            </button>
          )}
        </div>
      </div>
    ), { duration: Infinity });
  }
};
