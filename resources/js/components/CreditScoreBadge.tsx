// components/CreditScore/CreditScoreBadge.tsx
// ------------------------------------------------------------------
// Reusable credit-score component built with shadcn/ui.
//
// Usage:
//   <CreditScoreBadge borrowerId={42} />
//   <CreditScoreBadge borrowerId={42} compact />          // small badge only
//   <CreditScoreBadge borrowerId={42} showBreakdown />    // full card + chart
// ------------------------------------------------------------------

import { AlertCircle,ChevronDown,Info } from 'lucide-react';
import { useEffect,useState } from 'react';
import { Alert,AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from '@/components/ui/card';
import {
Collapsible,
CollapsibleContent,
CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
Tooltip,
TooltipContent,
TooltipProvider,
TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreditScoreBreakdownItem {
    score: number;
    weight: number;
    weighted: number;
}

export interface CreditScoreMeta {
    total_loans: number;
    completed_loans: number;
    active_loans: number;
    total_schedules: number;
    on_time_payments: number;
    late_payments: number;
    missed_payments: number;
    total_amount_due: number;
    total_amount_paid: number;
    overdue_amount: number;
}

export interface CreditScoreData {
    score: number;
    band: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Very Poor';
    breakdown: {
        payment_history: CreditScoreBreakdownItem;
        outstanding_debt: CreditScoreBreakdownItem;
        loan_utilization: CreditScoreBreakdownItem;
        loan_history: CreditScoreBreakdownItem;
    };
    meta: CreditScoreMeta;
}

export interface CreditScoreBadgeProps {
    /** Borrower primary key — used to fetch from the API */
    borrowerId: number;
    /** Show only the score pill (no card, no breakdown) */
    compact?: boolean;
    /** Show the breakdown accordion below the gauge */
    showBreakdown?: boolean;
    /** Override the API base URL (defaults to /api) */
    apiBase?: string;
    className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SCORE_MIN = 300;
const SCORE_MAX = 1000;

type Band = CreditScoreData['band'];

const BAND_CONFIG: Record<
    Band,
    {
        color: string;
        bg: string;
        border: string;
        bar: string;
        textColor: string;
    }
> = {
    Excellent: {
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        bar: 'bg-emerald-500',
        textColor: 'text-emerald-700',
    },
    Good: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        bar: 'bg-blue-500',
        textColor: 'text-blue-700',
    },
    Fair: {
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        bar: 'bg-amber-400',
        textColor: 'text-amber-700',
    },
    Poor: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        bar: 'bg-orange-500',
        textColor: 'text-orange-700',
    },
    'Very Poor': {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200',
        bar: 'bg-red-500',
        textColor: 'text-red-700',
    },
};

const FACTOR_LABELS: Record<keyof CreditScoreData['breakdown'], string> = {
    payment_history: 'Payment History',
    outstanding_debt: 'Outstanding Debt',
    loan_utilization: 'Loan Utilization',
    loan_history: 'Loan History',
};

const FACTOR_DESCRIPTIONS: Record<keyof CreditScoreData['breakdown'], string> =
    {
        payment_history:
            'How consistently you pay on time. On-time = full credit, late = 50 %, missed = 0 %.',
        outstanding_debt:
            'Ratio of overdue amount vs total amount due. Lower overdue = higher score.',
        loan_utilization:
            'How much of your approved credit limit you are using. Below 30 % is ideal.',
        loan_history:
            'Number of completed loans. More successfully closed loans = better score.',
    };

function scoreToPercent(score: number): number {
    return Math.round(((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100);
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(value);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreGauge({ score, band }: { score: number; band: Band }) {
    const cfg = BAND_CONFIG[band];
    const pct = scoreToPercent(score);

    return (
        <div className="flex flex-col items-center gap-2 py-2">
            {/* Numeric score */}
            <div className={cn('text-5xl font-bold tabular-nums', cfg.color)}>
                {score}
            </div>
            <div className="text-xs text-muted-foreground">
                {SCORE_MIN} – {SCORE_MAX}
            </div>

            {/* Progress bar */}
            <div className="w-full">
                <Progress
                    value={pct}
                    className="h-3 rounded-full"
                    // shadcn Progress uses a CSS variable for the indicator color;
                    // we layer an inline style to honour the band colour.
                    style={
                        {
                            '--progress-foreground': undefined,
                        } as React.CSSProperties
                    }
                />
            </div>

            {/* Band badge */}
            <Badge
                variant="outline"
                className={cn(
                    'px-3 py-1 text-sm font-semibold',
                    cfg.bg,
                    cfg.border,
                    cfg.textColor,
                )}
            >
                {band}
            </Badge>
        </div>
    );
}

function BreakdownRow({
    label,
    description,
    item,
}: {
    label: string;
    description: string;
    item: CreditScoreBreakdownItem;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 font-medium">
                    {label}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent
                                side="right"
                                className="max-w-xs text-xs"
                            >
                                {description}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className="text-muted-foreground tabular-nums">
                    {item.score.toFixed(0)}/100
                    <span className="ml-1 text-xs opacity-60">
                        (×{item.weight}% = {item.weighted.toFixed(1)})
                    </span>
                </span>
            </div>
            <Progress value={item.score} className="h-2" />
        </div>
    );
}

function MetaGrid({ meta }: { meta: CreditScoreMeta }) {
    const items = [
        { label: 'Total Loans', value: meta.total_loans },
        { label: 'Completed', value: meta.completed_loans },
        { label: 'Active', value: meta.active_loans },
        { label: 'Schedules', value: meta.total_schedules },
        { label: 'On Time', value: meta.on_time_payments },
        { label: 'Late', value: meta.late_payments },
        { label: 'Missed', value: meta.missed_payments },
        { label: 'Amount Due', value: formatCurrency(meta.total_amount_due) },
        { label: 'Paid', value: formatCurrency(meta.total_amount_paid) },
        { label: 'Overdue', value: formatCurrency(meta.overdue_amount) },
    ];

    return (
        <div className="grid grid-cols-2 gap-2 pt-2">
            {items.map((item) => (
                <div
                    key={item.label}
                    className="rounded-md border bg-muted/30 px-3 py-2 text-xs"
                >
                    <div className="text-muted-foreground">{item.label}</div>
                    <div className="font-semibold tabular-nums">
                        {item.value}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Compact badge (no card) ──────────────────────────────────────────────────

function CompactBadge({
    data,
    className,
}: {
    data: CreditScoreData;
    className?: string;
}) {
    const cfg = BAND_CONFIG[data.band];

    return (
        <Badge
            variant="outline"
            className={cn(
                'gap-1.5 text-sm font-semibold',
                cfg.bg,
                cfg.border,
                cfg.textColor,
                className,
            )}
        >
            <span className="tabular-nums">{data.score}</span>
            <span className="opacity-60">·</span>
            {data.band}
        </Badge>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CreditScoreBadge({
    borrowerId,
    compact = false,
    showBreakdown = false,
    apiBase = '/',
    className,
}: CreditScoreBadgeProps) {
    const [data, setData] = useState<CreditScoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const loadingTimer = window.setTimeout(() => {
            if (!cancelled) {
                setLoading(true);
                setError(null);
            }
        }, 0);

        fetch(`/borrowers/${borrowerId}/credit-score`, {
            headers: { Accept: 'application/json' },
        })
            .then((res) => {
                if (!res.ok) {
throw new Error(`HTTP ${res.status}`);
}

                return res.json() as Promise<CreditScoreData>;
            })
            .then((json) => {
                if (!cancelled) {
                    setData(json);
                    setLoading(false);
                }
            })
            .catch((err: Error) => {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
            window.clearTimeout(loadingTimer);
        };
    }, [borrowerId, apiBase]);

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        if (compact) {
return <Skeleton className="h-6 rounded-full" />;
}

        return (
            <Card className={cn('w-full', className)}>
                <CardHeader>
                    <Skeleton className="h-4" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="mx-auto h-12" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="mx-auto h-6 rounded-full" />
                </CardContent>
            </Card>
        );
    }

    // ── Error ──────────────────────────────────────────────────────────────────
    if (error || !data) {
        if (compact) {
return (
                <Badge variant="destructive" className={className}>
                    Error
                </Badge>
            );
}

        return (
            <Alert variant="destructive" className={cn('max-w-sm', className)}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Failed to load credit score: {error ?? 'Unknown error'}
                </AlertDescription>
            </Alert>
        );
    }

    // ── Compact mode ───────────────────────────────────────────────────────────
    if (compact) {
return <CompactBadge data={data} className={className} />;
}

    // ── Full card ──────────────────────────────────────────────────────────────
    return (
        <Card className={cn('w-full', className)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Credit Score</CardTitle>
                <CardDescription>Based on loan payment history</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                <ScoreGauge score={data.score} band={data.band} />

                {showBreakdown && (
                    <Collapsible open={open} onOpenChange={setOpen}>
                        <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            Score Breakdown
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 transition-transform',
                                    open && 'rotate-180',
                                )}
                            />
                        </CollapsibleTrigger>

                        <CollapsibleContent className="space-y-3 pt-3">
                            {(
                                Object.entries(data.breakdown) as [
                                    keyof CreditScoreData['breakdown'],
                                    CreditScoreBreakdownItem,
                                ][]
                            ).map(([key, item]) => (
                                <BreakdownRow
                                    key={key}
                                    label={FACTOR_LABELS[key]}
                                    description={FACTOR_DESCRIPTIONS[key]}
                                    item={item}
                                />
                            ))}

                            <MetaGrid meta={data.meta} />
                        </CollapsibleContent>
                    </Collapsible>
                )}
            </CardContent>
        </Card>
    );
}

export default CreditScoreBadge;
