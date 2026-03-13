import React, { useEffect, useState } from 'react';
import Barcode from 'react-barcode';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui';
import { Scan } from 'lucide-react';

// Component hiển thị Barcode
export const ProductBarcode = ({ value }: { value: string }) => {
    if (!value) return <span className="text-xs text-muted-foreground">Chưa có mã</span>;
    return <Barcode value={value} width={1} height={40} fontSize={12} />;
};

// Component Input hỗ trợ Scan (Giả lập máy quét USB - tự động Enter khi quét xong)
interface ScannerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onScan: (code: string) => void;
}

export const ScannerInput = ({ onScan, ...props }: ScannerInputProps) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value;
            if (value) {
                onScan(value);
                (e.target as HTMLInputElement).value = ''; // Clear sau khi scan
            }
        }
    };

    return (
        <div className="relative">
            <Scan className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                className="pl-8" 
                placeholder="Quét mã vạch vào đây..." 
                onKeyDown={handleKeyDown} 
                {...props} 
            />
        </div>
    );
};