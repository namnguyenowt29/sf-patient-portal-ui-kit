import { Badge } from "@/components/ui/badge";
import { ProfileDetail } from "./components/ProfileDetail";

export default function Profile() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-12 md:px-4 lg:px-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profile</h2>
        <Badge className="bg-gray-400">Patient ID: 213xzs13221</Badge>
      </div>

      <ProfileDetail />
    </section>
  );
}
