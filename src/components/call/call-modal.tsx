import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff } from "lucide-react";

interface CallModalProps {
  isOpen: boolean;
  callerName: string;
  onAccept: () => void;
  onReject: () => void;
}

export function CallModal({
  isOpen,
  callerName,
  onAccept,
  onReject,
}: CallModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cuộc gọi đến</DialogTitle>
          <DialogDescription>{callerName} đang gọi cho bạn</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-6">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
        </div>
        <DialogFooter className="flex justify-center gap-4 sm:justify-center">
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={onReject}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-full w-12 h-12"
            onClick={onAccept}
          >
            <Phone className="h-6 w-6" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
