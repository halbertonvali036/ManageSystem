import { GraduationCap } from 'lucide-react'

function BrandLogo({ size = 32, className = '' }) {
  return (
    <span
      className={`brand-logo${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <GraduationCap size={Math.round(size * 0.56)} strokeWidth={2.2} />
    </span>
  )
}

export default BrandLogo