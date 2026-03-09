# 📁 Guide de Configuration des Fichiers - Les Bulles de Joie

## 🗂️ Structure des dossiers

```
votre-projet/
├── public/                          ← Dossier des fichiers statiques
│   ├── bulletins/                   ← Dossier des bulletins PDF
│   │   ├── CE1-001_bulletin.pdf
│   │   ├── CE1-002_bulletin.pdf
│   │   ├── CE1-003_bulletin.pdf
│   │   ├── CE1-004_bulletin.pdf
│   │   ├── CE1-005_bulletin.pdf
│   │   ├── CE1-006_bulletin.pdf
│   │   ├── CE1-007_bulletin.pdf
│   │   ├── CE1-008_bulletin.pdf
│   │   ├── CE1-009_bulletin.pdf
│   │   ├── CE1-010_bulletin.pdf
│   │   ├── CI-001_bulletin.pdf
│   │   ├── CI-002_bulletin.pdf
│   │   ├── CP-001_bulletin.pdf
│   │   ├── CP-002_bulletin.pdf
│   │   ├── CE2-001_bulletin.pdf
│   │   └── CE2-002_bulletin.pdf
│   │
│   ├── logo.png                     ← Logo de l'école (512x512px recommandé)
│   ├── favicon.ico                  ← Icône du navigateur (optionnel)
│   ├── manifest.json                ← ✅ Déjà créé
│   ├── icon-192.svg                 ← ✅ Déjà créé (icône PWA)
│   ├── icon-512.svg                 ← ✅ Déjà créé (icône PWA)
│   └── icon-maskable.svg            ← ✅ Déjà créé (icône Android)
│
├── src/                             ← Code source (déjà complet)
├── index.html                       ← ✅ Déjà créé
├── package.json                     ← ✅ Déjà créé
└── ...
```

---

## 📄 1. BULLETINS PDF

### Emplacement
```
public/bulletins/
```

### Format de nommage
```
{MATRICULE}_bulletin.pdf
```

### Exemples
| Matricule | Nom du fichier |
|-----------|----------------|
| CE1-001 | `CE1-001_bulletin.pdf` |
| CE1-002 | `CE1-002_bulletin.pdf` |
| CE1-003 | `CE1-003_bulletin.pdf` |
| CE1-004 | `CE1-004_bulletin.pdf` |
| CE1-005 | `CE1-005_bulletin.pdf` |
| CE1-006 | `CE1-006_bulletin.pdf` |
| CE1-007 | `CE1-007_bulletin.pdf` |
| CE1-008 | `CE1-008_bulletin.pdf` |
| CE1-009 | `CE1-009_bulletin.pdf` |
| CE1-010 | `CE1-010_bulletin.pdf` |
| CI-001 | `CI-001_bulletin.pdf` |
| CI-002 | `CI-002_bulletin.pdf` |
| CP-001 | `CP-001_bulletin.pdf` |
| CP-002 | `CP-002_bulletin.pdf` |
| CE2-001 | `CE2-001_bulletin.pdf` |
| CE2-002 | `CE2-002_bulletin.pdf` |

### Chemin dans le code
```javascript
// Dans src/pages/DashboardPage.tsx ligne ~45
const pdfPath = `/bulletins/${student.id}_bulletin.pdf`;
```

---

## 🖼️ 2. LOGO

### Emplacement
```
public/logo.png
```

### Spécifications
- **Format** : PNG (fond transparent recommandé)
- **Taille recommandée** : 512x512 pixels
- **Taille minimale** : 256x256 pixels
- **Format alternatif accepté** : SVG, JPG, WEBP

### Utilisé dans
| Fichier | Ligne | Usage |
|---------|-------|-------|
| `src/components/Header.tsx` | ~35 | Header de toutes les pages |
| `src/components/Footer.tsx` | ~15 | Footer de toutes les pages |
| `src/pages/LoginPage.tsx` | ~95 | Page de connexion |
| `src/components/SplashScreen.tsx` | Logo dans l'intro (optionnel - emoji par défaut) |

### Fallback
Si le logo n'existe pas, un emoji 🎈 s'affiche automatiquement.

---

## 🔖 3. FAVICON

### Emplacement
```
public/favicon.ico
```

### Spécifications
- **Format** : ICO ou PNG
- **Tailles** : 16x16, 32x32, 48x48 pixels
- **Optionnel** : Non requis, les icônes SVG PWA sont utilisées

---

## 📱 4. ICÔNES PWA (Déjà créées ✅)

Ces fichiers sont **déjà créés** et fonctionnels :

| Fichier | Taille | Usage |
|---------|--------|-------|
| `public/icon-192.svg` | 192x192 | Icône standard PWA |
| `public/icon-512.svg` | 512x512 | Icône haute résolution |
| `public/icon-maskable.svg` | 512x512 | Icône Android (zone safe) |
| `public/manifest.json` | - | Configuration PWA |

### Apparence de l'icône
- 🎈 Ballon rose sur fond dégradé rose
- 🔒 Badge cadenas vert en bas à droite
- Nom affiché : "🎈🔒 Bulles"

---

## 🔑 5. IDENTIFIANTS (Déjà configurés ✅)

Les identifiants sont dans `src/providers/AuthProvider.tsx` :

| Classe | Matricule | Mot de passe | Nom complet |
|--------|-----------|--------------|-------------|
| CE1 | CE1-001 | fifame | AGBLO AGONDJIHOSSOU Fifamè |
| CE1 | CE1-002 | emmanuel | AKYOH Emmanuel |
| CE1 | CE1-003 | yinki | AMADOU Yinki |
| CE1 | CE1-004 | rahama | BANI Rahama |
| CE1 | CE1-005 | noham | DAHOUGOU Noham |
| CE1 | CE1-006 | queen | EDAH Queen |
| CE1 | CE1-007 | mekaddishem | HOUEHOU Mékaddishem |
| CE1 | CE1-008 | faith | PADONOU Faith |
| CE1 | CE1-009 | peniel | SOVI Péniel |
| CE1 | CE1-010 | naelle | TOSSAVI Naelle |
| CI | CI-001 | eleve1 | Élève CI-001 |
| CI | CI-002 | eleve2 | Élève CI-002 |
| CP | CP-001 | elevecp1 | Élève CP-001 |
| CP | CP-002 | elevecp2 | Élève CP-002 |
| CE2 | CE2-001 | elevece2-1 | Élève CE2-001 |
| CE2 | CE2-002 | elevece2-2 | Élève CE2-002 |

---

## ✅ Vérification des chemins dans le code

### 1. Logo (`/logo.png`)
```tsx
// src/components/Header.tsx
<img src="/logo.png" alt="Les Bulles de Joie" ... />

// src/components/Footer.tsx
<img src="/logo.png" alt="Les Bulles de Joie" ... />

// src/pages/LoginPage.tsx
<img src="/logo.png" alt="Les Bulles de Joie" ... />
```

### 2. Bulletins PDF (`/bulletins/{ID}_bulletin.pdf`)
```tsx
// src/pages/DashboardPage.tsx
const pdfPath = `/bulletins/${student.id}_bulletin.pdf`;
```

### 3. Manifest PWA (`/manifest.json`)
```html
<!-- index.html -->
<link rel="manifest" href="/manifest.json" />
```

### 4. Icônes PWA
```json
// public/manifest.json
{
  "icons": [
    { "src": "/icon-192.svg", "sizes": "192x192" },
    { "src": "/icon-512.svg", "sizes": "512x512" },
    { "src": "/icon-maskable.svg", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

---

## 🚀 Commandes pour créer la structure

### Sur Linux/Mac/Termux
```bash
mkdir -p public/bulletins

# Créer des fichiers PDF vides (à remplacer par les vrais)
touch public/bulletins/CE1-001_bulletin.pdf
touch public/bulletins/CE1-002_bulletin.pdf
touch public/bulletins/CE1-003_bulletin.pdf
touch public/bulletins/CE1-004_bulletin.pdf
touch public/bulletins/CE1-005_bulletin.pdf
touch public/bulletins/CE1-006_bulletin.pdf
touch public/bulletins/CE1-007_bulletin.pdf
touch public/bulletins/CE1-008_bulletin.pdf
touch public/bulletins/CE1-009_bulletin.pdf
touch public/bulletins/CE1-010_bulletin.pdf
touch public/bulletins/CI-001_bulletin.pdf
touch public/bulletins/CI-002_bulletin.pdf
touch public/bulletins/CP-001_bulletin.pdf
touch public/bulletins/CP-002_bulletin.pdf
touch public/bulletins/CE2-001_bulletin.pdf
touch public/bulletins/CE2-002_bulletin.pdf

# Logo (à remplacer par le vrai)
touch public/logo.png

echo "✅ Structure créée !"
```

### Sur Windows (PowerShell)
```powershell
New-Item -ItemType Directory -Force -Path "public\bulletins"

# Créer les fichiers
$ids = @("CE1-001","CE1-002","CE1-003","CE1-004","CE1-005","CE1-006","CE1-007","CE1-008","CE1-009","CE1-010","CI-001","CI-002","CP-001","CP-002","CE2-001","CE2-002")
foreach ($id in $ids) {
    New-Item -ItemType File -Force -Path "public\bulletins\$($id)_bulletin.pdf"
}

Write-Host "✅ Structure créée !"
```

---

## 📋 Checklist finale

- [ ] Logo placé dans `public/logo.png`
- [ ] Dossier `public/bulletins/` créé
- [ ] Bulletins PDF nommés `{MATRICULE}_bulletin.pdf`
- [ ] Tous les fichiers PDF correspondent aux matricules des élèves
- [ ] Build testé avec `npm run build`
- [ ] Déploiement sur Vercel effectué

---

## 🔧 En cas de problème

### Le logo ne s'affiche pas
1. Vérifier que le fichier existe : `public/logo.png`
2. Vérifier le format (PNG, JPG, SVG acceptés)
3. Un emoji 🎈 s'affiche automatiquement en fallback

### Le bulletin ne se télécharge pas
1. Vérifier que le fichier existe dans `public/bulletins/`
2. Vérifier le nom : doit être exactement `{MATRICULE}_bulletin.pdf`
3. Vérifier que c'est un vrai PDF (pas un fichier vide)

### L'icône PWA ne s'affiche pas
1. Vider le cache du navigateur
2. Réinstaller l'application
3. Les fichiers SVG sont déjà créés et fonctionnels

---

**© 2025 Les Bulles de Joie - Parakou, Bénin**
