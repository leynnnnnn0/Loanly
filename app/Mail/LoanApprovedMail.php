<?php

namespace App\Mail;

use App\Models\Loan;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LoanApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    protected ?string $pdfContent = null;

    public function __construct(public Loan $loan)
    {
        //
    }

    public function withPdfContent(string $content): static
    {
        $this->pdfContent = $content;

        return $this;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Loan Approved – {$this->loan->contract_number}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.loan-approved',
        );
    }

    public function attachments(): array
    {
        if (! $this->pdfContent) {
            return [];
        }

        return [
            Attachment::fromData(
                fn () => base64_decode($this->pdfContent),
                "Promissory-Note-{$this->loan->contract_number}.pdf"
            )->withMime('application/pdf'),
        ];
    }
}
