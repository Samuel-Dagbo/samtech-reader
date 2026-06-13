"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Type, Sun, Moon, Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";

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
      <PopoverContent className="w-72 p-4" align="end">
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Text size</Label>
              <span className="text-xs font-mono text-muted-foreground">{fontSize}px</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0"
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
                className="h-7 w-7 shrink-0"
                onClick={() => setFontSize(Math.min(28, fontSize + 1))}
                disabled={fontSize >= 28}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                {resolvedTheme === "dark" ? "Dark" : "Light"} mode
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="gap-2 h-8"
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
