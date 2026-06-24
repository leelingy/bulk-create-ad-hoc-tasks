import { MeetingV2Playground } from "@/components/meeting-modal-v2/MeetingV2Playground";

export const metadata = {
  title: "Meeting Modal V2 · preview",
};

export default function MeetingPage() {
  return (
    <main className="min-h-screen bg-[#f4f5f7]">
      <MeetingV2Playground />
    </main>
  );
}
