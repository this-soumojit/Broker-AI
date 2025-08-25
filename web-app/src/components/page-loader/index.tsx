import { Loader2 } from "lucide-react";

function PageLoader({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="flex h-screen w-screen items-center justify-center fixed top-0 left-0 z-800 backdrop-blur-sm">
      <Loader2 className="h-14 w-14 animate-spin" />
    </div>
  );
}

export default PageLoader;
