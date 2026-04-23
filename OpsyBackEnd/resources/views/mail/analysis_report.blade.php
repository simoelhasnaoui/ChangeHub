<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Rapport post-changement</title>
</head>
<body style="margin:0;padding:24px;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1a1625;background:#f4f2f8;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e8e4ef;">
        <tr>
            <td style="padding:24px 28px;border-left:4px solid #6b5393;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b6578;">ChangeHub — rapport post-changement</p>
                <h1 style="margin:0;font-size:20px;font-weight:600;color:#14121a;">{{ $cr->title }}</h1>
                <p style="margin:12px 0 0;font-size:13px;color:#3d384d;">Réf. #{{ $cr->id }} · {{ $cr->changeType?->name ?? '—' }} · {{ $cr->affected_system ?? '—' }}</p>
            </td>
        </tr>
        <tr>
            <td style="padding:0 28px 20px;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b6578;">Synthèse</p>
                <p style="margin:0;padding:14px 16px;background:#f7f5fb;border-radius:8px;border:1px solid #e8e4ef;">
                    <strong>Incident :</strong> {{ $analysis->incident_occurred ? 'Oui' : 'Non' }}<br />
                    @if($analysis->description)<strong>Constat :</strong> {{ $analysis->description }}<br />@endif
                    @if($analysis->impact)<strong>Impact :</strong> {{ $analysis->impact }}<br />@endif
                    @if($analysis->solution)<strong>Solution :</strong> {{ $analysis->solution }}@endif
                </p>
            </td>
        </tr>
        @if($cr->incidents && $cr->incidents->count())
        <tr>
            <td style="padding:0 28px 24px;">
                <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;color:#6b6578;">Incidents</p>
                <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse;font-size:12px;">
                    <thead>
                        <tr style="background:#faf9fc;">
                            <th align="left" style="border-bottom:1px solid #e8e4ef;">Titre</th>
                            <th align="left" style="border-bottom:1px solid #e8e4ef;">Gravité</th>
                            <th align="left" style="border-bottom:1px solid #e8e4ef;">Délai (min)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($cr->incidents as $inc)
                        <tr>
                            <td style="border-bottom:1px solid #f4f2f8;">{{ $inc->title }}</td>
                            <td style="border-bottom:1px solid #f4f2f8;">{{ $inc->severity }}</td>
                            <td style="border-bottom:1px solid #f4f2f8;">{{ $inc->time_to_resolve_minutes }}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>
        </tr>
        @endif
        <tr>
            <td style="padding:16px 28px 24px;border-top:1px solid #e8e4ef;font-size:12px;color:#6b6578;">
                <p style="margin:0;">Description initiale du dossier :</p>
                <p style="margin:8px 0 0;white-space:pre-wrap;">{{ $cr->description }}</p>
                @if(!empty($openUrl))
                <p style="margin:20px 0 0;">
                    <a href="{{ $openUrl }}" style="display:inline-block;padding:10px 18px;background:#6b5393;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:12px;">Ouvrir dans ChangeHub</a>
                </p>
                @endif
            </td>
        </tr>
    </table>
</body>
</html>
