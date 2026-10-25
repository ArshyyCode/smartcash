import React from 'react';

/**
 * Logo aplikasi SmartCash (menggantikan logo Laravel bawaan Breeze).
 * Komponen ini dipakai di AuthenticatedLayout, GuestLayout (login/register), dll.
 * Pastikan file logo ada di: public/images/logo-smartcash.png
 */
export default function ApplicationLogo({ className = '', ...props }) {
    return (
        <img
            {...props}
            src="/images/logo-smartcash.png"
            alt="SmartCash"
            draggable={false}
            className={`object-contain select-none ${className}`}
        />
    );
}