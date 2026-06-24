import { redirect } from "next/navigation";

/** Demo entry point — deploy only needs the meeting flow at /meeting. */
export default function Home() {
  redirect("/meeting");
}
