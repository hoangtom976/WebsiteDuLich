import * as React from "react"

export default function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  iconColor = "text-amber-500",
  iconBg = "bg-amber-100",
  centered = false
}) {
  return (
    <div className={`mb-4 ${centered ? "text-center" : "text-left"}`}>
      {badgeText && (
        <span className={`inline-block mb-1 text-[10px] font-black uppercase tracking-[0.2em] ${iconColor} opacity-80`}>
          {badgeText}
        </span>
      )}

      <div className={`flex items-center gap-3 ${centered ? "justify-center" : "justify-start"}`}>
        {Icon && (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBg} shadow-sm ring-1 ring-amber-200/50 transition-transform hover:rotate-6`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        )}
        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
          {title}
        </h2>
      </div>

      {subtitle && (
        <p className={`mt-2 max-w-3xl text-sm text-slate-500 leading-relaxed ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
