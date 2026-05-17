export function Footer() {
  return (
    <footer className="py-12 border-t border-[var(--border)]/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-[var(--muted)] text-center">
            Made with 🔥 by <span className="font-semibold text-[var(--text)]">Piyush Yadav</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Open Source
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full"></span>
              No Tracking
            </span>
            <span className="text-[var(--border)]">•</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              No Accounts
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
