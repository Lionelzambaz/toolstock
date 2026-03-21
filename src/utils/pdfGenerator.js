import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function generatePDF(command, commandDetails, userProfile) {
  let element = null
  try {
    // Créer un élément HTML temporaire avec le contenu du PDF
    element = document.createElement('div')
    element.id = 'pdf-generator-temp-' + Date.now()
    element.style.padding = '20px'
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
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #042C53; padding-bottom: 15px;">
        <h1 style="margin: 0; color: #042C53; font-size: 24px;">ToolStock</h1>
        <h2 style="margin: 5px 0 0 0; color: #185FA5; font-size: 18px;">BON DE COMMANDE</h2>
      </div>

      <!-- Infos commande -->
      <div style="margin-bottom: 20px;">
        <p style="margin: 5px 0;"><strong>N° Commande:</strong> CMD-${command.id.slice(0, 8).toUpperCase()}</p>
        <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(command.created_at).toLocaleDateString('fr-CH')}</p>
        <p style="margin: 5px 0;"><strong>Projet:</strong> ${command.projects?.nom || 'N/A'}</p>
        <p style="margin: 5px 0;"><strong>Créée par:</strong> ${command.users?.nom || 'Inconnu'}</p>
        <p style="margin: 5px 0;"><strong>Validée par:</strong> ${userProfile?.nom || 'Inconnu'}</p>
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
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #185FA5; color: white;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">N° Interne</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">N° Fournisseur</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Dénomination</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-weight: bold;">Fournisseur</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">Qty</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Prix U</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">Sous-total</th>
          </tr>
        </thead>
        <tbody>
          ${commandDetails.map((item, idx) => `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="border: 1px solid #ddd; padding: 8px;">${item.pieces.numero_interne}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.pieces.numero_fournisseur}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.pieces.denomination}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.pieces.fournisseur}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantite}</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.prix_unitaire.toFixed(2)} CHF</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>${(item.prix_unitaire * item.quantite).toFixed(2)} CHF</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Total -->
      <div style="background-color: #E6F1FB; padding: 10px; border-left: 4px solid #185FA5; text-align: right; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 16px;"><strong>Montant total: ${calculateTotal(commandDetails).toFixed(2)} CHF</strong></p>
      </div>

      <!-- Commentaires validateur -->
      ${command.supervisor_comments ? `
        <div style="background-color: #f5f5f5; padding: 10px; border-left: 4px solid #BA7517; margin-bottom: 20px;">
          <strong>Commentaires du validateur:</strong>
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

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    
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