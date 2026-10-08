import type { ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react'

export function Button({ className = '', variant = 'primary', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' | 'danger' }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
  const variants = {
    primary: 'bg-[#d65a45] text-white shadow-sm hover:bg-[#c84d38]',
    soft: 'bg-[#fce9e4] text-[#a94433] hover:bg-[#f8ddd5]',
    ghost: 'bg-white text-[#5e5148] border border-[#eadfd4] hover:bg-[#fff5ef]',
    danger: 'bg-[#fff0ef] text-[#c63f36] border border-[#ffd6d1] hover:bg-[#ffe6e3]',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d65a45] focus:ring-4 focus:ring-[#d65a45]/10 ${props.className ?? ''}`} />
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-2xl border border-[#e6d9cf] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#d65a45] focus:ring-4 focus:ring-[#d65a45]/10 ${props.className ?? ''}`} />
}

export function Modal({ title, children, onClose, footer }: { title: string; children: ReactNode; onClose: () => void; footer?: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center modal-backdrop sm:items-center p-0 sm:p-6" onMouseDown={onClose}>
      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-[#fffdfb] shadow-2xl sm:rounded-3xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#eadfd4] px-5 py-4">
          <h2 className="text-lg font-bold text-[#3b302a]">{title}</h2>
          <button aria-label="닫기" onClick={onClose} className="rounded-full p-2 text-xl text-[#8b7d73] hover:bg-[#f8eee8]">×</button>
        </div>
        <div className="pretty-scroll flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-[#eadfd4] bg-[#fffaf5] px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
