import { RedesignPlayground } from "@/components/workspace-redesign/RedesignPlayground";

export const metadata = {
  title: "Task review redesign · A/B preview",
};

export default function RedesignPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <RedesignPlayground />
    </main>
  );
}
