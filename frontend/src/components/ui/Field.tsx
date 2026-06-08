import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface BaseProps {
  label?: string;
  error?: string;
}

export function Field({
  label,
  error,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <input className="input" {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function TextareaField({
  label,
  error,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <textarea className="textarea" rows={4} {...rest} />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      <select className="select" {...rest}>
        {children}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
