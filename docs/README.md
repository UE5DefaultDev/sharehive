# ShareHive Dokumentation

## Idee
Eine Website, in welcher Nutzer Kurse erstellen, sowie anderen Kursen beitreten können, um sich gegenseitig Dinge beizubringen. -> Lerngruppen online bündeln.

## Kriterien
- Nutzer müssen sich anmelden können
- Nutzer müssen Kurse posten können
- Nutzer müssen Kursen folgen können
- Jeder Kurs braucht einen eigenen Chat
- Jeder Chat muss verschlüsselt übermittelt werden
- Die Website braucht eine Homepage
- Der Nutzer kann neue Kurse finden und suchen
- Der Nutzer kann sein Profil bearbeiten
- Man kann Kursen beim Erstellen Bilder hinzufügen

## Warum welche Produkte
- **Clerk**:
    - Einfache, sichere Authentifizierung
    - Verschiedene Login-Möglichkeiten
- **Next.js**:
    - Server-Side-Rendering (Seite wird auf Server gerendert) -> Performance
    - Static-Site-Rendering (Seiten werden beim Build vorgerendert) -> Performance
    - Ordner-basiertes Routing
    - Backend / Frontend Logik an einem Ort
- **Shadcn/ui / Tailwind CSS**:
    - Dynamische UI Bibliothek: nur benötigte Teile werden dem Projekt hinzugefügt
    - Kohärent im Style
- **PostgreSQL**:
    - Relationale Datenbank
    - Kann mit JSON umgehen
    - Kompatibel mit Neon und Prisma
- **Neon DB**:
    - Serverless
        - Kein Server-Setup
        - Kein manuelles Scaling
    - Branches für Datenbank (alte Versionen bleiben gespeichert -> Rückgängig machbar)
    - Kompatibel mit PostgreSQL
- **Prisma**:
    - Type-Safety mit TypeScript
    - Sehr sauberes Schema-System
    - Einfache Migrationen
    - Gut lesbarer Query-Style (Im Vergleich zu SQL!)
