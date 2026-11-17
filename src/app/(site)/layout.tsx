import Nav from "@/components/Nav";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      <main className="w-full px-4 py-6 md:px-8">{children}</main>
    </>
  );
}
