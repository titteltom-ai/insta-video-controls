# Instagram Video Controls

Eine kleine Chrome-Extension, mit der man auf instagram.com Videos per Tastatur
schneller/langsamer machen und vor-/zurückspulen kann.

## Tastenkürzel

| Taste        | Aktion                                          |
|--------------|--------------------------------------------------|
| D            | Schneller (+0,25x)                                |
| S             | Langsamer (-0,25x)                                |
| R             | Geschwindigkeit zurücksetzen (1x)                 |
| G            | Vorspulen (Standard: 2s)                           |
| J            | Zurückspulen (Standard: 2s)                        |
| Z            | Sprunggröße erhöhen (+1s)                          |
| H             | Sprunggröße verringern (-0,20s)                    |
| Leertaste (Space) | Pause / Weiter                                 |

Beim Tippen in Kommentar-/Suchfelder sind die Tasten automatisch deaktiviert,
damit z. B. "s" oder "d" normal geschrieben werden können.

## Schieberegler-Leiste

Unten mittig auf dem Bildschirm erscheint zusätzlich eine schmale
Fortschrittsleiste (angelehnt an TikTok), sobald ein Video läuft. Damit lässt
sich frei vor- und zurückspulen:

- **Klicken** an eine Stelle der Leiste springt direkt dorthin.
- **Ziehen** (mit gedrückter Maustaste) spult frei vor und zurück, dabei
  erscheint kurz die aktuelle Zeit über der Leiste.
- Die Leiste hat bewusst eine großzügige, unsichtbare Grabfläche um die
  dünne Linie herum, damit man beim Klicken/Ziehen nicht exakt treffen muss.

## Installation in Chrome (auf dem Mac)

1. Diesen Ordner (`insta-video-controls`) irgendwo entpacken/speichern, z. B.
   im Ordner "Programme" oder "Dokumente" – nicht wieder löschen, Chrome lädt
   die Extension von dort aus.
2. Chrome öffnen und in die Adresszeile eingeben: `chrome://extensions`
3. Oben rechts den Schalter **"Entwicklermodus"** aktivieren.
4. Auf **"Entpackte Erweiterung laden"** klicken.
5. Den Ordner `insta-video-controls` auswählen.
6. Fertig! Die Extension erscheint jetzt in der Liste. Instagram-Seite neu
   laden (oder einfach neu öffnen), dann funktionieren die Tastenkürzel.

## Hinweis

Da die Extension nicht aus dem Chrome Web Store installiert wird, zeigt Chrome
sie eventuell als "nicht verifiziert" an – das ist normal bei selbst geladenen
Extensions und kein Problem.
