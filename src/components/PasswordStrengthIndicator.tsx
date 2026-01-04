"use client";

import { useEffect, useState } from "react";

interface PasswordStrength {
    score: number;
    message: string;
    color: string;
}

interface PasswordStrengthIndicatorProps {
    password?: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const [strength, setStrength] = useState<PasswordStrength>({
        score: 0,
        message: "",
        color: "bg-gray-200",
    });

    useEffect(() => {
        const calculateStrength = (pass?: string): PasswordStrength => {
            let score = 0;
            if (!pass) {
                return { score: 0, message: "", color: "bg-gray-200" };
            }

            // Length check
            if (pass.length >= 8) score += 1;
            if (pass.length >= 12) score += 1;

            // Character variety
            if (/[A-Z]/.test(pass)) score += 1;
            if (/[0-9]/.test(pass)) score += 1;
            if (/[^A-Za-z0-9]/.test(pass)) score += 1;

            const strengthMap: Record<number, { message: string, color: string }> = {
                0: { message: "Very Weak", color: "bg-red-500" },
                1: { message: "Weak", color: "bg-orange-500" },
                2: { message: "Fair", color: "bg-yellow-500" },
                3: { message: "Good", color: "bg-blue-500" },
                4: { message: "Strong", color: "bg-green-500" },
                5: { message: "Very Strong", color: "bg-green-600" },
            };

            return {
                score,
                ...strengthMap[score],
            };
        };

        setStrength(calculateStrength(password));
    }, [password]);

    return (
        <div className="mt-2">
            <div className="flex h-1 overflow-hidden bg-gray-200 rounded">
                <div
                    className={`transition-all duration-300 ${strength.color}`}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                />
            </div>
            {strength.message && (
                <p
                    className={`text-xs mt-1 ${strength.score > 2 ? "text-green-600" : "text-red-500"
                        }`}
                >
                    {strength.message}
                </p>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password must:
                <ul className="list-disc list-inside">
                    <li className={(password?.length || 0) >= 8 ? "text-green-500" : ""}>
                        Be at least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(password || '') ? "text-green-500" : ""}>
                        Include uppercase letters
                    </li>
                    <li className={/[0-9]/.test(password || '') ? "text-green-500" : ""}>
                        Include numbers
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(password || '') ? "text-green-500" : ""}>
                        Include special characters
                    </li>
                </ul>
            </div>
        </div>
    );
}
