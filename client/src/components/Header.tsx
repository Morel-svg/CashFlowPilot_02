import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, Plus, Sun, Moon } from "lucide-react";

interface HeaderProps {
  onAddTransaction?: () => void;
  onToggleMenu?: () => void;
}

export default function Header({ onAddTransaction, onToggleMenu }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    console.log('Theme toggled:', !isDark ? 'dark' : 'light');
  };

  return (
    <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button 
          size="icon" 
          variant="ghost" 
          className="lg:hidden"
          onClick={onToggleMenu}
          data-testid="button-menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-black rounded-md flex items-center justify-center">
            <span className="text-white font-semibold text-sm">NG</span>
          </div>
          <h1 className="font-semibold text-lg text-foreground">New Gym</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="hidden sm:inline-flex" data-testid="text-status">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Synced
        </Badge>
        
        <Button
          size="sm"
          onClick={onAddTransaction}
          className="gap-2"
          data-testid="button-add-transaction"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Income</span>
        </Button>
        
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}