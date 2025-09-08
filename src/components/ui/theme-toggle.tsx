import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dropdown } from "antd"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const menu = {
    items: [
      {
        key: 'light',
        label: (
          <div className="flex items-center">
            <Sun className="h-4 w-4 mr-2" />
            Light
          </div>
        ),
        onClick: () => setTheme("light"),
        className: theme === "light" ? "bg-accent text-accent-foreground" : ""
      },
      {
        key: 'dark',
        label: (
          <div className="flex items-center">
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </div>
        ),
        onClick: () => setTheme("dark"),
        className: theme === "dark" ? "bg-accent text-accent-foreground" : ""
      }
    ]
  }

  return (
    <Dropdown menu={menu} placement="bottomRight" trigger={['click']}>
      <Button variant="ghost" size="icon" className="h-9 w-9 bg-background border border-border hover:bg-accent">
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Dropdown>
  )
}