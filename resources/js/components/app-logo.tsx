import Logo from '../../../public/images/logo.png';

export default function AppLogo() {
    return (
        <>
            <div className="flex items-center justify-center rounded-md w-full">
                <img src={Logo} className="w-full h-10 fill-current text-white dark:text-black sm:w-fit" />
            </div>
        </>
    );
}
