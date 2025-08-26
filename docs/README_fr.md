# Simulateur de Machine de Turing

[Version anglaise ici !](../README.md)

![Capture d'écran](../docs/screenshot/1.png)

**Démo en ligne :** [https://maxdkn.github.io/turing-machine](https://maxdkn.github.io/turing-machine)

Un simulateur interactif et pédagogique de machine de Turing, conçu pour [machinedeturing.com](https://machinedeturing.com).

Vous pouvez créer des états, définir des transitions, exécuter la machine, modifier pendant l’exécution, et exporter votre configuration en JSON ou sous forme de graphe visuel.

---

## Fonctionnalités

* Ajouter et modifier des états pendant l’exécution.
* Définir des règles : lire, écrire, mouvement, état suivant.
* Visualisation interactive du ruban (affichage circulaire).
* Exécution pas à pas avec mise en évidence de la règle active.
* Pause et reprise de l’exécution.
* Export et import en JSON.
* Interface glisser-déposer pour les transitions.
* Outil pédagogique et interactif pour apprendre les concepts de la machine de Turing.

---

## Utilisation

1. Clonez ou téléchargez ce dépôt :

   ```bash
   git clone https://github.com/MaxDkn/turing-machine.git
   ```

2. Ouvrez `index.html` dans votre navigateur (ou utilisez GitHub Pages).

3. Ajoutez des états et des règles, puis lancez la simulation avec le bouton vert.

4. Mettez en pause, reprenez ou arrêtez selon vos besoins.

5. Exportez la configuration pour la partager ou la sauvegarder.

---

## 📦 Export

Vous pouvez exporter votre programme sous deux formats :

* **JSON** : Configuration complète des états et du ruban.
* **Image (SVG)** : Représentation visuelle du graphe du programme (pas encore prêt).

👉 Vous pouvez également trouver des **exemples de programmes JSON prêts à l’emploi** dans [`docs/exemple/`](exemple/).

---

## 📝 À faire

Améliorations prévues et prochaines étapes du projet :

* [ ] **Exporter en schéma/graphique complet**
  Générer un diagramme visuel complet de la machine de Turing (au-delà du JSON ou du ruban).

* [ ] **Ruban modifiable**
  Ajouter une interface permettant de modifier directement le contenu du ruban avant ou pendant l’exécution plus facilement (acutellement, fait manuellement ou à partir d'un programme).
  *(Actuellement non prévu mais pourra être reconsidéré.)*

* [ ] **Révision de l’interface utilisateur (UI)**
  Améliorer les couleurs, la disposition, les boutons (styles primaire/secondaire), et la cohérence globale du design.

* [ ] **Design responsive**
  Adapter l’application pour un usage fluide sur différentes tailles d’écran (ordinateur, tablette, mobile).

* [ ] **Import direct d’exemples**
  Permettre de charger facilement des fichiers JSON d’exemple dans l’application (depuis `docs/exemple/`).

---

## Licence

Ce projet est sous licence **GNU General Public License v3 (GPLv3)**.
Voir [LICENSE](../LICENSE) pour plus de détails.
