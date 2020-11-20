---
title: Authentication
date: 2020-11-18 15:25
---
Die Inzuro API verwendet eine simple Public + Secret Key Authentifizierungmethode.

**WICHTIG**: Sollten Sie Ihren Private Key verlieren müssen Sie einen neuen generieren lassen, da Inzuro den Privaten Schlüssel nicht in Rohform abspeichert.

Das Schlüssel-paar kann in Ihren Nutzereinstellungen in der Sektion API neu generiert werden (<a href="https://inzuro-one.ch/podium/user/settings/view#api">Einstellungen</a>)

Um sich authentifizieren zu können müssen das Schlüssel-paar im header mitgegeben werden. Dies sollte wie folgt aussehen:

```
php-auth-username: [PublicKey]
php-auth-password: [PrivateKey]
```

Werden mehrere Requests nacheinander getätigt ist dies nur mit dem ersten eine Anforderung. Die Antwort enthält ein Cookie `PHPSESSID`. Geben Sie dieses mit jedem Request als Cookie mit ist der Header nicht benötigt.