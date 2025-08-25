import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CountdownButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  countdownSeconds?: number;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children: React.ReactNode;
  warningMessage?: string;
}

const CountdownButton = ({
  onConfirm,
  disabled = false,
  countdownSeconds = 5,
  variant = "destructive",
  children,
  warningMessage = "This action cannot be undone.",
}: CountdownButtonProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    // Remove the auto-reset when countdown reaches 0
    // Let the user manually click confirm or cancel

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleFirstClick = () => {
    if (disabled) return;
    setIsClicked(true);
    setCountdown(countdownSeconds);
  };

  const handleConfirm = () => {
    if (disabled) return;
    onConfirm();
    setCountdown(null);
    setIsClicked(false);
  };

  if (!isClicked) {
    return (
      <Button
        variant={variant}
        onClick={handleFirstClick}
        disabled={disabled}
        size="default"
      >
        {children}
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs">{warningMessage}</p>
      </div>

      <Button
        variant={variant}
        onClick={handleConfirm}
        disabled={disabled || (countdown !== null && countdown > 0)}
        size="default"
      >
        {countdown !== null && countdown > 0
          ? `Confirm in ${countdown}s`
          : "Click to Confirm"}
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          setIsClicked(false);
          setCountdown(null);
        }}
        size="sm"
      >
        Cancel
      </Button>
    </div>
  );
};

export default CountdownButton;
