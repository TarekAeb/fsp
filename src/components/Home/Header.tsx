'use client'
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from "react";
import Icon from "../ui/icon";

const links = [
    {
        short_name: "ANIM",
        name: "Short Series",
        url: "/anim"
    },
    {
        short_name: "MOVIES",
        name: "Short Movies",
        url: "/movies"
    },
    {
        short_name: "DOCU",
        name: "Documentaries",
        url: "/documentaries"
    },
]

export default function Header() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Gradient background for non-scrolled state
    const gradientBg = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%)';

    return (
        <>
            {/* Mobile view */}
            <header
                className={`fixed top-0 left-0 z-50 w-full h-28 flex flex-col md:hidden transition-all duration-300 ${scrolled ? 'backdrop-blur-sm' : ''
                    }`}
                style={{
                    background: scrolled
                        ? 'rgba(0, 0, 0, 0.3)'
                        : gradientBg
                }}
            >
                {/* Mobile header content (unchanged) */}
                <div className="w-full flex justify-between h-full px-6 pt-6 pb-4">
                    <Link href="/" className="self-start">
                        <Icon alt="logo" path="/icons/logo colored.svg" size={2} />
                    </Link>
                    <div className="self-end h-full flex justify-center gap-4 items-end ">
                        {links.map((link) => (
                            <Link key={link.url} href={link.url}>
                                <p className={`${pathname.includes(link.url) ? 'text-primary' : 'text-foreground'
                                    }`}>
                                    {link.short_name}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <Link href="/dashboard/profile" className="self-start">
                        <Icon alt="account" path="/icons/profile colored.svg" size={2} />
                    </Link>
                </div>


            </header>

            {/* Desktop view */}
            <header
                className={`fixed lg:left-20 top-0 left-16 z-50 hidden md:block lg:w-[calc(100%-80px)] w-[calc(100%-64px)] h-24 transition-all duration-300 ${scrolled ? 'backdrop-blur-sm' : ''
                    }`}
                style={{
                    background: scrolled
                        ? 'rgba(0, 0, 0, 0.3)'
                        : gradientBg
                }}
            >
                {/* Desktop header content (unchanged) */}
                <div className="h-full w-full flex items-center justify-between px-6 lg:px-8">
                    <div className="flex justify-center items-center">
                        <Icon alt="logo" path="/icons/full logo colored.svg" size={6} />
                    </div>
                    <div className="flex justify-center items-center gap-4">
                        {links.map((link) => (
                            <Link key={link.url} href={link.url}>
                                <p className={`text-lg ${pathname.includes(link.url) ? 'text-primary' : 'text-foreground'
                                    }`}>
                                    {link.name}
                                </p>
                            </Link>
                        ))}
                    </div>
                    <div className="flex justify-center items-center">
                        <Link href="/dashboard/profile">
                            <Icon alt="account" path="/icons/bold profile colored.svg" size={3} />
                        </Link>
                    </div>
                </div>
            </header>
        </>
    )
}