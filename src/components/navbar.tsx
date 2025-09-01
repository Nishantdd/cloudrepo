import { Button } from "@/components/ui/button";
import { Moon, RefreshCcw } from "lucide-react";
import { useCallback } from "react";

type NavbarProps = {
  bucketName?: string;
};

export default function Navbar({
  bucketName = "No bucket found",
}: NavbarProps) {
  const onRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const toggleTheme = useCallback(() => {
    document.body.classList.toggle("dark");
  }, []);

  return (
    <header className="w-full border-b bg-background">
      <nav
        className="mx-4 flex h-14 items-center justify-between px-4"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-1">
          <img
            src="/logo.svg"
            alt="logo"
            width={24}
            height={24}
            className="rounded dark:invert"
          />
          <span className="font-medium text-foreground">cloudrepo</span>
        </div>

        <div className="flex-1 px-4">
          <p className="text-center text-sm text-muted-foreground">
            {bucketName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Refresh page"
            onClick={onRefresh}
          >
            <RefreshCcw className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Change theme"
            onClick={toggleTheme}
          >
            <Moon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Dark</span>
          </Button>
        </div>
      </nav>
    </header>
  );
}
