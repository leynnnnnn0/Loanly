<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Due Notice</title>
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
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        .header {
            background-color: #b91c1c;
            padding: 28px 40px;
            text-align: center;
        }

        .header .notice-label {
            display: inline-block;
            background-color: #ffffff;
            color: #b91c1c;
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            letter-spacing: 0.5px;
        }

        .header p {
            color: #fca5a5;
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

        .due-box {
            background-color: #fef2f2;
            border: 2px solid #b91c1c;
            border-radius: 8px;
            padding: 20px 24px;
            margin: 24px 0;
            text-align: center;
        }

        .due-box .due-label {
            font-size: 11px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #b91c1c;
            margin-bottom: 6px;
        }

        .due-box .due-date {
            font-size: 26px;
            font-weight: bold;
            color: #111;
            margin: 4px 0;
        }

        .due-box .due-amount {
            font-size: 18px;
            color: #b91c1c;
            font-weight: bold;
            margin-top: 6px;
        }

        .loan-details {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 16px 20px;
            margin: 20px 0;
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

        .btn-wrap {
            text-align: center;
            margin: 28px 0;
        }

        .btn {
            display: inline-block;
            background-color: #b91c1c;
            color: #ffffff !important;
            text-decoration: none;
            padding: 13px 32px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            letter-spacing: 0.3px;
        }

        .warning-box {
            background-color: #fffbeb;
            border-left: 4px solid #d97706;
            border-radius: 4px;
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 13px;
            line-height: 1.6;
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

        {{-- Header — no logo --}}
        <div class="header">
            <div class="notice-label">Payment Notice</div>
            <h1>Payment Due Reminder</h1>
            <p>Please review your upcoming payment below.</p>
        </div>

        {{-- Body --}}
        <div class="body">

            <p>Dear <strong>{{ $name }}</strong>,</p>

            <p>
                We would like to remind you that a loan payment is coming up.
                Please make sure your payment is settled on or before the due date
                to avoid any penalties.
            </p>

            {{-- Due date highlight --}}
            <div class="due-box">
                <div class="due-label">Payment Due Date</div>
                <div class="due-date">{{ $dueDate }}</div>
                <div class="due-amount">PHP {{ $amount }}</div>
            </div>

            {{-- Loan details --}}
            <div class="loan-details">
                <div class="detail-row">
                    <span class="detail-label">Loan Number</span>
                    <span class="detail-value">{{ $contractNumber }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount Due</span>
                    <span class="detail-value">PHP {{ $amount }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Due Date</span>
                    <span class="detail-value">{{ $dueDate }}</span>
                </div>
            </div>
            
            <div class="warning-box">
                <strong>Avoid penalties.</strong>
                Late payments are subject to additional charges.
                Please settle your balance on or before <strong>{{ $dueDate }}</strong>.
            </div>

            {{-- CTA --}}
            <div class="btn-wrap">
                <a href="{{ url('/loans/' . $loanId) }}" class="btn">View Loan Details</a>
            </div>

            <p>
                If you have already made this payment, please disregard this notice.
                Thank you for your continued trust.
            </p>

            <p>
                Regards,<br>
                <strong>{{ $lenderName }}</strong>
            </p>

        </div>

        {{-- Footer --}}
        <div class="footer">
            <p>
                This is an automated payment reminder. Please do not reply to this email.<br>
                {{ $lenderName }}
            </p>
        </div>

    </div>
</body>

</html>