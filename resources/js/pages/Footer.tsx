import Logo from '../../../public/images/mainLogo.png';
export default function Footer() {
    return (
        <>
            {/* Simple Footer */}
            <footer className="border-t border-slate-100 bg-primary pt-20 pb-10">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
                        {/* Brand Column */}
                        <div className="col-span-2 lg:col-span-2">
                            <div className="mb-6 flex items-center gap-2">
                                <img src={Logo} alt="logo" className="size-8" />
                            </div>
                            <p className="max-w-xs text-sm leading-relaxed text-white">
                                The secure digital ledger for your personal and
                                business debts. Keep your records private,
                                organized, and always accessible.
                            </p>
                        </div>

                        {/* Links: Product */}
                        <div>
                            <h4 className="mb-6 text-xs font-black tracking-widest text-white uppercase">
                                Quick Links
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-white">
                                <li className="cursor-pointer hover:text-blue-600">
                                    <a
                                        href="/"
                                        className="transition hover:text-blue-700"
                                    >
                                        Home
                                    </a>
                                </li>
                                <li className="cursor-pointer hover:text-blue-600">
                                    <a
                                        href="#features"
                                        className="transition hover:text-blue-700"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li className="cursor-pointer hover:text-blue-600">
                                    <a
                                        href="/pricing"
                                        className="transition hover:text-blue-700"
                                    >
                                        Pricing
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Links: Company */}
                        <div>
                            <h4 className="mb-6 text-xs font-black tracking-widest text-white uppercase">
                                Company
                            </h4>
                            <ul className="space-y-4 text-sm font-medium text-white">
                                <li className="cursor-pointer hover:text-blue-600">
                                    <a
                                        href="/about-us"
                                        className="transition hover:text-blue-700"
                                    >
                                        About Us
                                    </a>
                                </li>
                                <li className="cursor-pointer hover:text-blue-600">
                                    <a
                                        href="/contact"
                                        className="transition hover:text-blue-700"
                                    >
                                        Contact
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
                    <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-10 md:flex-row">
                        <p className="text-xs font-medium text-white">
                            © 2026 Loanly. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            {/* Simple Social Icons Placeholders */}
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-100 transition-colors hover:bg-blue-50" />
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-100 transition-colors hover:bg-blue-50" />
                            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-100 transition-colors hover:bg-blue-50" />
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
}
