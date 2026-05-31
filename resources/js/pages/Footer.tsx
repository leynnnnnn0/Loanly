import Logo from '../../../public/images/mainLogo.png';
export default function Footer() {
    return (
        <>
            {/* Simple Footer */}
            <footer className="border-t border-secondary bg-secondary/50 pt-16 pb-8">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
                        {/* Brand Column */}
                        <div className="col-span-2 lg:col-span-2">
                            <div className="mb-6 flex items-center gap-2">
                                <img
                                    src={Logo}
                                    alt="Loanly logo"
                                    className="h-10"
                                />
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed text-gray-600">
                                A secure online lending app for borrower
                                verification, loan requests, document uploads,
                                notifications, and repayment tracking.
                            </p>
                        </div>

                        {/* Links: Product */}
                        <div>
                            <h4 className="mb-6 text-xs font-black tracking-widest text-gray-900 uppercase">
                                Quick Links
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-gray-600">
                                <li>
                                    <a
                                        href="#home"
                                        className="transition hover:text-accent"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#features"
                                        className="transition hover:text-accent"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#pricing"
                                        className="transition hover:text-accent"
                                    >
                                        Why Loanly
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Links: Company */}
                        <div>
                            <h4 className="mb-6 text-xs font-black tracking-widest text-gray-900 uppercase">
                                Product
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-gray-600">
                                <li>
                                    <a
                                        href="#about"
                                        className="transition hover:text-accent"
                                    >
                                        How it works
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#contact"
                                        className="transition hover:text-accent"
                                    >
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Links: Legal */}
                        {/* <div>
                            <h4 className="mb-6 text-xs font-black tracking-widest text-white uppercase">
                                Legal
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-white">
                                <li className="cursor-pointer hover:text-blue-600">
                                    Privacy
                                </li>
                                <li className="cursor-pointer hover:text-blue-600">
                                    Terms
                                </li>
                            </ul>
                        </div> */}
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-secondary pt-8 md:flex-row">
                        <p className="text-xs font-medium text-gray-500">
                            © 2026 Loanly. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            {/* Simple Social Icons Placeholders */}
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-primary transition-colors hover:bg-accent" />
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-primary transition-colors hover:bg-accent" />
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-primary transition-colors hover:bg-accent" />
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
