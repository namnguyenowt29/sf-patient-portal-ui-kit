import { useState } from "react";
import { useNavigate } from "react-router";
import { SearchBar } from "../features/object-search/components/SearchBar";
import { Button } from "../components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Dialog,
} from "@/components/ui";

export default function HomePage() {
  const navigate = useNavigate();
  const [text, setText] = useState("");

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = text ? `?q=${encodeURIComponent(text)}` : "";
    navigate(`/accounts${params}`);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-6">
        <h1 className="text-2xl font-bold">Account Search</h1>
        <Button variant="outline" size="sm" onClick={() => navigate("/accounts")}>
          Browse All Accounts
        </Button>
        <Button variant="secondary">Book appointment</Button>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <SearchBar placeholder="Search by name, phone, or industry..." value={text} handleChange={setText} />
        <Button type="submit">Search</Button>
      </form>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Open dialog
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Example dialog</DialogTitle>
            <DialogDescription>A simple dialog you can use to experiment with this UI component.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
