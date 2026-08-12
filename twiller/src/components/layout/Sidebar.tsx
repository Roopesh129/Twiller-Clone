"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  User,
  MoreHorizontal,
  Settings,
  LogOut,
  Globe,
  UserPlus,
  MessageSquare,
  SquareSlash,
  Rocket,
  BadgeCheck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import TwitterLogo from '../Twitterlogo';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelectorModal from '../LanguageSelectorModal';

interface SidebarProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export default function Sidebar({ currentPage = 'home', onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);

  const navigation = [
    { name: t('home'), icon: Home, current: currentPage === 'home', page: 'home' },
    { name: t('explore'), icon: Search, current: currentPage === 'explore', page: 'explore' },
    { name: t('notifications'), icon: Bell, current: currentPage === 'notifications', page: 'notifications', badge: true },
    { name: 'Follow', icon: UserPlus, current: currentPage === 'follow', page: 'follow' },
    { name: 'Messages', icon: Mail, current: currentPage === 'messages', page: 'messages' },
    { name: t('bookmarks'), icon: Bookmark, current: currentPage === 'bookmarks', page: 'bookmarks' },
    { name: 'Subscribe', icon: BadgeCheck, current: currentPage === 'subscribe', page: 'subscribe' },
    { name: t('profile'), icon: User, current: currentPage === 'profile', page: 'profile' },
    { name: t('more'), icon: MoreHorizontal, current: currentPage === 'more', page: 'more' },
  ];

  const handleNavClick = (page: string) => {
    if (page === 'subscribe') {
      window.dispatchEvent(new Event('openSubscribeModal'));
      if (onNavigate) {
        onNavigate('subscribe');
      }
      return;
    }
    
    if (onNavigate) {
      onNavigate(page);
    }
    if (page === 'home') {
      router.push('/');
    }
  };

  return (
    <>
      {/* 
        FIXED: 
        1. Changed back to h-screen
        2. Added overflow-hidden to completely ban scrollbars
        3. Kept justify-between to push the profile to the absolute bottom
      */}
      <div className="flex flex-col h-screen overflow-y-auto overflow-x-hidden no-scrollbar w-full sticky top-0 bg-background px-2 pb-3 pt-1 justify-between">
        
        <div className="flex flex-col items-start w-full">
          {/* Logo Section */}
          <Link href="/" className="my-1 p-2 hover:bg-accent rounded-full transition-colors flex items-center justify-center mx-auto xl:mx-0 w-fit">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 fill-current text-foreground">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
            </svg>
          </Link>
          
          {/* Navigation Links - Reduced space-y and padding for perfect fit */}
          <nav className="flex flex-col space-y-0 w-full">
            {navigation.map((item) => (
              <div key={item.page} className="w-full">
                <Button
                  variant="ghost"
                  // Reduced py-2.5 to py-2 to compress the height slightly
                  className={`h-auto py-2 px-4 w-fit rounded-full hover:bg-accent transition-colors flex items-center justify-start text-foreground hover:text-foreground ${
                    item.current ? 'font-bold' : 'font-normal'
                  }`}
                  onClick={() => handleNavClick(item.page)}
                >
                  <item.icon className="mr-4 sm:mr-0 xl:mr-5 h-[26px] w-[26px]" />
                  <span className="inline sm:hidden xl:inline text-[20px]">{item.name}</span>
                  {item.badge && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  )}
                </Button>
              </div>
            ))}

            {/* Language Selector Option */}
            <div className="w-full">
              <Button
                variant="ghost"
                className="h-auto py-2.5 px-4 w-fit rounded-full hover:bg-accent transition-colors flex items-center justify-start font-normal text-foreground hover:text-foreground"
                onClick={() => setIsLangModalOpen(true)}
              >
                <Globe className="mr-4 sm:mr-0 xl:mr-5 h-[26px] w-[26px]" />
                <span className="inline sm:hidden xl:inline text-[20px]">{t('selectLanguage')}</span>
              </Button>
            </div>
            
            {/* Post Button - Reduced mt-3 to mt-2 */}
            <Button 
              className="w-[90%] h-[48px] sm:w-12 sm:h-12 xl:w-[90%] xl:h-[48px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[17px] rounded-full mt-2 transition-colors flex items-center justify-center shadow-md mx-auto xl:mx-0 p-0"
              onClick={() => router.push('/')}
            >
              <span className="inline sm:hidden xl:inline">{t('post')}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6 fill-current hidden sm:block xl:hidden"><g><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.22-2.01.593-2.97l1.204-1.204c.239.23.498.439.774.629l3.05 3.05c1.47 1.47 3.99 1.47 5.46 0l4.95-4.95c1.47-1.47 1.47-3.99 0-5.46l-3.05-3.05c-.19-.276-.399-.535-.629-.774l1.204-1.204C20.99 5.22 22 5.007 23 4V3zm-2.12 6.88l-4.95 4.95c-.68.68-.68 1.79 0 2.47l3.05 3.05c.68.68 1.79.68 2.47 0l4.95-4.95c.68-.68.68-1.79 0-2.47l-3.05-3.05c-.68-.68-1.79-.68-2.47 0z"></path></g></svg>
            </Button>
          </nav>
        </div>
        
        {/* User Profile Pill */}
        {user && (
          <div className="w-full px-2 mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-auto flex items-center justify-between p-3 rounded-full hover:bg-accent transition-colors border-none"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.displayName || "User"} />
                      <AvatarFallback className="bg-purple-600 text-white font-bold">
                        {(user?.displayName || user?.username || "User")[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex sm:hidden xl:flex flex-col items-start truncate w-[130px]">
                      <span className="text-foreground font-bold text-[15px] leading-5 truncate w-full text-left">
                        {user?.displayName || user?.username || "User"}
                      </span>
                      <span className="text-muted-foreground text-[15px] leading-5 truncate w-full text-left">
                        @{user?.username || "username"}
                      </span>
                    </div>
                  </div>

                  <MoreHorizontal className="block sm:hidden xl:block h-5 w-5 text-foreground shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-[300px] bg-background border border-border shadow-[0_0_15px_rgba(0,0,0,0.1)] rounded-xl py-2 mb-2 font-bold" align="center">
                <DropdownMenuItem 
                  className="text-foreground py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => router.push('/settings/notifications')}
                >
                  Notification Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border my-1" />
                <DropdownMenuItem 
                  className="text-foreground py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
                >
                  Add an existing account
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-foreground py-3 px-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={logout}
                >
                  Log out @{user?.username || "user"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <LanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </>
  );
}