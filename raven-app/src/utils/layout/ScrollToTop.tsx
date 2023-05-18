import React, { useEffect } from 'react';

interface ScrollToTopProps {
    onScrollToTop: () => void;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ onScrollToTop }) => {
    useEffect(() => {
        const handleScroll = () => {
            if (window.pageYOffset === 0) {
                onScrollToTop()
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [onScrollToTop])

    return null
}

export default ScrollToTop;
