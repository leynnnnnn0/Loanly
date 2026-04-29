import type { SVGAttributes } from 'react';
import AppLogo from "../../../public/images/mainLogo.png";
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return <img src={AppLogo} alt="App Logo" className='w-18'/>;
}
