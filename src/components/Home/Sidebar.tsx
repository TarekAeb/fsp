"use client"
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../ui/icon';
// TODO: change the color of the icons to white and create new ones with primary color
// Import SVG icons

export default function Sidebar() {
    // Get the current path to determine active page
    const pathname = usePathname();
    const [currentPage, setCurrentPage] = useState(pathname === '/' ? 'home' : pathname.slice(1));

    const navItems = [
        { name: 'home', path: '/', icon: '/icons/bold home white.svg', coloredIcon: '/icons/bold home colored.svg' },
        { name: 'search', path: '/search', icon: '/icons/search white.svg', coloredIcon: '/icons/search colored.svg' },
        { name: 'saved', path: '/saved', icon: '/icons/bold save white.svg', coloredIcon: '/icons/bold save colored.svg' },
        { name: 'share', path: '/share', icon: '/icons/share white.svg', coloredIcon: '/icons/share colored.svg' },
    ];

    const handleNavigation = (pageName: string) => {
        setCurrentPage(pageName);
    };

    return (
        <>
            {/* Mobile Navigation */}
            <div className="z-50 md:hidden w-full h-16 fixed bottom-0 bg-background text-foreground flex items-center justify-around px-4">
                {navItems.map((item) => (
                    <Link href={item.path} key={item.name} onClick={() => handleNavigation(item.name)}>
                        <div className={`flex flex-col items-center `}>
                            <Icon
                                path={currentPage === item.name ? item.coloredIcon : item.icon}
                                alt={item.name}
                                size={2}
                            />
                            <span className={`text-xs mt-1 ${currentPage === item.name ? 'text-primary font-medium' : ''}`}>
                                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Desktop Sidebar */}
            <div className="z-50 hidden md:sticky top-0 left-0 md:flex w-16 lg:w-20 h-screen flex-col items-center py-8 bg-background ">
                <div className="flex flex-col items-center space-y-8">
                    {navItems.slice(0, 3).map((item) => (
                        <Link href={item.path} key={item.name} onClick={() => handleNavigation(item.name)}>
                            <div className={`p-3 rounded-lg transition-all`}>
                                <Icon
                                    path={currentPage === item.name ? item.coloredIcon : item.icon}
                                    alt={item.name}
                                    size={2}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="mt-auto">
                    <Link href="/share" onClick={() => handleNavigation('share')}>
                        <div className={`p-3 rounded-lg transition-all hover:bg-primary/10 ${currentPage === 'share' ? 'bg-primary/15' : ''
                            }`}>
                            <Icon
                                path={currentPage === 'share' ? '/icons/share colored.svg' : '/icons/share white.svg'}
                                alt="share"
                                size={2}
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </>
    );
}