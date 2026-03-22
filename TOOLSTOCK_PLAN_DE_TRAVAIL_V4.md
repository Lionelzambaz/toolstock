# 📋 TOOLSTOCK - Plan de Travail Complet v4

**Date**: Mars 2026  
**Version**: V4 (v1 COMPLÉTÉE - PRODUCTION READY) ✅  
**Statut**: **100% TERMINÉ - APP DÉPLOYÉE**  
**Stack**: React + Supabase + Tailwind CSS (Responsive) + PDF Export  
**Déploiement**: Vercel + domaine toolplanification.com  
**URL**: https://toolplanification.com 🚀

---

## 📑 Table des matières

1. [Statut Global](#statut-global)
2. [Architecture Supabase](#architecture-supabase)
3. [Rôles et permissions](#rôles-et-permissions)
4. [Flux métier](#flux-métier)
5. [Modules frontend](#modules-frontend)
6. [Features implémentées](#features-implémentées)
7. [Lucide Icons](#lucide-icons)
8. [Déploiement Production](#déploiement-production)
9. [Roadmap v2](#roadmap-v2)

---

## 🎯 Statut Global

### ✅ V1 COMPLÉTÉE À 100%

```
✅ Supabase architecture (8 tables)
✅ Authentification (email/password)
✅ Catalog avec filtres + sous-ensembles
✅ Panier fonctionnel
✅ Commandes (workflow complet)
✅ Validation chef
✅ Export PDF + Excel
✅ Admin panel (CRUD)
✅ Lucide icons
✅ Menu vertical responsive
✅ Déploiement Vercel live
✅ Domain toolplanification.com actif
```

### 📊 Résumé Stats:
- **Temps développement:** 6 sessions
- **Tables Supabase:** 8
- **Composants React:** 25+
- **Pages:** 7
- **Hooks custom:** 4
- **Users ready:** Oui ✅
- **Production:** LIVE 🚀

---

## 🗄️ Architecture Supabase (FINALE)

### 8 Tables Relationnelles

#### 1. **users** (Authentification)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'mechanic',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

Rôles: `mechanic` | `supervisor` | `admin`

---

#### 2. **projects** (Installations)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  numero_projet VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

#### 3. **pieces** (Catalogue - AVEC NOUVEAUX CHAMPS)
```sql
CREATE TABLE pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero_fournisseur VARCHAR(255) UNIQUE NOT NULL,
  numero_interne VARCHAR(255) UNIQUE NOT NULL,
  numero_dessin VARCHAR(255),           -- SESSION 6 ✅
  position_dessin VARCHAR(255),         -- SESSION 6 ✅
  fournisseur VARCHAR(255) NOT NULL,
  denomination VARCHAR(255) NOT NULL,
  descriptif TEXT,
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

#### 4. **sub_assemblies** (Sous-ensembles)
```sql
CREATE TABLE sub_assemblies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

#### 5. **sub_assembly_pieces** (Relation: Pièces ↔ Sous-ensembles)
```sql
CREATE TABLE sub_assembly_pieces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sub_assembly_id UUID NOT NULL REFERENCES sub_assemblies(id),
  piece_id UUID NOT NULL REFERENCES pieces(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(sub_assembly_id, piece_id)
);
```

**IMPORTANT:** Quantités définies par sous-ensemble (une pièce peut avoir différentes qty dans différents sous-ensembles)

---

#### 6. **project_sub_assembly** (Relation: Projets ↔ Sous-ensembles)
```sql
CREATE TABLE project_sub_assembly (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id),
  sub_assembly_id UUID NOT NULL REFERENCES sub_assemblies(id),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(project_id, sub_assembly_id)
);
```

---

#### 7. **commands** (Commandes - AVEC REMARQUES)
```sql
CREATE TABLE commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  supervisor_id UUID REFERENCES users(id),
  supervisor_comments TEXT,
  remarques TEXT,                       -- SESSION 5 ✅ Notes créateur
  created_at TIMESTAMP DEFAULT now(),
  validated_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT now()
);
```

Status: `draft` | `pending` | `validated` | `rejected` | `archived`

---

#### 8. **command_items** (Lignes de commande)
```sql
CREATE TABLE command_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  command_id UUID NOT NULL REFERENCES commands(id),
  piece_id UUID NOT NULL REFERENCES pieces(id),
  quantite INTEGER NOT NULL DEFAULT 1,
  prix_unitaire DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

---

## 🔐 Rôles et Permissions (FINAL)

### Matrice des droits

| Action | Mécanicien | Chef | Admin |
|--------|-----------|------|-------|
| Voir catalogue | ✅ | ✅ | ✅ |
| Créer panier | ✅ | ✅ | ✅ |
| Soumettre commande | ✅ | ✅ | ✅ |
| Voir ses commandes | ✅ | ✅ (toutes) | ✅ (toutes) |
| Valider commande | — | ✅ | ✅ |
| Refuser commande | — | ✅ | ✅ |
| Modifier commande | — | ✅ | ✅ |
| Export PDF | — | ✅ | ✅ |
| Export Excel | ✅ (ses cmds) | ✅ (toutes) | ✅ (toutes) |
| Gérer catalogue | — | — | ✅ |
| Admin panel | — | — | ✅ |

### Implémentation
- Supabase Auth + table users avec rôle
- RLS (Row Level Security) sur tables sensibles
- Permissions cascade: mechanic → supervisor → admin

---

## 📊 Flux métier (COMPLET)

### Flux 1: Commander des pièces du catalogue

```
1. MÉCANICIEN - Page Catalogue
   ├─ Voir toutes les pièces
   ├─ Rechercher par N° interne, dénomination, fournisseur
   ├─ Filtrer par projet, sous-ensemble
   └─ Cliquer pièce → Ajouter panier

2. MÉCANICIEN - Panier
   ├─ Voir items en attente
   ├─ Modifier quantités
   ├─ Sélectionner projet
   ├─ Ajouter remarques (optionnel)
   └─ Cliquer "Soumettre commande"

3. SYSTÈME - Soumission
   ├─ Crée commande (status: draft → pending)
   ├─ Enregistre tous items + prix snapshot
   └─ Notification chef

4. CHEF - ValidationPage
   ├─ Voit commandes PENDING
   ├─ Peut: VALIDER / REFUSER / MODIFIER
   ├─ Ajoute commentaires
   └─ Si VALIDER: PDF généré + envoyé
```

---

### Flux 2: Consulter un sous-ensemble

```
1. MÉCANICIEN/CHEF - Catalogue → Sous-ensembles
   ├─ Clique sur sous-ensemble
   └─ Affiche composition avec quantités

2. Tableau composition:
   ├─ N° Interne
   ├─ Dénomination
   ├─ Quantité (de sub_assembly_pieces!)
   ├─ Prix unitaire
   └─ Sous-total

3. Bouton "Commander ce sous-ensemble complet"
   ├─ Lit sub_assembly_pieces
   ├─ Ajoute tous items au panier
   └─ Utilisateur peut modifier après
```

---

### Flux 3: Exporter historique

```
1. CHEF/ADMIN - Page Commandes
   ├─ Filtres: Status, Projet, Créateur, Date
   ├─ Bouton "📊 Exporter Excel"
   └─ Télécharge Commandes_JJ-MM-AAAA.xlsx

2. Contenu Excel:
   ├─ En-têtes: Bleu #185FA5, AutoFilter
   ├─ 12 colonnes: Date, Projet, N° Int, N° Fourni, Dénomination, Qty, Prix U, Montant, Fournisseur, Status, Créateur, Commentaires
   ├─ CHAQUE LIGNE = 1 item complet
   ├─ Formule SUBTOTAL(109, H:H)
   └─ Ligne TOTAL: Fond bleu clair

3. CHEF/ADMIN - Si commande VALIDATED
   ├─ Bouton "📄 Exporter PDF"
   └─ Télécharge BonCommande_CMD-XXXXXXXX_JJ-MM-AAAA.pdf
```

---

## 🎨 Modules Frontend (IMPLÉMENTÉS)

### Module 1: Authentification ✅
- Page Login (email/password)
- Logout button
- Redirection selon rôle

### Module 2: Catalogue ✅
- Grille responsive (1-4 colonnes)
- Recherche + Filtres intelligents
- PieceCard avec icônes Lucide
- PieceModal avec détails
- **Sous-ensembles** avec composition
- **Bouton "Commander sous-ensemble complet"** ✅

### Module 3: Panier ✅
- Tableau items
- Modification quantités
- **Colonne N° Fournisseur** ✅
- Sélection projet
- Remarques (optionnel)
- Résumé total

### Module 4: Commandes ✅
- Historique avec filtres
- Modale détails
- Affichage créateur/supervisor
- Suppression draft/pending
- Affichage remarques
- Affichage commentaires chef

### Module 5: Validation ✅
- Dashboard commandes PENDING
- Valider/Refuser/Modifier
- Ajouter commentaires
- **PDF généré automatiquement** ✅
- Créateur affichage partout

### Module 6: Exports ✅
- **PDF bon de commande** (Session 5) ✅
  - En-tête + infos + tableau + total
  - Nom: BonCommande_CMD-XXXXXXXX_JJ-MM-AAAA.pdf
- **Excel historique** (Session 5) ✅
  - Tableau filtrable + formule SUBTOTAL
  - Nom: Commandes_JJ-MM-AAAA.xlsx

### Module 7: Admin ✅
- CRUD Pièces (avec N° Dessin + Position) ✅
- CRUD Projets
- CRUD Sous-ensembles
- CRUD Users
- **Barres de recherche** sur toutes les pages ✅
- Lier pièces↔projets, pièces↔sous-ensembles

---

## 🎨 Lucide Icons (SESSION 6) ✅

### Installation
```bash
npm install lucide-react
```

### Icons Utilisées

**AdminPage.jsx:**
```javascript
import { Wrench, CableCar, Layers, Users } from 'lucide-react'
// Wrench → Pièces
// CableCar → Projets
// Layers → Sous-ensembles
// Users → Utilisateurs
```

**CatalogPage.jsx:**
```javascript
import { Search, Factory, Building2, Layers, RotateCcw, Plus, CableCar } from 'lucide-react'
// Search → Recherche (16px)
// Factory → Fournisseur (16px)
// CableCar → Projet (16px)
// Layers → Sous-ensemble (16px)
// RotateCcw → Réinitialiser (14px)
// Plus → Commander sous-ensemble (18px)
```

**PieceCard.jsx:**
```javascript
import { ShoppingCart, Eye } from 'lucide-react'
// ShoppingCart → Panier (18px)
// Eye → Détails (18px)
```

**AdminMenuVertical.jsx (NEW):**
```javascript
import { BookOpen, ShoppingCart, FileText, CheckCircle, Settings } from 'lucide-react'
// BookOpen → Catalogue
// ShoppingCart → Panier
// FileText → Mes commandes
// CheckCircle → Validation (supervisor+)
// Settings → Admin (admin only)
```

### Menu Vertical Design
- Width: 62px (slim), 250px hover (volet)
- Background: #042C53 (marine)
- Active button: #185FA5
- Transition: 0.3s smooth
- Mobile: Bottom bar 56px instead of left
- Icons + labels on hover

---

## 🚀 Déploiement Production (SESSION 6)

### Vercel Setup ✅
- Repo: Lionelzambaz/toolstock (GitHub)
- Branch: main (auto-deploy)
- Build: `npm run build` → dist/
- Framework: Vite

### Domain Configuration ✅
- Domain: **toolplanification.com**
- Registrar: Infomaniak
- DNS: CNAME pointé vers Vercel
- SSL/HTTPS: Automatic
- Status: **LIVE & ACCESSIBLE** 🚀

### Environment Variables
```
VITE_SUPABASE_URL=<votre_url>
VITE_SUPABASE_ANON_KEY=<votre_clé>
```

### Monitoring
- Vercel Analytics: Active
- Auto-deploy on push main
- Real-time logs & metrics

---

## 📊 Roadmap v2 (Plus tard)

### v2.1: Kits de Maintenance
- Admin crée kits pré-définis
- Mécanicien commande kit en 1 clic
- Tables: kits, kit_items

### v2.2: Bulletins Vierges
- Formulaire pour commandes hors-catalogue
- Admin ajoute pièces librement
- Utile pour exceptions/urgences

### v2.3: Analytics Dashboard
- Graphiques: Commandes/mois, Top pièces, Montant/projet
- Filtres: Date, projet, fournisseur

### v2.4: Email Notifications
- Auto-email à soumission (chef)
- Auto-email à validation (achats)
- Webhook vers systèmes tiers

### v2.5: API REST
- Endpoints publiques pour ERP
- Authentification token

### v2.6: Mobile App
- React Native version
- Offline support
- Scan codes-barres

---

## ✅ Checklist Final v1

- ✅ Supabase tables + indexes
- ✅ Authentification
- ✅ RLS (Row Level Security)
- ✅ Catalog avec filtres
- ✅ Panier fonctionnel
- ✅ Commandes workflow
- ✅ Validation chef
- ✅ PDF export
- ✅ Excel export
- ✅ Sous-ensembles
- ✅ Admin panel
- ✅ Lucide icons
- ✅ Menu vertical
- ✅ Recherche admin
- ✅ N° Fournisseur panier
- ✅ Responsive design
- ✅ Vercel deployment
- ✅ Domain active
- ✅ CI/CD pipeline
- ✅ Monitoring

---

## 📝 Notes Importantes

**Production:**
- App LIVE sur https://toolplanification.com 🚀
- Déploiement automatique (GitHub → Vercel)
- Users prêts pour onboarding
- Performance excellent (Vercel CDN)

**Maintenance:**
- Supabase backups: Automatic
- Vercel logs: Real-time
- Analytics: Enabled

**Prochaines étapes:**
- Onboarding users
- Feedback collection
- v2 features planning

---

**Document créé**: Mars 2026  
**Dernière mise à jour**: Mars 22, 2026 (v4 - Production Release)  
**Version**: V4 (v1 100% COMPLÉTÉE)  
**Statut**: ✅ **PRODUCTION READY - LIVE**  
**URL**: https://toolplanification.com

**Changements V4:**
- ✅ v1 COMPLÉTÉE à 100%
- ✅ Lucide icons intégrées
- ✅ Menu vertical responsive
- ✅ Barres recherche admin
- ✅ Colonne N° Fournisseur panier
- ✅ Sous-ensembles commander complet
- ✅ Déploiement Vercel + domain
- ✅ Production monitoring
- ✅ Sessions 1-6 intégrées
