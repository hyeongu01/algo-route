import SettingsTabs from "@/components/SettingsTabs";

export default function SettingsLayout({ children }: LayoutProps<"/settings">) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>
      <SettingsTabs />
      {children}
    </div>
  );
}
