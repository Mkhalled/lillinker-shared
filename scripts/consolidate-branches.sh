#!/usr/bin/env bash
# ============================================================
# consolidate-branches.sh
# Crée develop-ia depuis develop et merge les branches validées.
# SAFE : jamais de force-push, jamais d'auto-résolution de conflits.
# Usage : bash scripts/consolidate-branches.sh
# ============================================================

set -euo pipefail

# ---- Helpers couleur ----------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_info()  { echo -e "${BLUE}[INFO]${NC}  $*"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
log_skip()  { echo -e "${CYAN}[SKIP]${NC}  $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_head()  { echo -e "\n${BOLD}${BLUE}=== $* ===${NC}\n"; }

# ---- Configuration ------------------------------------------
BASE_BRANCH="develop"
TARGET_BRANCH="develop-ia"

# Branches à merger IN ORDER — format "ref:raison"
# ref peut être un nom de branche local ou origin/nom
MERGE_BRANCHES=(
  "origin/fix-next-update-errors:bugfixes: redirect verify-email, nettoyage seed.ts, suppression prisma db seed du vercel-build"
)

# Commits à cherry-pick — format "SHA:raison"
# DÉCOMMENTEZ et remplissez le SHA si vous souhaitez ajouter des cherry-picks
CHERRY_PICK_COMMITS=(
  # Exemple : "abc1234:add .npmrc pnpm hoisting config (from sprint-1, sans suppressions d'icônes)"
)

# ---- Vérifications préalables --------------------------------
log_head "Lillinker — Script de consolidation des branches"
log_info "Base : ${BOLD}$BASE_BRANCH${NC}  →  Cible : ${BOLD}$TARGET_BRANCH${NC}"

# Vérifier que nous sommes dans un dépôt git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  log_error "Pas dans un dépôt git. Lancer depuis la racine du projet."
  exit 1
fi

# Vérifier que le répertoire de travail est propre
if [[ -n "$(git status --porcelain)" ]]; then
  log_error "Le répertoire de travail n'est pas propre. Committez ou stashez vos changements."
  git status --short
  exit 1
fi

# Fetch toutes les branches distantes
log_info "Fetch de toutes les branches distantes..."
git fetch --all --prune
log_ok "Fetch terminé."

# ---- Analyse pré-merge ---------------------------------------
log_head "Analyse de la topologie des branches vs $BASE_BRANCH"

ALL_REMOTE=$(git branch -r --format="%(refname:short)" \
  | grep -v "origin/HEAD" \
  | grep -v "origin/$TARGET_BRANCH" \
  | grep -v "origin/main" \
  || true)

printf "\n${BOLD}%-55s %s${NC}\n" "BRANCHE" "COMMITS UNIQUES vs $BASE_BRANCH"
printf "%-55s %s\n" "-------" "-------------------------------"

for branch in $ALL_REMOTE; do
  count=$(git log --oneline "$BASE_BRANCH".."$branch" 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$count" -eq 0 ]]; then
    printf "%-55s ${GREEN}%s${NC}\n" "$branch" "✓ MERGED (0 commit unique)"
  else
    printf "%-55s ${YELLOW}%s${NC}\n" "$branch" "⚠ $count COMMIT(S) UNIQUE(S)"
  fi
done

echo ""
read -rp "$(echo -e "${BOLD}Continuer avec la consolidation ? [y/N]${NC} ")" confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  log_warn "Annulé par l'utilisateur."
  exit 0
fi

# ---- Créer ou basculer sur develop-ia ------------------------
log_head "Préparation de la branche $TARGET_BRANCH"

if git show-ref --verify --quiet "refs/heads/$TARGET_BRANCH"; then
  log_warn "La branche $TARGET_BRANCH existe déjà localement."
  read -rp "$(echo -e "Basculer dessus et merger $BASE_BRANCH dedans ? [y/N] ")" reuse
  if [[ "$reuse" != "y" && "$reuse" != "Y" ]]; then
    log_warn "Annulé. Supprimez ou renommez $TARGET_BRANCH manuellement et relancez."
    exit 0
  fi
  git checkout "$TARGET_BRANCH"
  log_info "Merge du dernier état de $BASE_BRANCH dans $TARGET_BRANCH..."
  if ! git merge "$BASE_BRANCH" --no-ff -m "merge(base): sync $TARGET_BRANCH avec $BASE_BRANCH"; then
    log_error "Conflit lors du merge de $BASE_BRANCH dans $TARGET_BRANCH."
    log_error "Résolvez les conflits, puis relancez le script."
    exit 1
  fi
else
  git checkout "$BASE_BRANCH"
  git pull origin "$BASE_BRANCH" --ff-only 2>/dev/null || log_warn "Impossible de pull $BASE_BRANCH (continuer quand même)"
  git checkout -b "$TARGET_BRANCH"
  log_ok "Branche $TARGET_BRANCH créée depuis $BASE_BRANCH."
fi

echo ""

# ---- Tracking -----------------------------------------------
MERGED=()
SKIPPED=()
CONFLICTS=()

# ---- Merge des branches approuvées ---------------------------
if [[ ${#MERGE_BRANCHES[@]} -gt 0 ]]; then
  log_head "Traitement des branches à merger"

  for entry in "${MERGE_BRANCHES[@]}"; do
    branch="${entry%%:*}"
    reason="${entry#*:}"

    echo -e "${BOLD}Branche :${NC} $branch"
    echo -e "${BOLD}Raison  :${NC} $reason"

    # Vérifier les commits uniques
    unique=$(git log --oneline "$TARGET_BRANCH".."$branch" 2>/dev/null | wc -l | tr -d ' ')
    if [[ "$unique" -eq 0 ]]; then
      log_skip "$branch → déjà contenue dans $TARGET_BRANCH."
      SKIPPED+=("$branch (déjà mergée)")
      echo ""
      continue
    fi

    log_info "$unique commit(s) unique(s) à intégrer :"
    git log --oneline "$TARGET_BRANCH".."$branch" | sed 's/^/  /'
    echo ""

    read -rp "$(echo -e "  Que faire ? ${BOLD}[y=merger / n=ignorer / d=voir le diff complet]${NC} ")" choice

    if [[ "$choice" == "d" || "$choice" == "D" ]]; then
      echo ""
      git diff "$TARGET_BRANCH".."$branch" --stat
      echo ""
      git diff "$TARGET_BRANCH".."$branch" | head -100
      echo ""
      read -rp "  Merger après revue ? [y/N] " choice
    fi

    if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
      log_skip "$branch → ignoré par l'utilisateur."
      SKIPPED+=("$branch (ignoré)")
      echo ""
      continue
    fi

    # Tentative de merge
    if git merge "$branch" --no-ff -m "merge(consolidation): $branch - $reason"; then
      log_ok "$branch mergé avec succès."
      MERGED+=("$branch")
    else
      log_error "CONFLIT détecté lors du merge de $branch."
      log_error "Fichiers en conflit :"
      git diff --name-only --diff-filter=U | sed 's/^/  /'
      echo ""
      log_error "Le merge est en pause. Résolvez les conflits manuellement, puis :"
      log_error "  git add <fichiers résolus>"
      log_error "  git merge --continue"
      log_error "Ensuite relancez ce script pour les branches restantes."
      CONFLICTS+=("$branch")
      exit 1
    fi
    echo ""
  done
fi

# ---- Cherry-pick de commits spécifiques ---------------------
if [[ ${#CHERRY_PICK_COMMITS[@]} -gt 0 ]]; then
  log_head "Traitement des cherry-picks"

  for entry in "${CHERRY_PICK_COMMITS[@]}"; do
    sha="${entry%%:*}"
    reason="${entry#*:}"

    echo -e "${BOLD}Commit :${NC} $sha"
    echo -e "${BOLD}Raison :${NC} $reason"

    if git merge-base --is-ancestor "$sha" HEAD 2>/dev/null; then
      log_skip "Commit $sha → déjà dans $TARGET_BRANCH."
      SKIPPED+=("cherry-pick $sha (déjà présent)")
      echo ""
      continue
    fi

    git show --stat "$sha" | head -15
    echo ""

    read -rp "  Appliquer ce cherry-pick ? [y/N] " choice
    if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
      log_skip "cherry-pick $sha ignoré."
      SKIPPED+=("cherry-pick $sha (ignoré)")
      echo ""
      continue
    fi

    if git cherry-pick "$sha"; then
      log_ok "Cherry-pick $sha appliqué."
      MERGED+=("cherry-pick:$sha")
    else
      log_error "CONFLIT lors du cherry-pick de $sha."
      log_error "Résolvez les conflits, puis :"
      log_error "  git add <fichiers résolus>"
      log_error "  git cherry-pick --continue"
      CONFLICTS+=("cherry-pick:$sha")
      exit 1
    fi
    echo ""
  done
fi

# ---- Rapport final ------------------------------------------
log_head "Rapport de consolidation"

if [[ ${#MERGED[@]} -gt 0 ]]; then
  echo -e "${GREEN}${BOLD}MERGÉS (${#MERGED[@]})${NC} :"
  for m in "${MERGED[@]}"; do echo "  + $m"; done
  echo ""
fi

if [[ ${#SKIPPED[@]} -gt 0 ]]; then
  echo -e "${CYAN}${BOLD}IGNORÉS (${#SKIPPED[@]})${NC} :"
  for s in "${SKIPPED[@]}"; do echo "  ~ $s"; done
  echo ""
fi

if [[ ${#CONFLICTS[@]} -gt 0 ]]; then
  echo -e "${RED}${BOLD}CONFLITS (${#CONFLICTS[@]})${NC} :"
  for c in "${CONFLICTS[@]}"; do echo "  ! $c"; done
  echo ""
fi

log_info "Commits ajoutés à $TARGET_BRANCH vs $BASE_BRANCH :"
git log --oneline "$BASE_BRANCH".."$TARGET_BRANCH" | head -20
echo ""

# ---- Push optionnel -----------------------------------------
read -rp "$(echo -e "${BOLD}Pousser $TARGET_BRANCH vers origin ? [y/N]${NC} ")" push_confirm
if [[ "$push_confirm" == "y" || "$push_confirm" == "Y" ]]; then
  if git push origin "$TARGET_BRANCH" 2>/dev/null || git push --set-upstream origin "$TARGET_BRANCH"; then
    log_ok "Branche $TARGET_BRANCH poussée vers origin."
  else
    log_warn "Push échoué. Essayez manuellement :"
    log_warn "  git push --set-upstream origin $TARGET_BRANCH"
  fi
else
  log_info "Push ignoré. Commande pour pousser manuellement :"
  log_info "  git push --set-upstream origin $TARGET_BRANCH"
fi

echo ""
log_ok "=== Consolidation terminée ==="

# ---- Rappel cherry-pick manuel .npmrc -----------------------
echo ""
echo -e "${YELLOW}${BOLD}RAPPEL — Étape manuelle recommandée :${NC}"
echo "Créer .npmrc sur develop-ia avec le contenu suivant"
echo "(extrait de sprint-1, SANS les suppressions d'icônes) :"
echo ""
echo "  shamefully-hoist=true"
echo "  strict-peer-dependencies=false"
echo "  auto-install-peers=true"
echo "  node-linker=hoisted"
echo ""
echo "Puis committer :"
echo "  git add .npmrc && git commit -m \"chore: add .npmrc for pnpm hoisting config\""
