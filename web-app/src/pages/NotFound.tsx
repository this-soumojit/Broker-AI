import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function NotFound() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const onNavigate = () => {
    if (user) {
      navigate(`/${user.id}/dashboard`);
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <div className="space-y-6 max-w-md">
        <h1 className="text-9xl font-extrabold text-primary">404</h1>
        <h2 className="text-3xl font-bold tracking-tight">Page not found</h2>
        <p className="text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. The page might
          have been removed or the URL might be incorrect.
        </p>
        <div className="flex justify-center">
          <Button onClick={onNavigate} className="mt-4">
            Go back home
          </Button>
        </div>
      </div>
    </div>
  );
}
