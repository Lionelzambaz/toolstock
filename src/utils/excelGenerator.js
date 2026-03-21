import ExcelJS from 'exceljs'

export async function generateExcel(commands, commandsDetails, userProfile) {
  try {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Commandes')

    // En-têtes
    const headers = [
      'Date commande',
      'Projet',
      'N° Interne',
      'N° Fournisseur',
      'Dénomination',
      'Quantité',
      'Prix unitaire',
      'Montant ligne',
      'Fournisseur',
      'Status',
      'Créateur',
      'Commentaires validateur'
    ]
    
    // Ajouter les en-têtes
    worksheet.addRow(headers)
    
    // Style en-têtes
    const headerRow = worksheet.getRow(1)
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF185FA5' }
    }
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
    headerRow.alignment = { horizontal: 'center' }

    let lastRowNum = 1

    // Ajouter les lignes
    commands.forEach(command => {
      const details = commandsDetails[command.id] || []
      const date = new Date(command.created_at).toLocaleDateString('fr-CH')
      const projet = command.projects?.nom || 'N/A'
      const status = getStatusLabel(command.status)
      const createur = command.users?.nom || 'Inconnu'
      const commentaires = command.supervisor_comments || ''
      
      if (details.length === 0) {
        worksheet.addRow([
          date,
          projet,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          status,
          createur,
          commentaires
        ])
        lastRowNum = worksheet.rowCount
      } else {
        details.forEach((item) => {
          const montantLigne = item.prix_unitaire * item.quantite
          
          worksheet.addRow([
            date,
            projet,
            item.pieces.numero_interne,
            item.pieces.numero_fournisseur,
            item.pieces.denomination,
            item.quantite,
            item.prix_unitaire,
            montantLigne,
            item.pieces.fournisseur,
            status,
            createur,
            commentaires
          ])
          lastRowNum = worksheet.rowCount
        })
      }
    })

    // Format montant pour toutes les lignes de données
    for (let i = 2; i <= lastRowNum; i++) {
      const row = worksheet.getRow(i)
      row.getCell(7).numFmt = '0.00'
      row.getCell(8).numFmt = '0.00'
    }

// AJOUTER LES FILTRES (AutoFilter)
    worksheet.views = [
      {
        state: 'frozen',
        xSplit: 0,
        ySplit: 1,
        topLeftCell: 'A2',
        activeCell: 'A1'
      }
    ]
    
    // Créer autoFilter
    worksheet.autoFilter = {
      from: 'A1',
      to: `L${lastRowNum}`
    }

    // Ajouter une ligne vide
    worksheet.addRow([])

    // Ajouter le TOTAL avec FORMULE (SUBTOTAL pour respecter les filtres)
    const totalRowNum = lastRowNum + 2
    const totalRow = worksheet.addRow([])
    
    totalRow.getCell(7).value = 'TOTAL:'
    totalRow.getCell(8).value = { formula: `SUBTOTAL(109,H2:H${lastRowNum})` }
    totalRow.getCell(8).numFmt = '0.00'

    // Style du TOTAL
    for (let col = 1; col <= 12; col++) {
      const cell = totalRow.getCell(col)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6F1FB' }
      }
      cell.font = { bold: true, size: 12 }
    }
    
    totalRow.getCell(7).alignment = { horizontal: 'right' }
    totalRow.getCell(8).alignment = { horizontal: 'right' }

    // Définir les largeurs
    worksheet.columns = [
      { width: 14 },
      { width: 18 },
      { width: 12 },
      { width: 15 },
      { width: 25 },
      { width: 10 },
      { width: 13 },
      { width: 13 },
      { width: 18 },
      { width: 12 },
      { width: 18 },
      { width: 25 }
    ]

    // Télécharger le fichier
    const fileName = `Commandes_${new Date().toLocaleDateString('fr-CH').replace(/\//g, '-')}.xlsx`
    
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    alert('✅ Excel téléchargé!')
  } catch (err) {
    console.error('Erreur Excel:', err)
    alert('Erreur: ' + err.message)
  }
}

function getStatusLabel(status) {
  const labels = {
    'draft': 'Brouillon',
    'pending': 'En attente',
    'validated': 'Validée',
    'rejected': 'Refusée',
    'archived': 'Archivée'
  }
  return labels[status] || status
}