import React from 'react';
import { PageHeadingProps } from '@/interfaces';

const PageHeading: React.FC<PageHeadingProps> = ({ title, subtitle, className }) => {
    return (
        <div className={`w-fit ${className || ''}`}>
            <h1 className="text-2xl 2xl:text-4xl 3xl:text-6xl font-bold mt-10 2xl:mt-12 3xl:mt-28 pb-6 w-fit">{title}</h1>
            {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
            <hr className="w-full" />
        </div>
    );
}

export default PageHeading;