
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SplashPage() {
  const router = useRouter();
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoEnded) {
        router.replace('/login');
      }
    }, 5000); // 5-second timer

    return () => clearTimeout(timer);
  }, [router, videoEnded]);

  const handleVideoEnd = () => {
    setVideoEnded(true);
    router.replace('/login');
  };

  // Replace with your media file in the public folder
  const mediaFile = '/splash-video.mp4'; 
  const isVideo = mediaFile.endsWith('.mp4');

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center">
      {isVideo ? (
        <video
          src={mediaFile}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className="w-full h-full object-cover"
        >
            Your browser does not support the video tag.
        </video>
      ) : (
        <Image
          src={mediaFile}
          alt="Splash Screen"
          layout="fill"
          objectFit="cover"
          data-ai-hint="splash screen"
        />
      )}
    </div>
  );
}

