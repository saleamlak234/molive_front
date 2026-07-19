import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const handleToggle = () => {
        const html = document.documentElement;
        const nextMode = !html.classList.contains('dark');
        setIsDark(nextMode);

        if (nextMode) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
    };

    return (
        <button
            onClick={handleToggle}
            className="transition-colors"
            aria-label="Toggle dark mode"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
                <Moon className="w-5 h-5 text-gray-800" />
            )}
        </button>
    );
}
