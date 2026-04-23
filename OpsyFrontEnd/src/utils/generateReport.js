/**
 * Print-ready HTML report: change request + analysis, incidents, history.
 */

function escapeHtml(s) {
    if (s == null) return ''
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function implementersLine(cr) {
    if (cr.implementers?.length) {
        return cr.implementers.map((u) => u.name).filter(Boolean).join(', ') || '—'
    }
    return cr.implementer?.name || '—'
}

const STATUS_PILL = {
    draft: 'pill pill--muted',
    pending_approval: 'pill pill--amber',
    approved: 'pill pill--blue',
    in_progress: 'pill pill--violet',
    done: 'pill pill--green',
    rejected: 'pill pill--rose',
}

const RISK_PILL = {
    low: 'pill pill--risk-low',
    medium: 'pill pill--risk-mid',
    high: 'pill pill--risk-high',
}

export function generateReport(cr, analysis) {
    const statusLabels = {
        draft: 'Brouillon',
        pending_approval: 'En attente d\'approbation',
        approved: 'Approuvé',
        in_progress: 'En cours',
        done: 'Terminé',
        rejected: 'Rejeté',
    }

    const riskLabels = {
        low: 'Faible',
        medium: 'Moyen',
        high: 'Élevé',
    }

    const title = escapeHtml(cr.title)
    const now = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
    const plannedDate = cr.planned_date
        ? new Date(cr.planned_date).toLocaleDateString('fr-FR', { dateStyle: 'long' })
        : '—'

    const statusLabel = statusLabels[cr.status] || cr.status
    const riskLabel = riskLabels[cr.risk_level] || cr.risk_level || '—'
    const statusClass = STATUS_PILL[cr.status] || 'pill pill--muted'
    const riskClass = RISK_PILL[cr.risk_level] || 'pill pill--muted'

    const fields = [
        { k: 'Référence', v: `#${cr.id}` },
        { k: 'Type de changement', v: cr.change_type?.name || '—' },
        { k: 'Système affecté', v: cr.affected_system || '—' },
        { k: 'Date planifiée', v: plannedDate },
        { k: 'Demandeur', v: cr.requester?.name || '—' },
        { k: 'Implémentation', v: implementersLine(cr) },
        { k: 'Ouverture du dossier', v: new Date(cr.created_at).toLocaleString('fr-FR') },
    ]

    const fieldsHtml = fields
        .map(
            ({ k, v }) => `
            <div class="field">
                <span class="field__k">${escapeHtml(k)}</span>
                <span class="field__v">${escapeHtml(v)}</span>
            </div>`
        )
        .join('')

    const desc = cr.description ? escapeHtml(cr.description) : '—'

    const analysisOutcomeClass = analysis?.incident_occurred ? 'outcome outcome--warn' : 'outcome outcome--ok'
    const analysisOutcomeText = analysis?.incident_occurred
        ? 'Incident constaté après la mise en production.'
        : 'Aucun incident signalé après la mise en production.'

    const analysisHtml = analysis
        ? `
    <section class="block">
        <div class="block__head">
            <h2 class="block__title">Analyse post-changement</h2>
        </div>
        <div class="${analysisOutcomeClass}">
            <strong>${escapeHtml(analysisOutcomeText)}</strong>
        </div>
        ${analysis.description ? `<div class="stack"><span class="mini-label">Constat</span><p class="body-text">${escapeHtml(analysis.description)}</p></div>` : ''}
        ${analysis.impact ? `<div class="stack"><span class="mini-label">Impact</span><p class="body-text">${escapeHtml(analysis.impact)}</p></div>` : ''}
        ${analysis.solution ? `<div class="stack"><span class="mini-label">Mesures / solution</span><p class="body-text">${escapeHtml(analysis.solution)}</p></div>` : ''}
    </section>`
        : ''

    const incidentsHtml =
        cr.incidents && cr.incidents.length > 0
            ? `
    <section class="block">
        <div class="block__head">
            <h2 class="block__title">Incidents liés</h2>
        </div>
        <div class="table-wrap">
            <table class="data">
                <thead>
                    <tr>
                        <th scope="col" style="width:22%">Intitulé</th>
                        <th scope="col" style="width:12%">Gravité</th>
                        <th scope="col">Description</th>
                        <th scope="col" style="width:14%">Résolution</th>
                    </tr>
                </thead>
                <tbody>
                    ${cr.incidents
                        .map(
                            (inc) => `
                    <tr>
                        <td><strong>${escapeHtml(inc.title)}</strong></td>
                        <td><span class="sev sev--${escapeHtml(inc.severity || '')}">${escapeHtml(inc.severity || '—')}</span></td>
                        <td class="muted">${escapeHtml(inc.description || '—')}</td>
                        <td>${inc.time_to_resolve_minutes != null ? `${escapeHtml(String(inc.time_to_resolve_minutes))} min` : '—'}</td>
                    </tr>`
                        )
                        .join('')}
                </tbody>
            </table>
        </div>
    </section>`
            : ''

    const historyHtml =
        cr.histories && cr.histories.length > 0
            ? `
    <section class="block">
        <div class="block__head">
            <h2 class="block__title">Journal des statuts</h2>
        </div>
        <div class="table-wrap">
            <table class="data">
                <thead>
                    <tr>
                        <th scope="col" style="width:18%">Horodatage</th>
                        <th scope="col" style="width:16%">Acteur</th>
                        <th scope="col" style="width:26%">Transition</th>
                        <th scope="col">Commentaire</th>
                    </tr>
                </thead>
                <tbody>
                    ${cr.histories
                        .map((h) => {
                            const oldS = statusLabels[h.old_status] || h.old_status || '—'
                            const newS = statusLabels[h.new_status] || h.new_status || '—'
                            return `
                    <tr>
                        <td class="nowrap">${escapeHtml(new Date(h.created_at).toLocaleString('fr-FR'))}</td>
                        <td>${escapeHtml(h.user?.name || '—')}</td>
                        <td><span class="tx">${escapeHtml(oldS)}</span> <span class="arrow">→</span> <span class="tx-strong">${escapeHtml(newS)}</span></td>
                        <td class="muted">${escapeHtml(h.comment || '—')}</td>
                    </tr>`
                        })
                        .join('')}
                </tbody>
            </table>
        </div>
    </section>`
            : ''

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rapport · ${title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
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
            font-family: "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif;
            color: var(--ink);
            background: #ece8f2;
            min-height: 100vh;
            padding: 28px 20px 40px;
            font-size: 12.5px;
            line-height: 1.55;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            padding: 36px 40px 32px;
            background: linear-gradient(165deg, #faf9fc 0%, #fff 48%);
            border-bottom: 1px solid var(--line);
        }
        .hero::before {
            content: "";
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            width: 5px;
            background: linear-gradient(180deg, var(--accent) 0%, #9b7ec4 100%);
        }
        .eyebrow {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 14px;
        }
        .eyebrow span.k {
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: var(--muted);
        }
        .ref {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.04em;
            color: var(--accent);
            background: var(--accent-soft);
            padding: 5px 11px;
            border-radius: 999px;
        }
        h1 {
            font-family: "IBM Plex Serif", Georgia, serif;
            font-size: 26px;
            font-weight: 500;
            letter-spacing: -0.03em;
            line-height: 1.2;
            color: var(--ink);
            max-width: 34em;
        }
        .sub {
            margin-top: 12px;
            font-size: 12px;
            color: var(--muted);
        }
        .summary {
            display: flex;
            flex-wrap: wrap;
            gap: 10px 14px;
            margin-top: 22px;
            padding-top: 20px;
            border-top: 1px solid var(--line);
        }
        .pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid transparent;
        }
        .pill .tag { font-weight: 500; color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; }
        .pill--muted { background: #f4f4f5; color: #3f3f46; border-color: #e4e4e7; }
        .pill--amber { background: #fffbeb; color: #92400e; border-color: #fde68a; }
        .pill--blue { background: #eff6ff; color: #1e40af; border-color: #bfdbfe; }
        .pill--violet { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }
        .pill--green { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; }
        .pill--rose { background: #fff1f2; color: #9f1239; border-color: #fecdd3; }
        .pill--risk-low { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
        .pill--risk-mid { background: #fffbeb; color: #a16207; border-color: #fde68a; }
        .pill--risk-high { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }

        main { padding: 8px 40px 36px; }

        .block { margin-top: 28px; }
        .block__head {
            margin-bottom: 14px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--line);
        }
        .block__title {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
        }

        .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0 28px;
        }
        @media (max-width: 640px) {
            .grid { grid-template-columns: 1fr; }
        }
        .field {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 8px 16px;
            padding: 11px 0;
            border-bottom: 1px solid #f4f2f8;
        }
        .field__k { color: var(--muted); font-size: 11px; font-weight: 500; }
        .field__v { color: var(--ink); font-weight: 500; }

        .panel {
            background: var(--wash);
            border: 1px solid var(--line);
            border-radius: 10px;
            padding: 18px 20px;
        }
        .panel--prose {
            font-family: "IBM Plex Serif", Georgia, serif;
            font-size: 13px;
            line-height: 1.65;
            color: var(--ink-soft);
            white-space: pre-wrap;
            word-break: break-word;
        }

        .outcome {
            border-radius: 10px;
            padding: 14px 18px;
            margin-bottom: 16px;
            font-size: 12.5px;
            line-height: 1.5;
        }
        .outcome--ok { background: #f0fdf4; border: 1px solid #bbf7d0; color: #14532d; }
        .outcome--warn { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }

        .stack { margin-bottom: 14px; }
        .stack:last-child { margin-bottom: 0; }
        .mini-label {
            display: block;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 6px;
        }
        .body-text {
            font-family: "IBM Plex Serif", Georgia, serif;
            font-size: 12.5px;
            color: var(--ink-soft);
            white-space: pre-wrap;
            word-break: break-word;
        }

        .table-wrap {
            border: 1px solid var(--line);
            border-radius: 10px;
            overflow: hidden;
        }
        table.data { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        table.data thead { background: #faf9fc; }
        table.data th {
            text-align: left;
            padding: 10px 14px;
            font-weight: 600;
            font-size: 10px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--muted);
            border-bottom: 1px solid var(--line);
        }
        table.data td {
            padding: 12px 14px;
            border-bottom: 1px solid #f4f2f8;
            vertical-align: top;
        }
        table.data tbody tr:last-child td { border-bottom: none; }
        table.data tbody tr:nth-child(even) { background: #fcfbfe; }
        .muted { color: var(--muted); }
        .nowrap { white-space: nowrap; }
        .tx { color: var(--muted); }
        .tx-strong { font-weight: 600; color: var(--ink); }
        .arrow { color: #c4bdd4; margin: 0 4px; }

        .sev {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            padding: 3px 8px;
            border-radius: 6px;
        }
        .sev--high { background: #fef2f2; color: #b91c1c; }
        .sev--medium { background: #fffbeb; color: #b45309; }
        .sev--low { background: #f0fdf4; color: #166534; }
        .sev:not(.sev--high):not(.sev--medium):not(.sev--low) { background: #f4f4f5; color: #52525b; }

        footer {
            padding: 20px 40px 24px;
            border-top: 1px solid var(--line);
            font-size: 10px;
            color: var(--muted);
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            gap: 8px;
            background: #faf9fc;
        }
        footer strong { color: var(--ink-soft); font-weight: 600; }

        @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; border-radius: 0; max-width: none; }
            .hero { padding: 0 0 20px; }
            main { padding: 0 0 24px; }
            footer { padding: 16px 0 0; background: transparent; }
            @page { size: A4; margin: 14mm 16mm; }
        }
    </style>
</head>
<body>
    <article class="sheet">
        <header class="hero">
            <div class="eyebrow">
                <span class="k">Rapport d'intervention</span>
                <span class="ref">#${cr.id}</span>
            </div>
            <h1>${title}</h1>
            <p class="sub">ChangeHub · document généré le ${escapeHtml(now)}</p>
            <div class="summary">
                <span class="pill ${statusClass}"><span class="tag">Statut</span>${escapeHtml(statusLabel)}</span>
                <span class="pill ${riskClass}"><span class="tag">Risque</span>${escapeHtml(riskLabel)}</span>
            </div>
        </header>

        <main>
            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Fiche signalétique</h2>
                </div>
                <div class="grid">${fieldsHtml}</div>
            </section>

            <section class="block">
                <div class="block__head">
                    <h2 class="block__title">Description de la demande</h2>
                </div>
                <div class="panel panel--prose">${desc}</div>
            </section>
            ${analysisHtml}
            ${incidentsHtml}
            ${historyHtml}
        </main>

        <footer>
            <span><strong>ChangeHub</strong> — traçabilité des changements</span>
            <span>Réf. dossier #${cr.id}</span>
        </footer>
    </article>
    <script>
        (function () {
            function printDoc() {
                window.print();
            }
            function schedule() {
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(function () { setTimeout(printDoc, 150); });
                } else {
                    setTimeout(printDoc, 400);
                }
            }
            window.addEventListener("load", schedule);
        })();
    </script>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (win) {
        win.onafterprint = () => URL.revokeObjectURL(url)
    }
}
