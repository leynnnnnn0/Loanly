<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promissory Note - {{ $loan->contract_number ?? 'LN00000001' }}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #000;
            max-width: 210mm;
            margin: 0 auto;
            padding: 10mm;
        }

        /* ── NOTICE BANNER ── */
        .claim-notice {
            border: 3px solid #000;
            background-color: #fff8e1;
            padding: 14px 18px;
            margin-bottom: 22px;
            text-align: center;
        }

        .claim-notice .notice-title {
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
        }

        .claim-notice p {
            font-size: 10.5pt;
            line-height: 1.7;
        }

        .claim-notice strong {
            text-decoration: underline;
        }

        /* ── HEADER ── */
        .header {
            text-align: center;
            margin-bottom: 22px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .header h1 {
            font-size: 18pt;
            font-weight: bold;
            letter-spacing: 2px;
            margin-bottom: 5px;
        }

        /* ── INFO SECTION ── */
        .info-section {
            margin-bottom: 22px;
        }

        .info-row {
            display: flex;
            margin-bottom: 8px;
        }

        .info-label {
            font-weight: bold;
            width: 100px;
            flex-shrink: 0;
        }

        .info-value {
            flex-grow: 1;
            border-bottom: 1px solid #000;
            padding-left: 10px;
        }

        /* ── PROMISE TEXT ── */
        .promise-text {
            margin: 22px 0;
            padding: 15px;
            border: 2px solid #000;
            text-align: justify;
            line-height: 1.8;
        }

        /* ── TERMS ── */
        .terms-section {
            margin: 22px 0;
        }

        .term-item {
            display: flex;
            margin-bottom: 12px;
            text-align: justify;
        }

        .term-number {
            font-weight: bold;
            width: 180px;
            flex-shrink: 0;
        }

        .term-content {
            flex-grow: 1;
        }

        /* ── LEGAL TEXT ── */
        .legal-text {
            margin: 22px 0;
            text-align: justify;
            line-height: 1.8;
        }

        /* ── SIGNATURE ── */
        .signature-section {
            margin-top: 40px;
            margin-bottom: 40px;
        }

        .signature-block {
            margin-bottom: 30px;
        }

        .signature-line {
            border-top: 1px solid #000;
            width: 300px;
            margin-top: 40px;
            margin-bottom: 5px;
        }

        .signature-label {
            font-weight: bold;
            margin-bottom: 3px;
        }

        /* ── PAGE BREAK ── */
        .page-break {
            page-break-after: always;
        }

        /* ── SCHEDULE ── */
        .schedule-header {
            text-align: center;
            margin: 40px 0 25px 0;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 15px 0;
        }

        .schedule-header h2 {
            font-size: 16pt;
            font-weight: bold;
            letter-spacing: 2px;
        }

        .schedule-info {
            background-color: #f5f5f5;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
        }

        .schedule-info-row {
            display: flex;
            padding: 5px 0;
        }

        .schedule-info-label {
            font-weight: bold;
            width: 180px;
        }

        .schedule-info-value {
            flex-grow: 1;
        }

        /* ── PAYMENT TABLE ── */
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        .payment-table th {
            background-color: #333;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            border: 1px solid #000;
        }

        .payment-table td {
            padding: 8px;
            border: 1px solid #000;
            text-align: center;
        }

        .payment-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .amount-cell {
            text-align: right;
            font-weight: bold;
        }

        /* ── FOOTER REMINDER (schedule page) ── */
        .schedule-footer-notice {
            margin-top: 30px;
            border: 2px dashed #000;
            padding: 12px 16px;
            text-align: center;
            font-size: 10.5pt;
            line-height: 1.7;
        }

        .schedule-footer-notice strong {
            font-size: 11pt;
            text-transform: uppercase;
        }

        @media print {
            body { padding: 0; }
            .page-break { page-break-after: always; }
        }
    </style>
</head>
<body>

    {{-- ══════════════════════════════════════════════════════════════════════
         PROMISSORY NOTE
    ══════════════════════════════════════════════════════════════════════ --}}
    <div class="header">
        <h1>PROMISSORY NOTE</h1>
    </div>

    <div class="info-section">
        <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">
                {{ \Carbon\Carbon::parse($loan->transaction_date ?? now())->format('F d, Y') }}
            </span>
        </div>
        <div class="info-row">
            <span class="info-label">Loan No.:</span>
            <span class="info-value">{{ $loan->contract_number ?? 'LN00000001' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Place:</span>
            <span class="info-value">{{ $borrower->address ?? '_____________________________' }}</span>
        </div>
    </div>

    <div class="promise-text">
        I, <strong>{{ strtoupper($borrower->full_name) }}</strong>, of legal age, with residence at
        <strong>{{ $borrower->address ?? '_____________________________' }}</strong>, hereby promise to pay
        the sum of <strong>{{ strtoupper($loan->total_amount_words ?? '') }}</strong>
        (<strong>PHP {{ number_format($loan->total_amount ?? ($loan->amount ?? 0), 2) }}</strong>),
        payable under the following terms and conditions:
    </div>

    <div class="terms-section">
        <div class="term-item">
            <span class="term-number">1. Loan Amount:</span>
            <span class="term-content">PHP {{ number_format($loan->amount ?? 0, 2) }}</span>
        </div>

        <div class="term-item">
            <span class="term-number">2. Interest Rate:</span>
            <span class="term-content">
                @if($loan->interest_type === 'percentage')
                    {{ $loan->interest_value }}%
                @else
                    PHP {{ number_format($loan->interest_value, 2) }}
                @endif
                @if($loan->interest_period === 'per_day')
                    per day
                @elseif($loan->interest_period === 'per_week')
                    per week
                @elseif($loan->interest_period === 'per_month')
                    per month
                @else
                    (one-time)
                @endif
                payable in
                {{ $loan->payment_schedules->count() }}
                @if($loan->payment_frequency === 'daily') daily
                @elseif($loan->payment_frequency === 'weekly') weekly
                @elseif($loan->payment_frequency === 'twice_monthly') semi-monthly
                @elseif($loan->payment_frequency === 'monthly') monthly
                @endif
                installments
            </span>
        </div>

        <div class="term-item">
            <span class="term-number">3. Payment Schedule:</span>
            <span class="term-content">
                Payments shall be made
                @if($loan->payment_frequency === 'daily') daily
                @elseif($loan->payment_frequency === 'weekly') weekly
                @elseif($loan->payment_frequency === 'twice_monthly') twice a month
                @elseif($loan->payment_frequency === 'monthly') monthly
                @endif
                starting on
                {{ \Carbon\Carbon::parse($loan->payment_schedules->first()?->due_date ?? now())->format('F d, Y') }},
                until full settlement on or before
                {{ \Carbon\Carbon::parse($loan->payment_schedules->last()?->due_date ?? now())->format('F d, Y') }}.
            </span>
        </div>

        <div class="term-item">
            <span class="term-number">4. Maturity Date:</span>
            <span class="term-content">
                The loan shall be fully paid on or before
                <strong>{{ \Carbon\Carbon::parse($loan->payment_schedules->last()?->due_date ?? now())->format('F d, Y') }}</strong>.
            </span>
        </div>

        <div class="term-item">
            <span class="term-number">5. Penalty:</span>
            <span class="term-content">
                A penalty shall be charged on any overdue payment as determined by the lender.
            </span>
        </div>
    </div>


    <div class="legal-text">
        This Promissory Note is signed voluntarily and with full understanding of its terms and
        conditions. I acknowledge that I have read and understood all provisions hereof.
    </div>

    <div class="signature-section">
        <div class="signature-block">
            <div class="signature-label">Borrower's Signature:</div>
            <div class="signature-line"></div>
            <div class="signature-label">Printed Name:</div>
            <div>{{ strtoupper($borrower->full_name) }}</div>
        </div>

        <div class="signature-block">
            <div class="signature-label">Lender's Representative:</div>
            <div class="signature-line"></div>
            <div class="signature-label">Printed Name:</div>
            <div>{{ strtoupper($lender->business_name ?? '') }}</div>
        </div>
    </div>

    {{-- PAGE BREAK --}}
    <div class="page-break"></div>

    {{-- ══════════════════════════════════════════════════════════════════════
         SCHEDULE OF PAYMENTS
    ══════════════════════════════════════════════════════════════════════ --}}
    <div class="schedule-header">
        <h2>SCHEDULE OF PAYMENTS</h2>
    </div>

    <div class="schedule-info">
        <div class="schedule-info-row">
            <span class="schedule-info-label">Name:</span>
            <span class="schedule-info-value">{{ strtoupper($borrower->full_name) }}</span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Loan Date:</span>
            <span class="schedule-info-value">
                {{ \Carbon\Carbon::parse($loan->transaction_date ?? now())->format('F d, Y') }}
            </span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Loan Number:</span>
            <span class="schedule-info-value">{{ $loan->contract_number ?? 'LN00000001' }}</span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Loan Amount:</span>
            <span class="schedule-info-value">PHP {{ number_format($loan->amount ?? 0, 2) }}</span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Total Payable:</span>
            <span class="schedule-info-value">
                PHP {{ number_format($loan->payment_schedules->sum('amount_due'), 2) }}
            </span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Payment Frequency:</span>
            <span class="schedule-info-value">
                @if($loan->payment_frequency === 'daily') Daily
                @elseif($loan->payment_frequency === 'weekly') Weekly
                @elseif($loan->payment_frequency === 'twice_monthly') Semi-Monthly
                @elseif($loan->payment_frequency === 'monthly') Monthly
                @endif
            </span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Number of Payments:</span>
            <span class="schedule-info-value">{{ $loan->payment_schedules->count() }}</span>
        </div>
        <div class="schedule-info-row">
            <span class="schedule-info-label">Amount per Payment:</span>
            <span class="schedule-info-value">
                PHP {{ number_format($loan->payment_schedules->first()?->amount_due ?? 0, 2) }}
            </span>
        </div>
    </div>

    <table class="payment-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Due Date</th>
                <th>Amount Due (PHP)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($loan->payment_schedules->sortBy('due_date') as $index => $payment)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($payment->due_date)->format('F d, Y') }}</td>
                    <td class="amount-cell">{{ number_format($payment->amount_due, 2) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="3" style="text-align:center;">No payment schedule available.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    {{-- Bottom reminder on the schedule page --}}
    <div class="schedule-footer-notice">
        <strong>Reminder:</strong> Please bring this document (both pages, printed and complete)
        when you come to claim your loan. <strong>Funds will not be released</strong> without your
        signed Promissory Note. Thank you.
    </div>

</body>
</html>