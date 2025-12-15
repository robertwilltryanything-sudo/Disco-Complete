import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon';
import { DashboardIcon } from './icons/DashboardIcon';
import { UserIcon } from './icons/UserIcon';
import { TagIcon } from './icons/TagIcon';

const NavItem: React.FC<{ to: string; children: React.ReactNode; label: string; state?: any }> = ({ to, children, label, state }) => {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      state={state}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 w-full h-full transition-colors duration-200 ${
          isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
        }`
      }
    >
      {children}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </NavLink>
  );
};

const BottomNavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-20 grid grid-cols-4 md:hidden pb-safe">
        <NavItem to="/" label="Collection">
            <HomeIcon className="w-6 h-6" />
        </NavItem>
        <NavItem to="/artists" label="Artists">
            <UserIcon className="w-6 h-6" />
        </NavItem>
        <NavItem to="/wantlist" label="Wantlist">
            <TagIcon className="w-6 h-6" />
        </NavItem>
        <NavItem to="/dashboard" label="Stats">
            <DashboardIcon className="w-6 h-6" />
        </NavItem>
    </nav>
  );
};

export default BottomNavBar;