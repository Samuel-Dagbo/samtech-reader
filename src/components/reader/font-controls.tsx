"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Type, Sun, Moon, Minus, Plus, Settings2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";

interface FontControlsProps {
  fontSize: number;
  setFontSize: (size: number) => void;
}

export function FontControls({ fontSize, setFontSize }: FontControlsProps) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Reading settings">
          <Type className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5" align="end">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Reading settings</h3>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Text size</Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {fontSize}px
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setFontSize(Math.max(14, fontSize - 1))}
                disabled={fontSize <= 14}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Slider
                value={[fontSize]}
                onValueChange={([v]) => setFontSize(v)}
                min={14}
                max={28}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                disabled={fontSize >= 28}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Currently {resolvedTheme === "dark" ? "dark" : "light"} mode
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="gap-2 h-9"
            >
              {resolvedTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {resolvedTheme === "dark" ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
