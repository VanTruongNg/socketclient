import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

interface CallButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CallButton({ onClick, disabled }: CallButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      className="relative z-[101] hover:bg-muted"
    >
      <Video className="h-5 w-5" />
    </Button>
  );
}
