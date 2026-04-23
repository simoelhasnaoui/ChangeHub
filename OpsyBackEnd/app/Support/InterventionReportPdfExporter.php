<?php

namespace App\Support;

use App\Models\ChangeRequest;
use App\Models\PostChangeAnalysis;

/**
 * PDF identique au rapport d'intervention (generateReport côté SPA) — email & téléchargement.
 */
final class InterventionReportPdfExporter
{
    public static function binary(ChangeRequest $cr, PostChangeAnalysis $analysis): string
    {
        $cr->loadMissing(['changeType', 'requester', 'implementers', 'incidents', 'histories.user']);

        $generatedAt = now()->locale('fr')->isoFormat('D MMMM YYYY [à] LT');

        /** @var \Barryvdh\DomPDF\PDF $pdf */
        $pdf = app('dompdf.wrapper');

        return $pdf->loadView('pdf.intervention_report', [
            'cr' => $cr,
            'analysis' => $analysis,
            'generatedAt' => $generatedAt,
        ])->setPaper('a4', 'portrait')->output();
    }
}
