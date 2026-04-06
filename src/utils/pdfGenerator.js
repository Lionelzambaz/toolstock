import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function generatePDF(command, commandDetails, userProfile, viewMode = 'subassembly') {
  let element = null
  try {
    // Créer un élément HTML temporaire avec le contenu du PDF
    element = document.createElement('div')
    element.id = 'pdf-generator-temp-' + Date.now()
    element.style.padding = '20px 20px 80px 20px'
    element.style.fontFamily = 'Arial, sans-serif'
    element.style.fontSize = '12px'
    element.style.width = '800px'
    element.style.backgroundColor = 'white'
    element.style.position = 'fixed'
    element.style.top = '-9999px'
    element.style.left = '-9999px'
    element.style.zIndex = '-9999'

    // En-tête
    element.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #042C53; padding-bottom: 15px;">
        <img src="/logo-horizontal.png" style="height: 40px; object-fit: contain;" />
        <h2 style="margin: 0; color: #185FA5; font-size: 20px; font-weight: bold;">BON DE COMMANDE</h2>
        <img src="/logo-nvrm.png" style="height: 38px; object-fit: contain;" />
      </div>

      <!-- Infos commande -->
      <div style="margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>N° Commande:</strong> CMD-${command.id.slice(0, 8).toUpperCase()}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(command.created_at).toLocaleDateString('fr-CH')}</p>
        <p style="margin: 5px 0;"><strong>Projet:</strong> ${command.projects?.nom || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Créée par:</strong> ${command.users?.nom || 'Inconnu'}</p>
        ${command.status === 'validated'
          ? `<p style="margin: 5px 0;"><strong>Validée par:</strong> ${command.supervisor_nom || userProfile?.nom || 'Inconnu'}</p>`
          : `<p style="margin: 5px 0;"><strong>Statut:</strong> <span style="color: #BA7517; font-weight: bold;">${statusLabel(command.status)}</span></p>`
        }
      </div>

      <!-- Remarques créateur -->
      ${command.remarques ? `
        <div style="background-color: #E6F1FB; padding: 10px; border-left: 4px solid #185FA5; margin-bottom: 20px;">
          <strong>Remarques du créateur:</strong>
          <p style="margin: 5px 0;">${command.remarques}</p>
        </div>
      ` : ''}

      <!-- Tableau items -->
      <h3 style="color: #042C53; margin-top: 20px; margin-bottom: 10px;">Pièces commandées</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
        <thead>
          <tr style="background-color: #185FA5; color: white;">
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-weight: bold;">N° Int</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-weight: bold;">N° Fourni</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-weight: bold;">Fournisseur</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: left; font-weight: bold;">Dénomination</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: center; font-weight: bold;">${viewMode === 'article' ? 'Qty totale' : 'Qty'}</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: right; font-weight: bold;">Prix U</th>
            <th style="border: 1px solid #ddd; padding: 5px; text-align: right; font-weight: bold;">Sous-total</th>
          </tr>
        </thead>
        <tbody>
          ${(() => {
            const renderRow = (item, bg, withBreak = false) => `
              <tr ${withBreak ? 'data-break="true"' : ''} style="background-color: ${bg};">
                <td style="border: 1px solid #ddd; padding: 5px;">${item.pieces.numero_interne}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${item.pieces.numero_fournisseur}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${item.pieces.fournisseur}</td>
                <td style="border: 1px solid #ddd; padding: 5px;">${item.pieces.denomination}</td>
                <td style="border: 1px solid #ddd; padding: 5px; text-align: center;">${item.quantite}</td>
                <td style="border: 1px solid #ddd; padding: 5px; text-align: right;">${item.prix_unitaire.toFixed(2)} CHF</td>
                <td style="border: 1px solid #ddd; padding: 5px; text-align: right;"><strong>${(item.prix_unitaire * item.quantite).toFixed(2)} CHF</strong></td>
              </tr>`

            if (viewMode === 'article') {
              const merged = {}
              commandDetails.forEach(item => {
                if (merged[item.piece_id]) {
                  merged[item.piece_id].quantite += item.quantite
                } else {
                  merged[item.piece_id] = { ...item }
                }
              })
              return Object.values(merged).map((item, idx) =>
                renderRow(item, idx % 2 === 0 ? '#EEF5FF' : '#E3EFFE', true)
              ).join('')
            }

            // Mode sous-ensemble
            const seGroups = {}
            const individualItems = []
            commandDetails.forEach(item => {
              if (item.sous_ensemble_id) {
                if (!seGroups[item.sous_ensemble_id]) {
                  seGroups[item.sous_ensemble_id] = {
                    nom: item.sub_assemblies?.nom || 'Sous-ensemble',
                    quantite: item.sous_ensemble_quantite,
                    items: []
                  }
                }
                seGroups[item.sous_ensemble_id].items.push(item)
              } else {
                individualItems.push(item)
              }
            })

            let html = ''
            Object.values(seGroups).forEach(group => {
              const qteLabel = group.quantite > 1 ? `${group.quantite} sous-ensembles commandés` : '1 sous-ensemble commandé'
              html += `<tr data-break="true"><td colspan="7" style="background-color: #042C53; color: white; padding: 5px 8px; font-weight: bold; font-size: 11px;">📦 ${group.nom} — ${qteLabel}</td></tr>`
              group.items.forEach((item, idx) => {
                html += renderRow(item, idx % 2 === 0 ? '#EEF5FF' : '#E3EFFE', true)
              })
            })
            if (Object.keys(seGroups).length > 0 && individualItems.length > 0) {
              html += `<tr data-break="true"><td colspan="7" style="background-color: #888780; color: white; padding: 4px 8px; font-style: italic; font-size: 10px;">Pièces individuelles</td></tr>`
            }
            individualItems.forEach((item, idx) => {
              html += renderRow(item, idx % 2 === 0 ? '#EEF5FF' : '#E3EFFE', true)
            })
            return html
          })()}
        </tbody>
      </table>

      <!-- Total -->
      <div style="background-color: #E6F1FB; padding: 10px; border-left: 4px solid #185FA5; text-align: right; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px;"><strong>Montant total: ${calculateTotal(commandDetails).toFixed(2)} CHF</strong></p>
      </div>

      <!-- Commentaires validateur -->
      ${command.supervisor_comments ? `
        <div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #BA7517; margin-bottom: 20px;">
          <strong>Commentaires du responsable:</strong>
          <p style="margin: 5px 0;">${command.supervisor_comments}</p>
        </div>
      ` : ''}

      <!-- Pied de page -->
      <div style="text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #888780; font-size: 10px;">
        <p>Généré par ToolStock le ${new Date().toLocaleDateString('fr-CH')} à ${new Date().toLocaleTimeString('fr-CH')}</p>
      </div>
    `

    // Ajouter l'élément à la page (invisible)
    document.body.appendChild(element)

    // Mesurer les positions des séparateurs de sections AVANT html2canvas
    const scale = 2
    const elementTop = element.getBoundingClientRect().top
    const breakEls = Array.from(element.querySelectorAll('[data-break]'))
    const sectionBreaks = breakEls
      .map(el => Math.round((el.getBoundingClientRect().top - elementTop) * scale))
      .filter(y => y > 0)
      .sort((a, b) => a - b)

    // Convertir en canvas puis en PDF
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      allowTaint: true,
      useCORS: true,
      ignoreElements: (el) => {
        return el.id === element.id ? false : false
      }
    })

    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = 210
    const pdfHeight = 297
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const pageHeightPx = Math.floor((pdfHeight * canvasWidth) / pdfWidth)

    // Marges haut/bas (12mm) converties en pixels canvas
    const marginMm = 12
    const marginPx = Math.floor((marginMm * canvasWidth) / pdfWidth)
    const usablePagePx = pageHeightPx - 2 * marginPx

    // Fallback : scan de lignes blanches vers le haut
    const srcCtx = canvas.getContext('2d')
    const fullPixels = srcCtx.getImageData(0, 0, canvasWidth, canvasHeight).data

    function findWhiteRow(targetRow) {
      const limit = Math.max(0, targetRow - 300)
      for (let row = targetRow; row >= limit; row--) {
        const base = row * canvasWidth * 4
        let isWhite = true
        for (let x = 0; x < canvasWidth; x++) {
          const i = base + x * 4
          if (fullPixels[i] < 250 || fullPixels[i + 1] < 250 || fullPixels[i + 2] < 250) {
            isWhite = false; break
          }
        }
        if (isWhite) return row
      }
      return targetRow
    }

    // Trouve le meilleur point de coupure pour la page courante :
    // 1. Préfère un séparateur de section DOM (début de sous-ensemble)
    // 2. Sinon cherche une ligne blanche
    function findNaturalBreak(pageTop, targetRow) {
      // Chercher le dernier séparateur de section qui tient dans la page
      // et qui utilise au moins 30% de la hauteur de page (évite les pages quasi-vides)
      const minRow = pageTop + usablePagePx * 0.3
      let bestSection = -1
      for (const bp of sectionBreaks) {
        if (bp > pageTop && bp <= targetRow && bp >= minRow) bestSection = bp
      }
      if (bestSection > 0) return bestSection

      // Aucun séparateur : chercher une ligne blanche
      return findWhiteRow(targetRow)
    }

    let pageTop = 0
    let pageNum = 0

    while (pageTop < canvasHeight) {
      if (pageNum > 0) pdf.addPage()

      const idealBreak = pageTop + usablePagePx
      const breakRow = idealBreak < canvasHeight ? findNaturalBreak(pageTop, idealBreak) : canvasHeight
      const sliceHeight = Math.max(1, breakRow - pageTop)

      // Tranche avec marge blanche en haut et en bas
      const pageCanvas = document.createElement('canvas')
      pageCanvas.width = canvasWidth
      pageCanvas.height = marginPx + sliceHeight + marginPx
      const ctx = pageCanvas.getContext('2d')
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      ctx.drawImage(canvas, 0, pageTop, canvasWidth, sliceHeight, 0, marginPx, canvasWidth, sliceHeight)

      const pageData = pageCanvas.toDataURL('image/png')
      const pageImgHeight = (pageCanvas.height * pdfWidth) / canvasWidth
      pdf.addImage(pageData, 'PNG', 0, 0, pdfWidth, pageImgHeight)

      pageTop = breakRow
      pageNum++
    }
    
    // Télécharger le PDF
    const fileName = `BonCommande_CMD-${command.id.slice(0, 8).toUpperCase()}_${new Date(command.created_at).toLocaleDateString('fr-CH').replace(/\//g, '-')}.pdf`
    pdf.save(fileName)

    alert('✅ PDF téléchargé avec succès!')
  } catch (err) {
    console.error('Erreur PDF complète:', err)
    alert('Erreur lors de la génération du PDF: ' + err.message)
  } finally {
    // S'assurer que l'élément est retiré
    if (element && element.parentNode) {
      element.parentNode.removeChild(element)
    }
  }
}

function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.prix_unitaire * item.quantite), 0)
}

function statusLabel(status) {
  const labels = {
    draft: 'Brouillon',
    pending: 'En attente de validation',
    validated: 'Validée',
    rejected: 'Refusée',
    archived: 'Archivée'
  }
  return labels[status] || status
}