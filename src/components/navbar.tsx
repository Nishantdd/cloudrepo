import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GlobalContext } from "@/context/GlobalContext";
import { storageClasses } from "@/types/s3";
import type { StorageClass } from "@/types/s3";
import { Moon, RefreshCcw } from "lucide-react";
import { useCallback, useContext } from "react";
import { Input } from "./ui/input";

export default function Navbar() {
  const { setThemeMode, bucketName, storageClass, setStorageClass } =
    useContext(GlobalContext);

  const onRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((themeMode) => (themeMode === "dark" ? "light" : "dark"));
  }, [setThemeMode]);

  return (
    <header className="w-full border-b bg-background">
      <nav
        className="mx-4 flex h-14 items-center justify-between px-4"
        aria-label="Main navigation"
      >
        <div className="hidden md:flex items-center gap-1">
          <img
            src="/logo.svg"
            alt="logo"
            width={24}
            height={24}
            className="rounded dark:invert"
          />
          <span className="font-medium text-foreground">cloudrepo</span>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <div className="flex rounded-md shadow-xs">
            <Input
              type="text"
              placeholder="Bucket name"
              defaultValue={bucketName}
              readOnly
              className="read-only:bg-muted -me-px rounded-e-none shadow-none focus-visible:z-1"
            />
            <Select
              defaultValue="STANDARD"
              value={storageClass}
              onValueChange={(value: string) => {
                setStorageClass(value as StorageClass);
              }}
            >
              <SelectTrigger className="w-[240px] rounded-s-none shadow-none">
                <SelectValue placeholder="Select storage class" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Storage Class</SelectLabel>
                  {storageClasses.map((sc) => (
                    <SelectItem
                      key={sc}
                      value={sc}
                      className="pr-2 [&_svg]:hidden"
                    >
                      {sc}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
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
