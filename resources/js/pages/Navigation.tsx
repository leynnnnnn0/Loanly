import { Link } from '@inertiajs/react';
import { Menu,X } from 'lucide-react';
import { useState } from 'react';
import { login } from '@/routes';
import LOGO from '../../../public/images/mainLogo.png';

export default function Navigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '#home', label: 'Home' },
        { href: '#features', label: 'Features' },
        { href: '#about', label: 'How it works' },
        { href: '#pricing', label: 'Why Loanly' },
        { href: '#contact', label: 'FAQ' },
    ];

    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 border-b border-secondary bg-white/95 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img src={LOGO} alt="Logo" className="h-10" />
          
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden items-center space-x-8 md:flex">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="text-sm font-semibold text-gray-600 transition hover:text-accent"
                            >
                                {link.label}
                            </a>
                        ))}

                        <Link
                            href={login.url()}
                            className="cursor-pointer rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-gray-900 shadow-md transition hover:bg-accent"
                        >
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 md:hidden"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="border-t border-secondary bg-white md:hidden">
                        <div className="mx-auto max-w-7xl space-y-1 px-6 py-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={handleLinkClick}
                                    className="block rounded-md px-4 py-3 text-base font-semibold text-gray-600 transition hover:bg-secondary/40 hover:text-gray-950"
                                >
                                    {link.label}
                                </a>
                            ))}

                            <div className="pt-4">
                                <Link
                                    href={login.url()}
                                    onClick={handleLinkClick}
                                    className="block w-full rounded-md bg-primary px-5 py-3 text-center text-base font-bold text-gray-900 shadow-md transition hover:bg-accent"
                                >
                                    Login
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
}
