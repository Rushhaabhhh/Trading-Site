import React from 'react';
import HomeNavbar from '../components/HomeNavbar';

import bg1 from '../assets/bg-1.png';
import bg2 from '../assets/bg-2.png';
import video from '../assets/video.mp4';

const HomePage = () => {
    return (
        <div className="relative max-w-full">
            <svg className='rotate-180' width="100%" height="100" viewBox="0 0 200 100" preserveAspectRatio="none">
                <path d="M0,60 Q20,0 50,30 Q80,60 100,30 Q120,0 150,30 Q180,60 200,30 L200,100 L0,100 Z" fill="#ff6a88"/>
            </svg>
            
            <img src={bg1} alt="Background Image" className="absolute top-0 left-0 w-100 h-100 object-cover object-center" />
            <img src={bg2} alt="Background Image" className="absolute top-20 right-0 max-w-full h-100 object-cover object-center" />
            

            <HomeNavbar />
            <div className='flex items-start justify-center mt-44'>
                <header className='mr-8'>
                    <h1 className='text-7xl font-bold text-gray-700 mb-2'>Algo Trading <br/> For Everyone</h1>
                    <p className='text-2xl text-gray-700 py-4 max-w-lg'>
                        Unlock the potential of algorithmic trading by leveraging advanced strategies and automated systems. Maximize your returns, minimize risks, and stay ahead in the fast-paced financial markets with our innovative solutions.
                    </p>
                    <div className="flex space-x-4 mt-6">
                        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store" className="h-16" />
                        </a>

                        <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer">
                            <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Apple Store" className="h-16" />
                        </a>
                    </div>
                </header>

                <div className=" ml-20 w-1/3 z-10">
                    <video src={video} autoPlay loop muted />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
