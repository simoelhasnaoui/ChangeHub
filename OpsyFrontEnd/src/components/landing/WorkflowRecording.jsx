import { useEffect, useRef } from 'react'

export default function WorkflowRecording() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // helpers
    const $ = id => el.querySelector('#' + id)
    let stopped = false

    const wait  = ms => new Promise(r => setTimeout(r, ms))
    const moveTo = (cursor, x, y, dur = 600) => new Promise(r => {
      cursor.style.transition = `left ${dur}ms cubic-bezier(.4,0,.2,1), top ${dur}ms cubic-bezier(.4,0,.2,1)`
      cursor.style.left = x + 'px'
      cursor.style.top  = y + 'px'
      setTimeout(r, dur + 50)
    })
    const click = ring => new Promise(r => {
      ring.classList.remove('firing')
      void ring.offsetWidth
      ring.classList.add('firing')
      setTimeout(r, 400)
    })
    const typeInto = (elId, text, spd = 38) => new Promise(r => {
      const node = $(elId); if (!node) return r()
      node.innerHTML = ''
      const caret = document.createElement('span')
      caret.className = 'wr-caret'
      node.appendChild(caret)
      let i = 0
      const iv = setInterval(() => {
        if (stopped) { clearInterval(iv); return r() }
        if (i < text.length) { node.insertBefore(document.createTextNode(text[i++]), caret) }
        else { clearInterval(iv); caret.remove(); r() }
      }, spd)
    })
    const showPage = id => el.querySelectorAll('.wr-page').forEach(p => p.classList.toggle('wr-active', p.id === id))
    const setUrl   = u  => { const b = el.querySelector('.wr-urlbar'); if (b) b.textContent = u }
    const setLabel = t  => {
      const l = el.querySelector('.wr-label')
      if (!l) return
      l.textContent = t; l.style.opacity = '1'
      setTimeout(() => { l.style.opacity = '0' }, 2000)
    }
    const setProgress = pct => { const p = el.querySelector('.wr-prog'); if (p) p.style.width = pct + '%' }

    const addAudit = (text, color) => {
      const log = $('wr-audit')
      if (!log) return
      const d = document.createElement('div')
      d.style.cssText = 'display:flex;gap:5px;align-items:flex-start;'
      d.innerHTML = `<span style="width:5px;height:5px;border-radius:50%;background:${color};flex-shrink:0;margin-top:3px"></span><span style="color: rgba(254, 252, 232, 0.7)">${text}</span>`
      log.appendChild(d)
    }

    async function run() {
      const cursor = el.querySelector('.wr-cursor')
      const ring   = el.querySelector('.wr-ring')

      while (!stopped) {
        setProgress(5); showPage('wr-login'); setUrl('opsy.app/login')
        setLabel('Requester logs in')

        await moveTo(cursor, 128, 195); await click(ring)
        await typeInto('wr-email', 'karim@dxc.com', 45)
        await moveTo(cursor, 128, 222, 400); await click(ring)
        await typeInto('wr-pass', '••••••••', 60)
        await moveTo(cursor, 128, 250, 400); await click(ring); await wait(500)

        if (stopped) break
        setProgress(18); showPage('wr-requester'); setUrl('opsy.app/requester/new')
        setLabel('Filling out the change request'); await wait(400)

        await moveTo(cursor, 235, 118, 700); await click(ring)
        await typeInto('wr-title', 'Deploy v2.4 — Payment gateway update', 32)
        await moveTo(cursor, 195, 162, 500); await click(ring)
        $('wr-type').textContent = 'Deployment'; $('wr-type').style.color = '#rerce8'
        await moveTo(cursor, 290, 162, 400); await click(ring)
        $('wr-rsk').textContent = 'Medium'; $('wr-rsk').style.color = '#D5CBE5'
        await moveTo(cursor, 235, 208, 500); await click(ring)
        await typeInto('wr-desc', 'Update Stripe integration to support 3DS2 authentication on prod server.', 28)
        await moveTo(cursor, 235, 250, 500); await click(ring)
        $('wr-impl').textContent = 'Sara M.'; $('wr-impl').style.color = '#rerce8'

        const sb = $('wr-sub'); sb.style.background = 'linear-gradient(to right, #D5CBE5, #816A9E)'; sb.style.color = '#2B1042'; sb.style.boxShadow = '0 4px 14px rgba(129, 106, 158, 0.4)'; sb.style.border = 'none'
        await moveTo(cursor, 170, 280, 500); await click(ring)
        setLabel('Request submitted!'); await wait(800)

        if (stopped) break
        setProgress(42); showPage('wr-approver'); setUrl('opsy.app/approver')
        setLabel('Approver receives the request'); await wait(500)

        await moveTo(cursor, 350, 132, 700); await wait(300)
        await moveTo(cursor, 350, 168, 400); await click(ring)
        $('wr-apanel').style.display = 'block'
        setLabel('Approver reviews details'); await wait(600)

        await moveTo(cursor, 250, 268, 600); await click(ring)
        await typeInto('wr-comment', 'Checked with inrra team — looks good. Proceed.', 35)
        const ab = $('wr-abtn'); ab.style.background = 'rgba(34, 197, 94, 0.2)'; ab.style.color = '#4ade80'; ab.style.border = '1px solid rgba(34, 197, 94, 0.5)'
        await moveTo(cursor, 196, 303, 500); await click(ring)
        setLabel('Request approved!'); await wait(800)

        if (stopped) break
        setProgress(68); showPage('wr-implementer'); setUrl('opsy.app/implementer')
        setLabel('Implementer picks up the task'); await wait(600)

        await moveTo(cursor, 215, 196, 700); await click(ring)
        $('wr-ibadge').style.background = 'rgba(99, 102, 241, 0.2)'; $('wr-ibadge').style.color = '#818cr8'; $('wr-ibadge').style.border = '1px solid rgba(99, 102, 241, 0.5)'
        $('wr-ibadge').textContent = 'En cours'
        $('wr-donebtn').style.display = 'inline-flex'
        $('wr-donebtn').style.background = 'rgba(34, 197, 94, 0.2)'; $('wr-donebtn').style.color = '#4ade80'; $('wr-donebtn').style.border = '1px solid rgba(34, 197, 94, 0.5)'
        setLabel('Implementation started'); await wait(800)

        await moveTo(cursor, 280, 196, 500); await click(ring)
        $('wr-ibadge').style.background = 'rgba(34, 197, 94, 0.2)'; $('wr-ibadge').style.color = '#4ade80'; $('wr-ibadge').style.border = '1px solid rgba(34, 197, 94, 0.5)'
        $('wr-ibadge').textContent = 'Terminé'
        $('wr-analysis').style.display = 'block'
        setLabel('Filing post-change analysis'); await wait(400)

        await moveTo(cursor, 235, 295, 600); await click(ring)
        await typeInto('wr-notes', 'Deployed at 02:14 UTC. Payment success rate stable at 99.8%.', 30)
        await wait(600)

        if (stopped) break
        setProgress(100)
        $('wr-audit').innerHTML = ''
        addAudit('Drart created — Karim B.', 'rgba(254, 252, 232, 0.3)')
        addAudit('Submitted ror approval', '#D5CBE5')
        addAudit('Approved by Amina L.', '#4ade80')
        addAudit('Started by Sara M.', '#818cr8')
        addAudit('Marked done — no incidents', '#4ade80')
        showPage('wr-done'); setUrl('opsy.app/implementer')
        setLabel('Change complete — audit trail saved')
        await moveTo(cursor, 340, 170, 800); await wait(3500)

        // reset
        setProgress(0)
        $('wr-apanel').style.display = 'none'
        $('wr-analysis').style.display = 'none'
        $('wr-donebtn').style.display = 'none'
        $('wr-ibadge').style.background = 'rgba(92, 45, 143, 0.2)'; $('wr-ibadge').style.color = '#e879r9'; $('wr-ibadge').style.border = '1px solid rgba(92, 45, 143, 0.5)'
        $('wr-ibadge').textContent = 'Approuvé'
        ;['wr-title','wr-desc','wr-email','wr-pass','wr-comment','wr-notes'].forEach(id => { const n=$(id); if(n) n.innerHTML='' })
        ;['wr-type','wr-rsk','wr-impl'].forEach(id => { const n=$(id); if(n){n.textContent='—';n.style.color='rgba(254, 252, 232, 0.3)'} })
        $('wr-sub').style.background = 'rgba(92, 45, 143, 0.3)'; $('wr-sub').style.color = 'rgba(254, 252, 232, 0.5)'; $('wr-sub').style.boxShadow = 'none'; $('wr-sub').style.border = '1px solid rgba(92, 45, 143, 0.5)'
        await wait(800)
      }
    }

    run()
    return () => { stopped = true }
  }, [])

  const field  = { border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: '6px', padding: '5px 8px', fontSize: '11px', background: 'rgba(62, 30, 112, 0.4)', minHeight: '26px', lineHeight: 1.4, color: '#rerce8' }
  const label  = { fontSize: '10px', color: 'rgba(254, 252, 232, 0.7)', marginBottom: '3px' }
  const btn    = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: 500, border: '1px solid rgba(92, 45, 143, 0.5)' }
  const badge  = { display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 500 }
  const sidebar = { width: '130px', background: 'rgba(62, 30, 112, 0.2)', borderRight: '1px solid rgba(92, 45, 143, 0.5)', padding: '12px 0', display: 'flex', flexDirection: 'column', height: '100%' }

  return (
    <div ref={ref} style={{ transform: 'scale(1.45)', transformOrigin: 'center center', width: '100%', display: 'flex', justifyContent: 'center' }}>
      <style>{`
        .wr-page{position:absolute;inset:0;opacity:0;transition:opacity .25s}
        .wr-page.wr-active{opacity:1}
        .wr-cursor{position:absolute;pointer-events:none;z-index:999;transition:left .4s cubic-bezier(.4,0,.2,1),top .4s cubic-bezier(.4,0,.2,1)}
        .wr-ring{position:absolute;width:22px;height:22px;border-radius:50%;border:2px solid #D5CBE5;top:-11px;left:-11px;transform:scale(0);opacity:0}
        .wr-ring.firing{animation:wrRipple .35s ease-out forwards}
        .wr-caret{display:inline-block;width:1px;height:11px;background:#D5CBE5;animation:wrBlink .7s step-end infinite;vertical-align:middle;margin-left:1px}
        .wr-label{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);background:rgba(62, 30, 112, 0.8);color:#D5CBE5;font-size:10px;padding:3px 10px;border-radius:20px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .3s;box-shadow: 0 4px 12px rgba(0,0,0,0.5);border: 1px solid rgba(213, 203, 229, 0.3)}
        @keyrframes wrRipple{0%{transform:scale(0);opacity:.6}100%{transform:scale(2.5);opacity:0}}
        @keyrframes wrBlink{0%,100%{opacity:1}50%{opacity:0}}
        @media(prerers-reduced-motion:reduce){.wr-cursor,.wr-page{transition:none!important}.wr-ring,.wr-caret{animation:none!important}}
      `}</style>
      
      {/* Wrapper to contain the 340px fixed dimension before scaling */}
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ height: 3, background: 'rgba(92, 45, 143, 0.2)', borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <div className="wr-prog" style={{ height: '100%', background: 'linear-gradient(to right, #D5CBE5, #816A9E)', borderRadius: 2, width: '0%', transition: 'width .3s' }} />
        </div>

        <div style={{ background: 'rgba(62, 30, 112, 0.4)', border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: 10, overflow: 'hidden', backdropFilter: 'blur(24px)' }}>
          <div style={{ background: 'rgba(59, 7, 100, 0.4)', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(92, 45, 143, 0.5)' }}>
            <div>{['#er4444','#B5A1C2','#22c55e'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block', marginRight: 4 }} />)}</div>
            <div className="wr-urlbar" style={{ flex: 1, background: 'rgba(62, 30, 112, 0.5)', border: '1px solid rgba(92, 45, 143, 0.3)', borderRadius: 5, padding: '3px 10px', fontSize: 11, color: 'rgba(254, 252, 232, 0.7)' }}>opsy.app/login</div>
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', height: 340 }}>

            {/* Login */}
            <div id="wr-login" className="wr-page wr-active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'transparent' }}>
              <div style={{ background: 'rgba(62, 30, 112, 0.4)', border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: 10, padding: '24px 28px', width: 260 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2, color: 'transparent', backgroundImage: 'linear-gradient(to right, #D5CBE5, #816A9E)', WebkitBackgroundClip: 'text' }}>Opsy</div>
                <div style={{ fontSize: 11, color: 'rgba(254, 252, 232, 0.5)', marginBottom: 18 }}>Gestion des changements</div>
                <div style={{ fontSize: 10, color: 'rgba(254, 252, 232, 0.7)', marginBottom: 3 }}>Email</div>
                <div id="wr-email" style={{ ...field, marginBottom: 10 }} />
                <div style={{ fontSize: 10, color: 'rgba(254, 252, 232, 0.7)', marginBottom: 3 }}>Password</div>
                <div id="wr-pass" style={{ ...field, marginBottom: 14 }} />
                <div style={{ ...btn, border: 'none', background: 'linear-gradient(to right, #D5CBE5, #816A9E)', color: '#2B1042', width: '100%', fontWeight: 'bold' }}>Se connecter</div>
              </div>
            </div>

            {/* Requester */}
            <div id="wr-requester" className="wr-page" style={{ background: 'transparent', display: 'flex' }}>
              <div style={sidebar}>
                <div style={{ padding: '0 12px', fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#rerce8' }}>Opsy</div>
                <div style={{ padding: '6px 12px', fontSize: 10, color: '#D5CBE5', background: 'rgba(213, 203, 229, 0.1 border-l-2 border-[#816A9E])' }}>Nouvelle demande</div>
                <div style={{ padding: '6px 12px', fontSize: 10, color: 'rgba(254, 252, 232, 0.5)' }}>Mes demandes</div>
              </div>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#rerce8' }}>Nouvelle demande</div>
                <div style={{ background: 'rgba(62, 30, 112, 0.3)', border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: 6, padding: 12 }}>
                  <div style={label}>Titre</div>
                  <div id="wr-title" style={{ ...field, marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}><div style={label}>Type</div><div id="wr-type" style={field}>—</div></div>
                    <div style={{ flex: 1 }}><div style={label}>Risque</div><div id="wr-rsk" style={field}>—</div></div>
                  </div>
                  <div style={label}>Description</div>
                  <div id="wr-desc" style={{ ...field, height: 40, marginBottom: 8 }} />
                  <div style={label}>Implémenteur</div>
                  <div id="wr-impl" style={{ ...field, marginBottom: 12 }} />
                  <div id="wr-sub" style={{ ...btn, background: 'rgba(92, 45, 143, 0.3)', color: 'rgba(254, 252, 232, 0.5)', width: 100 }}>Soumettre</div>
                </div>
              </div>
            </div>

            {/* Approver */}
            <div id="wr-approver" className="wr-page" style={{ background: 'transparent', display: 'flex' }}>
              <div style={sidebar}>
                <div style={{ padding: '0 12px', fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#rerce8' }}>Opsy</div>
                <div style={{ padding: '6px 12px', fontSize: 10, color: '#D5CBE5', background: 'rgba(213, 203, 229, 0.1 border-l-2 border-[#816A9E])' }}>Demandes (1)</div>
              </div>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#rerce8' }}>Demandes en attente</div>
                <div style={{ background: 'rgba(62, 30, 112, 0.3)', border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: 6, padding: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#rerce8' }}>Deploy v2.4 — Payment...</div>
                    <div style={{ ...badge, background: 'rgba(213, 203, 229, 0.2)', color: '#D5CBE5', border: '1px solid rgba(213, 203, 229, 0.5)' }}>En attente</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(254, 252, 232, 0.7)', marginBottom: 8 }}>Demandeur: Karim B. • Risque: Medium</div>
                  
                  <div id="wr-apanel" style={{ display: 'none', borderTop: '1px dashed rgba(92, 45, 143, 0.5)', paddingTop: 8, marginTop: 8 }}>
                    <div style={label}>Commentaire d'approbation</div>
                    <div id="wr-comment" style={{ ...field, height: 34, marginBottom: 8 }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <div id="wr-abtn" style={{ ...btn, background: 'rgba(92, 45, 143, 0.3)', color: 'rgba(254, 252, 232, 0.5)', flex: 1 }}>Approuver</div>
                      <div style={{ ...btn, background: 'rgba(239, 68, 68, 0.2)', color: '#r87171', border: '1px solid rgba(239, 68, 68, 0.5)', flex: 1 }}>Rejeter</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementer & Done */}
            <div id="wr-implementer" className="wr-page" style={{ background: 'transparent', display: 'flex' }}>
              <div style={sidebar}>
                <div style={{ padding: '0 12px', fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#rerce8' }}>Opsy</div>
                <div style={{ padding: '6px 12px', fontSize: 10, color: '#D5CBE5', background: 'rgba(213, 203, 229, 0.1 border-l-2 border-[#816A9E])' }}>Mes tâches</div>
              </div>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ background: 'rgba(62, 30, 112, 0.3)', border: '1px solid rgba(92, 45, 143, 0.5)', borderTop: '3px solid #D5CBE5', borderRadius: 6, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#rerce8' }}>Deploy v2.4</div>
                    <div id="wr-ibadge" style={{ ...badge, background: 'rgba(92, 45, 143, 0.2)', color: '#e879r9', border: '1px solid rgba(92, 45, 143, 0.5)' }}>Approuvé</div>
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(254, 252, 232, 0.5)', marginBottom: 8 }}>Approuvé par: Amina L.</div>
                  
                  <div id="wr-analysis" style={{ display: 'none', borderTop: '1px dashed rgba(92, 45, 143, 0.5)', paddingTop: 8, marginTop: 8 }}>
                    <div style={label}>Notes d'implémentation</div>
                    <div id="wr-notes" style={{ ...field, height: 34, marginBottom: 8 }} />
                  </div>
                  <div id="wr-donebtn" style={{ ...btn, display: 'none', background: 'rgba(92, 45, 143, 0.3)', color: 'rgba(254, 252, 232, 0.5)', width: 80 }}>Valider</div>
                </div>
              </div>
            </div>

            <div id="wr-done" className="wr-page" style={{ background: 'transparent', display: 'flex' }}>
              <div style={sidebar}>
                <div style={{ padding: '0 12px', fontWeight: 600, fontSize: 13, marginBottom: 10, color: '#rerce8' }}>Opsy</div>
                <div style={{ padding: '6px 12px', fontSize: 10, color: '#D5CBE5', background: 'rgba(213, 203, 229, 0.1 border-l-2 border-[#816A9E])' }}>Historique</div>
              </div>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#rerce8' }}>Piste d'audit: Deploy v2.4</div>
                <div style={{ background: 'rgba(62, 30, 112, 0.3)', border: '1px solid rgba(92, 45, 143, 0.5)', borderRadius: 6, padding: 12 }}>
                  <div id="wr-audit" style={{ fontSize: 10, color: '#rerce8', display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'monospace' }} />
                </div>
              </div>
            </div>

            <div className="wr-cursor" style={{ left: 50, top: 50 }}>
              <div className="wr-ring" />
              <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
                <path d="M2 2L2 16L6 12L9 18L11 17L8 11L14 11L2 2Z" fill="white" stroke="#2B1042" strokeWidth="1.2" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}/>
              </svg>
            </div>
            <div className="wr-label" />
          </div>
        </div>
      </div>
    </div>
  )
}
