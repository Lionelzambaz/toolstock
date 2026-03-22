# 🗺️ ROADMAP SESSION 6 - ToolStock

**Date:** Mars 22, 2026+  
**Statut actuel:** 99% v1 (PDF + Excel + Admin cascade ✅)  
**Restant:** ~1% (Sous-ensembles + Déploiement)

---

## 📋 OBJECTIFS SESSION 6

### OBJECTIF 1: Affichage Sous-ensembles (10%)

**Ressources nécessaires:**
- Relations déjà en place:
  - `sub_assemblies` (nom, description)
  - `sub_assembly_pieces` (sub_assembly_id, piece_id, quantite)
  - `pieces` (numero_interne, denomination, prix_unitaire, fournisseur)

**Fichiers à créer:**
```
src/components/Catalog/SubAssemblyView.jsx
```

**Fonctionnalité:**

1. **Affichage Liste Sous-ensembles**
   - Dans CatalogPage: Ajouter toggle "Afficher sous-ensembles"
   - Liste des sous-ensembles disponibles (selon filtres projet si applicable)
   - Cliquer sur un sous-ensemble → Voir composition

2. **Vue Détails Sous-ensemble**
   - Titre: Nom du sous-ensemble
   - Description: (si existe)
   - **Tableau Composition:**
     ```
     | N° Interne | Dénomination | Quantité | Prix U | Sous-total |
     | ROU-001    | Roulement... | 8        | 45.50  | 364.00    |
     | AXE-002    | Axe...       | 2        | 123.00 | 246.00    |
     |                                       TOTAL: 610.00 |
     ```
   - Quantités viennent de `sub_assembly_pieces.quantite`
   - Bouton: "➕ Commander ce sous-ensemble complet"
     - Ajoute TOUS les items au panier
     - Utilisateur peut modifier quantities après
   - Bouton: "❌ Fermer" ou "← Retour"

3. **Logique:**
   ```javascript
   async function getSubAssemblyComposition(subAssemblyId) {
     const { data } = await supabase
       .from('sub_assembly_pieces')
       .select(`
         quantite,
         pieces(numero_interne, denomination, prix_unitaire, fournisseur)
       `)
       .eq('sub_assembly_id', subAssemblyId)
     return data
   }
   
   function handleCommandSubAssembly(composition) {
     // Pour chaque item dans composition:
     //   addItem(piece, quantite)
   }
   ```

**UI/UX:**
- Responsive: Mobile = 1 colonne, Desktop = tableau
- Couleurs: Headers bleu #185FA5, rows alternées blanc/#f9f9f9
- Boutons: Verts pour commander, gris pour fermer

**Fichiers modifiés:**
- `src/pages/CatalogPage.jsx` - Ajouter toggle + affichage SubAssemblyView
- `src/hooks/useCatalog.js` - Ajouter getSubAssemblyComposition()

---

### OBJECTIF 2: Tests + Polish (5%)

**Tests à faire:**

1. **Responsive Design:**
   - ✅ Mobile (375px - iPhone SE)
   - ✅ Tablet (1024px - iPad)
   - ✅ Desktop (1920px)
   - Vérifier: Boutons cliquables, texte lisible, images responsive

2. **Edge Cases:**
   - Panier vide → Soumettre → Error?
   - Projet non sélectionné → Bouton submit désactivé?
   - Commande sans items → Affichage propre?
   - Excel avec 0 commandes → Tableau vide?
   - PDF avec remarques très longs → Pagination?

3. **Cross-browser:**
   - Chrome, Firefox, Safari, Edge
   - Sur vrais appareils si possible

4. **Performance:**
   - Catalog avec 1000+ pièces → Chargement OK?
   - Export Excel 100+ commandes → Pas de freeze?

**Polish:**
- Vérifier tous les espacements (20px, 15px, 10px)
- Vérifier tous les boutons (44px min tactile)
- Vérifier tous les formulaires (inputs validés)
- Vérifier messagess d'erreur (clairs, visibles)
- Vérifier notifications (3s, bien positionnées)
- Vérifier dark/light mode si applicable

---

### OBJECTIF 3: Déploiement Vercel (5%)

**Étapes:**

1. **Créer compte Vercel**
   - https://vercel.com
   - Lier GitHub account

2. **Créer projet Vercel**
   - Importer repo GitHub: ~/toolstock
   - Branch: main
   - Framework: Vite
   - Build: `npm run build`
   - Output: `dist`

3. **Variables d'environnement Vercel:**
   ```
   VITE_SUPABASE_URL=<votre_url_supabase>
   VITE_SUPABASE_ANON_KEY=<votre_clé_anon>
   ```
   (Récupérer depuis Settings → API → URL & Keys dans Supabase)

4. **Configurer domaine toolplanification.com**
   - Dans Vercel: Settings → Domains
   - Ajouter domaine: toolplanification.com
   - Voir instructions DNS (enregistrements A/CNAME)
   - Pointer vers serveur Vercel
   - Vérifier DNS propagation (~24h)

5. **Tests Production:**
   - Login avec credentials
   - Catalog chargement
   - Panier + submit
   - Export PDF + Excel
   - Admin panel

6. **Monitoring:**
   - Vercel Analytics → Performance
   - Vérifier logs erreurs

**Fichiers à vérifier:**
- `.env.local` → Ne JAMAIS push sur GitHub
- `package.json` → Toutes les dépendances listées
- `vite.config.js` → Config OK
- `src/utils/supabaseClient.js` → URLs from env vars

---

## 📊 PRIORITÉS SESSION 6

```
P1 (CRITIQUE): Sous-ensembles - "Commander un sous-ensemble complet"
P2 (IMPORTANT): Tests sur vrais appareils (mobile surtout)
P3 (NICE-TO-HAVE): Déploiement Vercel
```

---

## ⏱️ ESTIMATION TEMPS

| Objectif | Temps | Priorité |
|----------|-------|----------|
| Sous-ensembles | 1-2h | P1 |
| Tests | 1-2h | P2 |
| Déploiement | 30min-1h | P3 |
| **TOTAL** | **3-5h** | - |

---

## ✅ CHECKLIST AVANT DÉMARRER SESSION 6

- ✅ Lire JOURNAL_SESSIONS.md (Sessions 1-5)
- ✅ Lire CONTEXTE_GLOBAL.txt (État actuel)
- ✅ `git pull origin main` (Récupérer derniers commits)
- ✅ `npm install` (Dépendances à jour)
- ✅ Vérifier console (F12) → Aucune erreur
- ✅ Tester app localement (npm run dev)

---

## 🎯 FIN DE PHASE v1

Après Session 6:
```
✅ 100% v1 complétée
├─ Catalog + Panier + Commandes
├─ Validation Chef
├─ Admin Panel CRUD
├─ Export PDF + Excel
├─ Sous-ensembles commander complet
├─ Tests responsive + edge cases
└─ Déployé sur toolplanification.com
```

**Prêt pour v2!**

---

## 📝 NOTES IMPORTANTES

1. **Sous-ensembles:** Les quantités viennent de `sub_assembly_pieces.quantite`, pas du nombre d'items!
2. **Tests:** Priorité MOBILE (mécaniciens sur site avec téléphones)
3. **Déploiement:** Vérifier variables d'environnement (PAS les durs-coder!)
4. **Git:** Committer régulièrement, ne pas attendre la fin!

---

**Créé:** March 21, 2026  
**Prochaine étape:** Session 6 - Finish line! 🏁  
**Statut:** Prêt à démarrer
