import * as React from 'react';
import BaseLiquidGlass from 'liquid-glass-react';
import { cn } from '@/lib/utils';

export type GlassTint =
    | 'none'
    | 'cyan'
    | 'blue'
    | 'purple'
    | 'indigo'
    | 'emerald'
    | 'amber'
    | 'rose'
    | 'rainbow';

export const glassTintPresets: Record<GlassTint, string> = {
    none: '',
    cyan: 'from-cyan-500/30 via-teal-500/20 to-blue-500/25 dark:from-cyan-400/35 dark:via-teal-400/25 dark:to-blue-500/30',
    blue: 'from-blue-600/30 via-indigo-500/20 to-sky-500/25 dark:from-blue-500/35 dark:via-indigo-500/25 dark:to-sky-400/30',
    purple: 'from-purple-600/30 via-fuchsia-500/20 to-indigo-500/25 dark:from-purple-500/35 dark:via-fuchsia-500/25 dark:to-indigo-400/30',
    indigo: 'from-indigo-600/30 via-purple-500/20 to-blue-500/25 dark:from-indigo-500/35 dark:via-purple-500/25 dark:to-blue-400/30',
    emerald: 'from-emerald-600/30 via-teal-500/20 to-green-500/25 dark:from-emerald-500/35 dark:via-teal-500/25 dark:to-green-400/30',
    amber: 'from-amber-600/30 via-orange-500/20 to-yellow-500/25 dark:from-amber-500/35 dark:via-orange-500/25 dark:to-yellow-400/30',
    rose: 'from-rose-600/30 via-pink-500/20 to-red-500/25 dark:from-rose-500/35 dark:via-pink-500/25 dark:to-red-400/30',
    rainbow: 'from-cyan-500/30 via-purple-500/25 to-amber-500/30 dark:from-cyan-400/35 dark:via-purple-500/30 dark:to-amber-400/35',
};

export interface LiquidGlassBackgroundProps {
    /**
     * Ambient color reflection behind the glass.
     * Can be a preset name ('cyan' | 'blue' | 'purple' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'rainbow' | 'none')
     * or custom Tailwind classes (e.g. 'bg-purple-700/20' or 'from-pink-500/20 to-indigo-500/20').
     */
    tint?: GlassTint | string;
    /**
     * Additional CSS classes for the tint layer.
     */
    tintClassName?: string;
    /**
     * Intensity of displacement / light refraction (default: 35).
     */
    displacementScale?: number;
    /**
     * Frosting / blur amount (default: 0).
     */
    blurAmount?: number;
    /**
     * Color saturation percentage (default: 150).
     */
    saturation?: number;
    /**
     * Chromatic aberration intensity (default: 1.4).
     */
    aberrationIntensity?: number;
    /**
     * Liquid elasticity / wobble response to mouse (default: 0.2).
     */
    elasticity?: number;
    /**
     * Corner radius in pixels (default: 6).
     */
    cornerRadius?: number;
    /**
     * Border thickness for the glass highlight edge.
     * Supports presets ('ultra-thin' = 0.35px, 'thin' = 0.5px, 'normal' = 1px, 'thick' = 1.5px) or custom pixel strings (e.g. '0.2px').
     * Default: '0.4px'.
     */
    borderWidth?: 'ultra-thin' | 'thin' | 'normal' | 'thick' | string | number;
    /**
     * Border opacity (0 to 1, default: 0.5).
     */
    borderOpacity?: number;
    /**
     * Border opacity specifically for dark mode (0 to 1, defaults to borderOpacity).
     */
    borderDarkOpacity?: number;
    /**
     * Whether to show the glass border highlight (default: true).
     */
    showBorder?: boolean;
    /**
     * Whether to keep the 3px inset blur shadow on the border (default: false for crisp thin border).
     */
    borderShadow?: boolean;
    /**
     * Glow / shadow style ('none' | 'subtle' | 'glow', default: 'subtle').
     */
    shadow?: 'none' | 'subtle' | 'glow';
    /**
     * Explicit override for light mode (if omitted, auto-detects dark mode from <html>).
     */
    overLight?: boolean;
    /**
     * Container element to track mouse movement on.
     */
    mouseContainer?: React.RefObject<HTMLElement | null> | null;
    /**
     * Optional children to render inside the glass layer (automatically wrapped in relative z-10).
     */
    children?: React.ReactNode;
    /**
     * Custom wrapper className.
     */
    className?: string;
}

export function LiquidGlassBackground({
    children,
    tint = 'cyan',
    tintClassName,
    displacementScale = 35,
    blurAmount = 0,
    saturation = 150,
    aberrationIntensity = 1.4,
    elasticity = 0.2,
    cornerRadius = 6,
    borderWidth = '0.4px',
    borderOpacity = 0.5,
    borderDarkOpacity,
    showBorder = true,
    borderShadow = false,
    shadow = 'subtle',
    overLight,
    mouseContainer,
    className,
}: LiquidGlassBackgroundProps) {
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        const updateDark = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        updateDark();
        const observer = new MutationObserver(updateDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const resolvedBorderWidth = React.useMemo(() => {
        if (!showBorder || borderWidth === 0 || borderWidth === 'none') return '0px';
        if (typeof borderWidth === 'number') return `${borderWidth}px`;
        switch (borderWidth) {
            case 'ultra-thin':
                return '0.3px';
            case 'thin':
                return '0.5px';
            case 'normal':
                return '1px';
            case 'thick':
                return '1.5px';
            default:
                return borderWidth;
        }
    }, [borderWidth, showBorder]);

    const tintClasses =
        tint !== 'none'
            ? (glassTintPresets as Record<string, string>)[tint] || tint
            : '';

    const shadowClasses = {
        none: 'dark:[&_.glass]:!shadow-none [&_.glass]:!shadow-none',
        subtle: 'dark:[&_.glass]:!shadow-none [&_.glass]:!shadow-[0_2px_10px_rgba(0,0,0,0.06)]',
        glow: 'dark:[&_.glass]:!shadow-[0_0_20px_rgba(56,189,248,0.25)] [&_.glass]:!shadow-[0_4px_16px_rgba(0,0,0,0.12)]',
    }[shadow];

    return (
        <>
            <span
                aria-hidden="true"
                className={cn(
                    'pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-md',
                    '[&>.bg-black]:!hidden',
                    shadowClasses,
                    // Directly control border width and opacity on all LiquidGlass highlight spans:
                    '[&>span]:![padding:var(--glass-border-w)]',
                    '[&>span]:![opacity:var(--glass-border-opacity)]',
                    'dark:[&>span]:![opacity:var(--glass-border-dark-opacity)]',
                    borderShadow ? '' : '[&>span]:!shadow-none',
                    showBorder === false && '[&>span]:!hidden',
                    className,
                )}
                style={
                    {
                        '--glass-border-w': resolvedBorderWidth,
                        '--glass-border-opacity': borderOpacity,
                        '--glass-border-dark-opacity': borderDarkOpacity ?? borderOpacity,
                    } as React.CSSProperties
                }
            >
                {tintClasses && (
                    <div
                        data-glass-tint="true"
                        className={cn(
                            'absolute -inset-1 z-0 bg-gradient-to-r opacity-90 blur-xs transition-opacity duration-300',
                            tintClasses,
                            tintClassName,
                        )}
                    />
                )}
                <BaseLiquidGlass
                    displacementScale={displacementScale}
                    blurAmount={blurAmount}
                    saturation={saturation}
                    aberrationIntensity={aberrationIntensity}
                    elasticity={elasticity}
                    cornerRadius={cornerRadius}
                    padding="0px"
                    overLight={overLight ?? !isDark}
                    mouseContainer={mouseContainer}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                    }}
                    className="w-full h-full [&>.glass]:!w-full [&>.glass]:!h-full [&>.glass]:!p-0 [&>.glass]:!gap-0 [&>.glass]:!justify-start [&>.glass]:!border-0"
                >
                    {null}
                </BaseLiquidGlass>
            </span>
            {children && (
                <span className="relative z-10 flex items-center justify-center">
                    {children}
                </span>
            )}
        </>
    );
}

export const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('relative isolate overflow-hidden inline-flex items-center justify-center', className)}
                style={{ borderRadius: `${props.cornerRadius ?? 6}px`, ...props.style }}
            >
                <LiquidGlassBackground {...props} />
                <span className="relative z-10 flex items-center justify-center">{children}</span>
            </div>
        );
    },
);
LiquidGlass.displayName = 'LiquidGlass';

export interface LiquidGlassCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
    LiquidGlassBackgroundProps {
    children?: React.ReactNode;
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
    (
        {
            children,
            className,
            tint = 'cyan',
            tintClassName,
            displacementScale = 35,
            blurAmount = 0,
            saturation = 150,
            aberrationIntensity = 1.4,
            elasticity = 0.2,
            cornerRadius = 10,
            borderWidth = '0.4px',
            borderOpacity = 0.5,
            borderDarkOpacity,
            showBorder = true,
            borderShadow = false,
            shadow = 'subtle',
            overLight,
            mouseContainer,
            ...props
        },
        ref,
    ) => {
        const localRef = React.useRef<HTMLDivElement | null>(null);

        const setMergedRef = React.useCallback(
            (node: HTMLDivElement | null) => {
                localRef.current = node;
                if (typeof ref === 'function') {
                    ref(node);
                } else if (ref) {
                    (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
                }
            },
            [ref],
        );

        return (
            <div
                ref={setMergedRef}
                className={cn(
                    'relative isolate overflow-hidden shadow-xs transition-all',
                    showBorder
                        ? 'border border-neutral-900/10 dark:border-white/5 bg-white/60 dark:bg-white/5'
                        : 'border-transparent bg-white/60 dark:bg-white/5',
                    className,
                )}
                style={{ borderRadius: `${cornerRadius}px`, ...props.style }}
                {...props}
            >
                <LiquidGlassBackground
                    tint={tint}
                    tintClassName={tintClassName}
                    displacementScale={displacementScale}
                    blurAmount={blurAmount}
                    saturation={saturation}
                    aberrationIntensity={aberrationIntensity}
                    elasticity={elasticity}
                    cornerRadius={cornerRadius}
                    borderWidth={borderWidth}
                    borderOpacity={borderOpacity}
                    borderDarkOpacity={borderDarkOpacity}
                    showBorder={showBorder}
                    borderShadow={borderShadow}
                    shadow={shadow}
                    overLight={overLight}
                    mouseContainer={mouseContainer ?? localRef}
                />
                <div className="relative z-10 w-full">{children}</div>
            </div>
        );
    },
);
LiquidGlassCard.displayName = 'LiquidGlassCard';
