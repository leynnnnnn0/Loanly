@component('mail::message')
# Loan Approved

Hi {{ $loan->borrower->first_name }},

Your loan application has been approved. Here are your details:

| Detail | Value |
|---|---|
| Contract # | {{ $loan->contract_number }} |
| Amount | ₱{{ number_format($loan->amount, 2) }} |
| Frequency | {{ ucfirst($loan->payment_frequency) }} |
| Duration | {{ $loan->loan_duration }} {{ $loan->duration_unit }} |

Please log in to your account to view your payment schedule.

@component('mail::button', ['url' => config('app.url')])
View My Loan
@endcomponent

Thanks,
{{ config('app.name') }}
@endcomponent