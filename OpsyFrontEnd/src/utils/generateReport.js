/**
 * Generates and downloads a printable HTML report for a change request + analysis.
 * Opens a print-ready window that the user can save as PDF via the browser's Print dialog.
 */
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

    const now = new Date().toLocaleString('fr-FR')
    const plannedDate = cr.planned_date
        ? new Date(cr.planned_date).toLocaleDateString('fr-FR')
        : '—'

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Rapport — ${cr.title}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a202c;
            background: #fff;
            padding: 40px;
            font-size: 13px;
            line-height: 1.6;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 28px;
        }
        .header-brand { font-size: 22px; font-weight: 700; color: #2563eb; letter-spacing: -0.5px; }
        .header-subtitle { font-size: 12px; color: #6b7280; margin-top: 2px; }
        .header-meta { text-align: right; font-size: 11px; color: #6b7280; }
        .header-meta strong { display: block; font-size: 13px; color: #374151; margin-bottom: 2px; }

        /* Section title */
        .section-title {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
            padding-bottom: 6px;
            border-bottom: 1px solid #e5e7eb;
        }

        /* Info grid */
        .section { margin-bottom: 28px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .field label {
            display: block;
            font-size: 10px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-bottom: 2px;
        }
        .field value { font-weight: 600; color: #111827; font-size: 13px; }

        /* Status badge */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
        }
        .badge-done { background: #d1fae5; color: #065f46; }
        .badge-approved { background: #dbeafe; color: #1e40af; }
        .badge-in_progress { background: #ede9fe; color: #5b21b6; }
        .badge-pending_approval { background: #fef3c7; color: #92400e; }
        .badge-rejected { background: #fee2e2; color: #991b1b; }
        .badge-draft { background: #f3f4f6; color: #374151; }

        .risk-high { color: #dc2626; font-weight: 700; }
        .risk-medium { color: #d97706; font-weight: 700; }
        .risk-low { color: #16a34a; font-weight: 700; }

        /* Description block */
        .description-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 14px;
            color: #374151;
            font-size: 13px;
        }

        /* Analysis section */
        .analysis-block {
            background: ${analysis?.incident_occurred ? '#fff7ed' : '#f0fdf4'};
            border: 1px solid ${analysis?.incident_occurred ? '#fed7aa' : '#bbf7d0'};
            border-radius: 8px;
            padding: 16px;
        }
        .incident-flag {
            font-weight: 700;
            font-size: 14px;
            color: ${analysis?.incident_occurred ? '#c2410c' : '#15803d'};
            margin-bottom: 12px;
        }

        /* History table */
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        thead tr { background: #f3f4f6; }
        th { text-align: left; padding: 8px 10px; font-weight: 600; color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }

        /* Footer */
        .footer {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            font-size: 10px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
        }

        @media print {
            body { padding: 20px; }
            @page { margin: 15mm; }
        }
    </style>
</head>
<body>

<!-- Header -->
<div class="header">
    <div style="display: flex; align-items: center; gap: 15px;">
        <img src="${window.location.origin}/logo.png" style="height: 45px; width: auto;" alt="Logo" />
        <div>
            <div class="header-brand">ChangeHub</div>
            <div class="header-subtitle">Rapport de demande de changement</div>
        </div>
    </div>
    <div class="header-meta">
        <strong>${cr.title}</strong>
        Généré le ${now}<br/>
        Ref. #${cr.id}
    </div>
</div>

<!-- Request details -->
<div class="section">
    <div class="section-title">Informations générales</div>
    <div class="grid">
        <div class="field"><label>Statut</label><value>
            <span class="badge badge-${cr.status}">${statusLabels[cr.status] || cr.status}</span>
        </value></div>
        <div class="field"><label>Niveau de risque</label><value class="risk-${cr.risk_level}">${riskLabels[cr.risk_level] || cr.risk_level}</value></div>
        <div class="field"><label>Type de changement</label><value>${cr.change_type?.name || '—'}</value></div>
        <div class="field"><label>Système affecté</label><value>${cr.affected_system || '—'}</value></div>
        <div class="field"><label>Date planifiée</label><value>${plannedDate}</value></div>
        <div class="field"><label>Demandeur</label><value>${cr.requester?.name || '—'}</value></div>
        <div class="field"><label>Implémenteur</label><value>${cr.implementer?.name || '—'}</value></div>
        <div class="field"><label>Créé le</label><value>${new Date(cr.created_at).toLocaleString('fr-FR')}</value></div>
    </div>
</div>

<!-- Description -->
<div class="section">
    <div class="section-title">Description</div>
    <div class="description-box">${cr.description || '—'}</div>
</div>

${analysis ? `
<!-- Post-change analysis -->
<div class="section">
    <div class="section-title">Analyse post-changement</div>
    <div class="analysis-block">
        <div class="incident-flag">${analysis.incident_occurred ? '⚠ Incident survenu' : '✓ Aucun incident signalé'}</div>
        ${analysis.description ? `<div class="field" style="margin-bottom:10px"><label>Description</label><div style="margin-top:4px;color:#374151;">${analysis.description}</div></div>` : ''}
        ${analysis.impact ? `<div class="field" style="margin-bottom:10px"><label>Impact</label><div style="margin-top:4px;color:#374151;">${analysis.impact}</div></div>` : ''}
        ${analysis.solution ? `<div class="field"><label>Solution apportée</label><div style="margin-top:4px;color:#374151;">${analysis.solution}</div></div>` : ''}
    </div>
</div>
` : ''}

${cr.incidents && cr.incidents.length > 0 ? `
<!-- Incidents Registry -->
<div class="section">
    <div class="section-title">Registre des Incidents Déclarés</div>
    <table style="font-size: 11px;">
        <thead>
            <tr style="background: #fff1f2;">
                <th style="color: #991b1b; width: 25%;">Incident / Sévérité</th>
                <th style="color: #991b1b; width: 50%;">Détails & Impact</th>
                <th style="color: #991b1b; width: 25%;">Temps de résolution</th>
            </tr>
        </thead>
        <tbody>
            ${cr.incidents.map(inc => `
            <tr>
                <td style="vertical-align: top;">
                    <strong style="display: block; color: #111827;">${inc.title}</strong>
                    <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: ${inc.severity === 'high' ? '#dc2626' : (inc.severity === 'medium' ? '#d97706' : '#16a34a')}">
                        ${inc.severity}
                    </span>
                </td>
                <td style="vertical-align: top; color: #4b5563;">
                    ${inc.description || '—'}
                </td>
                <td style="vertical-align: top; font-weight: 600; color: #111827;">
                    ${inc.time_to_resolve_minutes} min
                </td>
            </tr>`).join('')}
        </tbody>
    </table>
</div>
` : ''}

${cr.histories && cr.histories.length > 0 ? `
<!-- History -->
<div class="section">
    <div class="section-title">Historique des actions</div>
    <table>
        <thead>
            <tr>
                <th>Utilisateur</th>
                <th>Ancien statut</th>
                <th>Nouveau statut</th>
                <th>Commentaire</th>
                <th>Date</th>
            </tr>
        </thead>
        <tbody>
            ${cr.histories.map(h => `
            <tr>
                <td>${h.user?.name || '—'}</td>
                <td>${statusLabels[h.old_status] || h.old_status || '—'}</td>
                <td>${statusLabels[h.new_status] || h.new_status || '—'}</td>
                <td>${h.comment || '—'}</td>
                <td>${new Date(h.created_at).toLocaleString('fr-FR')}</td>
            </tr>`).join('')}
        </tbody>
    </table>
</div>
` : ''}

<!-- Footer -->
<div class="footer">
    <span>ChangeHub — Gestion des changements techniques</span>
    <span>Rapport généré le ${now}</span>
</div>

<script>
    window.onload = () => { window.print(); }
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
