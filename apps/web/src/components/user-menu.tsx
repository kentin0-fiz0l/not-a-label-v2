"use client"

import { signOut } from "next-auth/react"
import { User, Settings, HelpCircle, LogOut, Music, Sparkles } from "lucide-react"
import Link from "next/link"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface UserMenuProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.name || "Artist"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/music">
              <Music className="mr-2 h-4 w-4" />
              <span>My Music</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/ai">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>AI Assistant</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                New
              </Badge>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Help & Support</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}