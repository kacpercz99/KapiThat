## Aplikacja webowa o architekturze klient-serwer z funkcją szyfrowania wiadomości głosowych
#### Autor: Kacper Czura
#### Projekt realizowany w ramach pracy licencjackiej na Katolickim Uniwersytecie Lubelskim

### O aplikacji



### Uruchamianie aplikacji

#### Wymagania
- [Python](https://www.python.org/downloads/)
- Biblioteki z pliku `requirements.txt` - można je zainstalować za pomocą polecenia `pip install -r requirements.txt`
- Para certyfikatu i klucza w formacie PEM w katalogu `application/certs` (patrz poniżej)

| :warning: Przed uruchomieniem                                                                                                                                                                                                                |
|:---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Musisz dostarczyć ważną parę certyfikatu i klucza poprzez pliki `cert.pem` i `key.pem` w katalogu `application/certs`. <br/>Bez ważnego certyfikatu i pary kluczy serwer nie może zapewnić bezpiecznego połączenia i nie można go uruchomić. |

| :info: W przypadku braku certyfikatu i klucza                                                                                                                                                    |
|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Możesz zmienić konfigurację na serwer http, ale niektóre funkcje takie jak nagrywanie głosu mogą nie działać poprawnie, a bezpieczeństwo danych przechodzących przez serwer może być zagrożone.  |

#### Uruchomienie serwera
Natywnie wspierany tylko system Linux.<br/>
Uczynić plik `run.sh` wykonywalnym za pomocą polecenia `chmod +x run.sh` i uruchomić go za pomocą polecenia `./run.sh`.