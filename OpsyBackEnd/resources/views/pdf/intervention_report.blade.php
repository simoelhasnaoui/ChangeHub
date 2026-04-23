<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Rapport · {{ $cr->title }}</title>
    <style>
        :root {
            --ink: #14121a;
            --ink-soft: #3d384d;
            --muted: #6b6578;
            --line: #e8e4ef;
            --wash: #f7f5fb;
            --accent: #6b5393;
            --accent-soft: rgba(107, 83, 147, 0.12);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: DejaVu Sans, Helvetica, Arial, sans-serif;
            color: var(--ink);
            background: #ece8f2;
            padding: 20px 16px 28px;
            font-size: 11px;
            line-height: 1.5;
        }
        .sheet {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border-radius: 2px;
            box-shadow: 0 1px 0 rgba(20, 18, 26, 0.06), 0 12px 40px rgba(20, 18, 26, 0.08);
            overflow: hidden;
        }
        .hero {
            position: relative;
            padding: 28px 32px 24px;
            background: #faf9fc;
            border-bottom: 1px solid var(--line);
        }
        .hero::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
            background: #6b5393;
        }
        .eyebrow { margin-bottom: 12px; }
        .eyebrow .k {
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
        }
        .ref {
            font-size: 10px;
            font-weight: 600;
            color: var(--accent);
            background: var(--accent-soft);
            padding: 4px 10px;
            border-radius: 999px;
            margin-left: 8px;
        }
        h1 {
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.02em;
            line-height: 1.2;
            color: var(--ink);
        }
        .sub {
            margin-top: 10px;
            font-size: 11px;
            color: var(--muted);
        }
        .summary { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--line); }
        .pill {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 600;
            border: 1px solid transparent;
            margin-right: 8px;
            margin-bottom: 6px;
        }
        .pill .tag { font-weight: 500; color: var(--muted); font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; margin-right: 6px; }
        .pill--muted { background: #f4f4f5; color: #3f3f46; border-color: #e4e4e7; }
        .pill--amber { background: #fffbeb; color: #92400e; border-color: #fde68a; }
        .pill--blue { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
        .pill--violet { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }
        .pill--green { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .pill--rose { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }
        .pill--risk-low { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .pill--risk-mid { background: #fffbeb; color: #a16207; border-color: #fde68a; }
        .pill--risk-high { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

        main { padding: 6px 32px 28px; }
        .block { margin-top: 22px; }
        .block__head {
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid var(--line);
        }
        .block__title {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
        }
        .field-table { width: 100%; border-collapse: collapse; }
        .field-table td {
            width: 50%;
            vertical-align: top;
            padding: 0 8px 10px 0;
            border-bottom: 1px solid #f4f2f8;
        }
        .field { padding: 8px 0; }
        .field__k { color: var(--muted); font-size: 10px; font-weight: 500; display: block; margin-bottom: 2px; }
        .field__v { color: var(--ink); font-weight: 600; font-size: 11px; }

        .panel {
            background: var(--wash);
            border: 1px solid var(--line);
            border-radius: 8px;
            padding: 14px 16px;
            font-size: 11px;
            line-height: 1.55;
            color: var(--ink-soft);
            white-space: pre-wrap;
            word-break: break-word;
        }

        .outcome {
            border-radius: 8px;
            padding: 12px 14px;
            margin-bottom: 12px;
            font-size: 11px;
        }
        .outcome--ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d; }
        .outcome--warn { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }

        .stack { margin-bottom: 12px; }
        .mini-label {
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 4px;
        }
        .body-text {
            font-size: 11px;
            color: var(--ink-soft);
            white-space: pre-wrap;
            word-break: break-word;
        }

        .table-wrap {
            border: 1px solid var(--line);
            border-radius: 8px;
            overflow: hidden;
        }
        table.data { width: 100%; border-collapse: collapse; font-size: 10.5px; }
        table.data thead { background: #faf9fc; }
        table.data th {
            text-align: left;
            padding: 8px 10px;
            font-weight: 600;
            font-size: 9px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--muted);
            border-bottom: 1px solid var(--line);
        }
        table.data td {
            padding: 8px 10px;
            border-bottom: 1px solid #f4f2f8;
            vertical-align: top;
        }
        table.data tbody tr:last-child td { border-bottom: none; }
        .muted { color: var(--muted); }
        .nowrap { white-space: nowrap; }
        .tx { color: var(--muted); }
        .tx-strong { font-weight: 600; color: var(--ink); }
        .arrow { color: #c4bdd4; }

        .sev {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .sev--critical { background: #fef2f2; color: #991b1b; }
        .sev--high { background: #fef2f2; color: #b91c1c; }
        .sev--medium { background: #fffbeb; color: #b45309; }
        .sev--low { background: #f0fdf4; color: #166534; }
        .sev--sev { background: #f4f4f5; color: #52525b; }

        footer {
            padding: 16px 32px 20px;
            border-top: 1px solid var(--line);
            font-size: 9px;
            color: var(--muted);
            background: #faf9fc;
        }
        footer strong { color: var(--ink-soft); font-weight: 600; }
    </style>
</head>
<body>
@php
    $statusLabels = [
        'draft' => 'Brouillon',
        'pending_approval' => "En attente d'approbation",
        'approved' => 'Approuvé',
        'in_progress' => 'En cours',
        'done' => 'Terminé',
        'rejected' => 'Rejeté',
    ];
    $riskLabels = ['low' => 'Faible', 'medium' => 'Moyen', 'high' => 'Élevé'];
    $statusClass = [
        'draft' => 'pill--muted',
        'pending_approval' => 'pill--amber',
        'approved' => 'pill--blue',
        'in_progress' => 'pill--violet',
        'done' => 'pill--green',
        'rejected' => 'pill--rose',
    ][$cr->status] ?? 'pill--muted';
    $riskClass = [
        'low' => 'pill--risk-low',
        'medium' => 'pill--risk-mid',
        'high' => 'pill--risk-high',
    ][$cr->risk_level] ?? 'pill--muted';
    $statusLabel = $statusLabels[$cr->status] ?? $cr->status;
    $riskLabel = $riskLabels[$cr->risk_level] ?? ($cr->risk_level ?? '—');
    $planned = $cr->planned_date ? \Illuminate\Support\Carbon::parse($cr->planned_date)->locale('fr')->isoFormat('D MMMM YYYY') : '—';
    $implNames = $cr->implementers && $cr->implementers->count()
        ? $cr->implementers->pluck('name')->filter()->join(', ')
        : '—';
    $fieldPairs = [
        [['k' => 'Référence', 'v' => '#'.$cr->id], ['k' => 'Type de changement', 'v' => $cr->changeType?->name ?? '—']],
        [['k' => 'Système affecté', 'v' => $cr->affected_system ?? '—'], ['k' => 'Date planifiée', 'v' => $planned]],
        [['k' => 'Demandeur', 'v' => $cr->requester?->name ?? '—'], ['k' => 'Implémentation', 'v' => $implNames]],
        [['k' => 'Ouverture du dossier', 'v' => $cr->created_at ? $cr->created_at->locale('fr')->isoFormat('L LT') : '—'], null],
    ];
@endphp
    <article class="sheet">
        <header class="hero">
            <div class="eyebrow">
                <span class="k">Rapport d'intervention</span>
                <span class="ref">#{{ $cr->id }}</span>
            </div>
            <h1>{{ $cr->title }}</h1>
            <p class="sub">ChangeHub · document généré le {{ $generatedAt }}</p>
            <div class="summary">
                <span class="pill {{ $statusClass }}"><span class="tag">Statut</span>{{ $statusLabel }}</span>
                <span class="pill {{ $riskClass }}"><span class="tag">Risque</span>{{ $riskLabel }}</span>
            </div>
        </header>

        <main>
            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Fiche signalétique</h2>
                </div>
                <table class="field-table">
                    @foreach ($fieldPairs as $pair)
                    <tr>
                        @foreach ([0, 1] as $idx)
                        <td>
                            @if (!empty($pair[$idx]))
                            <div class="field">
                                <span class="field__k">{{ $pair[$idx]['k'] }}</span>
                                <span class="field__v">{{ $pair[$idx]['v'] }}</span>
                            </div>
                            @endif
                        </td>
                        @endforeach
                    </tr>
                    @endforeach
                </table>
            </section>

            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Description de la demande</h2>
                </div>
                <div class="panel">{{ $cr->description ?: '—' }}</div>
            </section>

            @if ($analysis)
            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Analyse post-changement</h2>
                </div>
                <div class="{{ $analysis->incident_occurred ? 'outcome outcome--warn' : 'outcome outcome--ok' }}">
                    <strong>{{ $analysis->incident_occurred ? 'Incident constaté après la mise en production.' : 'Aucun incident signalé après la mise en production.' }}</strong>
                </div>
                @if ($analysis->description)
                <div class="stack">
                    <span class="mini-label">Constat</span>
                    <p class="body-text">{{ $analysis->description }}</p>
                </div>
                @endif
                @if ($analysis->impact)
                <div class="stack">
                    <span class="mini-label">Impact</span>
                    <p class="body-text">{{ $analysis->impact }}</p>
                </div>
                @endif
                @if ($analysis->solution)
                <div class="stack">
                    <span class="mini-label">Mesures / solution</span>
                    <p class="body-text">{{ $analysis->solution }}</p>
                </div>
                @endif
            </section>
            @endif

            @if ($cr->incidents && $cr->incidents->count() > 0)
            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Incidents liés</h2>
                </div>
                <div class="table-wrap">
                    <table class="data">
                        <thead>
                            <tr>
                                <th style="width:20%">Intitulé</th>
                                <th style="width:11%">Gravité</th>
                                <th>Description</th>
                                <th style="width:16%">Résolution / TTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($cr->incidents as $inc)
                            @php
                                $sev = $inc->severity ?? '';
                                $sevClass = $sev === 'critical' ? 'sev--critical' : (in_array($sev, ['high'], true) ? 'sev--high' : ($sev === 'medium' ? 'sev--medium' : ($sev === 'low' ? 'sev--low' : 'sev--sev')));
                            @endphp
                            <tr>
                                <td><strong>{{ $inc->title }}</strong></td>
                                <td><span class="sev {{ $sevClass }}">{{ $sev }}</span></td>
                                <td class="muted">{{ $inc->description ?? '—' }}</td>
                                <td>
                                    @if($inc->resolution)<span>{{ $inc->resolution }}</span>@endif
                                    @if($inc->time_to_resolve_minutes !== null)
                                        <span class="muted">@if($inc->resolution)<br/>@endif{{ $inc->time_to_resolve_minutes }} min</span>
                                    @elseif(!$inc->resolution)
                                        —
                                    @endif
                                </td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </section>
            @endif

            @if ($cr->relationLoaded('histories') && $cr->histories && $cr->histories->count() > 0)
            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Journal des statuts</h2>
                </div>
                <div class="table-wrap">
                    <table class="data">
                        <thead>
                            <tr>
                                <th style="width:17%">Horodatage</th>
                                <th style="width:14%">Acteur</th>
                                <th style="width:24%">Transition</th>
                                <th>Commentaire</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach ($cr->histories as $h)
                            @php
                                $oldS = $statusLabels[$h->old_status] ?? ($h->old_status ?? '—');
                                $newS = $statusLabels[$h->new_status] ?? ($h->new_status ?? '—');
                            @endphp
                            <tr>
                                <td class="nowrap">{{ $h->created_at?->locale('fr')->isoFormat('L LT') }}</td>
                                <td>{{ $h->user?->name ?? '—' }}</td>
                                <td><span class="tx">{{ $oldS }}</span> <span class="arrow">→</span> <span class="tx-strong">{{ $newS }}</span></td>
                                <td class="muted">{{ $h->comment ?? '—' }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </section>
            @endif
        </main>

        <footer>
            <span><strong>ChangeHub</strong> — traçabilité des changements</span>
            <span>Réf. dossier #{{ $cr->id }}</span>
        </footer>
    </article>
</body>
</html>
