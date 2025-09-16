import React from 'react';

const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 2L2 9.5l7.5 2.5L12 19.5l2-7L22 2zM12 19.5L14.5 12 19.5 9.5 12 19.5z"/>
    </svg>
);


const ContactCard: React.FC = () => {
    return (
        <p className="text-sm text-gray-400">
            For more amazing images or videos at very cheap price, contact on Telegram:&nbsp;
            <a 
                href="https://t.me/DarkGalleryX"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
            >
                <TelegramIcon/>
                <span>@DarkGalleryX</span>
            </a>
        </p>
    );
}

export default ContactCard;
