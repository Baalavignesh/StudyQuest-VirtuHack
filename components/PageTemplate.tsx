import React from "react";
import CustomNavbar from "./customNavbar";
import PageHeading from "./̦PageHeading";
import { PageTemplateProps } from '@/interfaces';

const PageTemplate: React.FC<PageTemplateProps> = ({ children, showNavbar = true, className }) => {
  return (
    <div className={`min-h-screen overflow-hidden noselect ${className || ''}`}>
      {showNavbar && <CustomNavbar />}
      <div className="px-8 2xl:px-32 3xl:px-72 h-full">
        <div className="mt-6 gap-12 flex">{children}</div>
      </div>
    </div>
  );
};

export default PageTemplate;
