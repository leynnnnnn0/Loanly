<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loan Approved</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #333;
        }

        .wrapper {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .header {
            background-color: #1a472a;
            padding: 30px 40px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
        }

        .header p {
            color: #a8d5b5;
            margin: 6px 0 0 0;
            font-size: 13px;
        }

        .body {
            padding: 36px 40px;
        }

        .body p {
            line-height: 1.7;
            margin: 0 0 16px 0;
        }

        .loan-details {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 20px 24px;
            margin: 24px 0;
        }

        .loan-details h3 {
            margin: 0 0 14px 0;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #555;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
        }

        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #eeeeee;
            font-size: 13.5px;
        }

        .detail-row:last-child {
            border-bottom: none;
        }

        .detail-label {
            color: #666;
        }

        .detail-value {
            font-weight: bold;
            color: #222;
        }

        .notice-box {
            background-color: #fff8e1;
            border-left: 4px solid #f5a623;
            border-radius: 4px;
            padding: 14px 18px;
            margin: 24px 0;
            font-size: 13.5px;
            line-height: 1.7;
        }

        .notice-box strong {
            display: block;
            margin-bottom: 6px;
            font-size: 14px;
        }

        .notice-box ul {
            margin: 8px 0 0 0;
            padding-left: 20px;
        }

        .notice-box ul li {
            margin-bottom: 4px;
        }

        .footer {
            background-color: #f0f0f0;
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #888;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="wrapper">

        {{-- Header --}}
        <div class="header">
            <h1>Your Loan Has Been Approved!</h1>
            <p>Congratulations, {{ $loan->borrower->full_name }}</p>
        </div>

        {{-- Body --}}
        <div class="body">

            <p>Dear <strong>{{ $loan->borrower->full_name }}</strong>,</p>

            <p>
                We are pleased to inform you that your loan application has been
                <strong>approved</strong>. Please review the details below and follow the
                instructions to claim your loan proceeds.
            </p>

            {{-- Loan Details --}}
            <div class="loan-details">
                <h3>Loan Details</h3>

                <div class="detail-row">
                    <span class="detail-label">Loan Number: </span>
                    <span class="detail-value">{{ $loan->contract_number }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Loan Amount: </span>
                    <span class="detail-value">PHP {{ number_format($loan->amount, 2) }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Payable: </span>
                    <span class="detail-value">
                        PHP {{ number_format($loan->payment_schedules->sum('amount_due'), 2) }}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Frequency: </span>
                    <span class="detail-value">
                        @if($loan->payment_frequency === 'daily') Daily
                        @elseif($loan->payment_frequency === 'weekly') Weekly
                        @elseif($loan->payment_frequency === 'twice_monthly') Semi-Monthly
                        @elseif($loan->payment_frequency === 'monthly') Monthly
                        @endif
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">First Payment Date: </span>
                    <span class="detail-value">
                        {{ \Carbon\Carbon::parse($loan->payment_schedules->first()?->due_date)->format('F d, Y') }}
                    </span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Maturity Date</span>
                    <span class="detail-value">
                        {{ \Carbon\Carbon::parse($loan->payment_schedules->last()?->due_date)->format('F d, Y') }}
                    </span>
                </div>
            </div>

            {{-- Important Notice --}}
            <div class="notice-box">
                <strong>Important — How to Claim Your Loan</strong>
                To receive your loan proceeds, please come to our office and bring the following:
                <ul>
                    <li><strong>This email</strong> or a printed copy of it</li>
                    <li>
                        <strong>The attached Promissory Note</strong> — printed and complete
                        (both the note page and the schedule of payments page)
                    </li>
                    <li>A valid government-issued ID</li>
                </ul>
                <br>
                <strong>Funds will not be released without your signed Promissory Note.</strong>
                Please do not lose this document.
            </div>

            <p>
                If you have any questions or concerns, please don't hesitate to reach out to us
                directly. We look forward to seeing you soon.
            </p>

            <p>
                Thank you for choosing us.<br>
                <strong>{{ config('app.lender_name', 'Your Lending Company') }}</strong>
            </p>

        </div>

        {{-- Footer --}}
        <div class="footer">
            <p>
                This is an automated message. Please do not reply directly to this email.<br>
                {{ config('app.lender_name', 'Your Lending Company') }} &mdash;
                {{ config('app.url') }}
            </p>
        </div>

    </div>
</body>
</html>