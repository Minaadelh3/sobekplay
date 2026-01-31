
import React from 'react';

const TeamIcon = ({ children }: { children: React.ReactNode }) => (
    <svg
        viewBox="0 0 512 512"
        className="w-full h-full p-4 drop-shadow-md filter"
        style={{ fill: 'white' }}
    >
        {children}
    </svg>
);

export const ToutIcon = () => (
    <TeamIcon>
        <path d="M120 256c0-60 40-100 100-120 40-13 80-10 120 20 20 15 30 40 30 70v100c0 30-10 50-30 70-30 30-70 40-120 40h-20c-40 0-80-30-80-80 0-30-20-50-60-50-20 0-40 10-60 30l-10-20c10-20 30-40 60-50 40-10 70 10 70 50 0 10 10 20 20 20h20c30 0 50-10 70-30 10-10 20-30 20-50V256c0-10-5-20-15-30-20-15-50-15-75-5-30 15-50 40-50 80h-40z" />
        <circle cx="280" cy="200" r="15" />
    </TeamIcon>
);

export const AnkhIcon = () => (
    <TeamIcon>
        <path d="M256 96c-44.2 0-80 35.8-80 80s35.8 80 80 80 80-35.8 80-80-35.8-80-80-80zM216 288h-40v40h40v128h80V328h40v-40h-40v-24c0-13.3-10.7-24-24-24h-32c-13.3 0-24 10.7-24 24v24z" />
    </TeamIcon>
);

export const AmonIcon = () => (
    <TeamIcon>
        {/* Minimalist Double Plumes */}
        <path d="M220 100c-20 0-40 80-40 160 0 60 20 100 40 120h72c20-20 40-60 40-120 0-80-20-160-40-160h-72zM256 400c-30 0-50-40-50-120 0-60 10-120 20-120h60c10 0 20 60 20 120 0 80-20 120-50 120z" />
    </TeamIcon>
);

export const RaIcon = () => (
    <TeamIcon>
        {/* Sun Disk with Wings */}
        <circle cx="256" cy="180" r="60" />
        <path d="M120 180c-40 20-80 60-80 100 0 20 20 30 40 20 40-20 80-60 110-80l-70-40zM392 180c40 20 80 60 80 100 0 20-20 30-40 20-40-20-80-60-110-80l70-40z" />
    </TeamIcon>
);
