import type { ImgHTMLAttributes } from 'react';
import AppLogo from "../../../public/images/mainLogo.png";

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return <img className='size-5' src={AppLogo} alt="App Logo" {...props}/>;
}
