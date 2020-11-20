---
title: New Panels
date: 2020-11-20 08:20
min_role: Reader
---
## Wie werden neue Panels erstellt

Um ein neues Panel zu erstellen werden 3 Dinge benötigt (Ausname: Auswertungen)

1. Eine neue Controller-Klasse im DashboardBundle (`src/DashboardBundle/Controller/PanelController`). Diese Klasse muss das Interface `PanelInterface` implementieren und es sollte den `BasePanelController` extenden.  