import { SettingsClient } from "@/components/SettingsClient";

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-base)] comfy-grid">
      <header className="flex h-14 shrink-0 items-center border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/90 px-4 backdrop-blur-md">
        <span className="text-sm font-semibold text-zinc-100">Algo Todo</span>
        <span className="ml-2 text-xs text-zinc-600">设置</span>
      </header>
      <main className="flex flex-1 flex-col py-6">
        <SettingsClient />
      </main>
    </div>
  );
}
