import Spinner from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-24" aria-busy="true">
      <Spinner className="h-6 w-6" label="Loading page" />
    </div>
  );
}
