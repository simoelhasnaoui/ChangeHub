<?php

namespace App\Mail;

use App\Models\ChangeRequest;
use App\Models\PostChangeAnalysis;
use App\Support\InterventionReportPdfExporter;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ChangeRequestAnalysisReportMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public ChangeRequest $cr,
        public PostChangeAnalysis $analysis,
        public ?string $openUrl = null,
        public bool $attachPostChangePdf = false,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'ChangeHub — Rapport post-changement : '.$this->cr->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            html: 'mail.analysis_report',
            with: [
                'cr' => $this->cr,
                'analysis' => $this->analysis,
                'openUrl' => $this->openUrl,
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        if (! $this->attachPostChangePdf) {
            return [];
        }

        $filename = 'rapport-intervention-'.$this->cr->id.'.pdf';

        return [
            Attachment::fromData(
                fn () => InterventionReportPdfExporter::binary($this->cr, $this->analysis),
                $filename,
                ['mime' => 'application/pdf'],
            ),
        ];
    }
}
