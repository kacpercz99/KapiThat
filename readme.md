## Aplikacja webowa o architekturze klient-serwer z funkcją szyfrowania wiadomości głosowych
#### Autor: Kacper Czura
#### Projekt realizowany w ramach pracy licencjackiej na Katolickim Uniwersytecie Lubelskim

### O aplikacji



### Uruchamianie aplikacji

#### Wymagania
- [Python](https://www.python.org/downloads/)
- Biblioteki z pliku `requirements.txt` - można je zainstalować za pomocą polecenia <br/>`pip install -r requirements.txt`

> [!IMPORTANT]
> Jeżeli nie chcesz mieć problemów z niezaufanym certyfikatem, to
> przed uruchomieniem musisz dostarczyć ważną parę certyfikatu i klucza poprzez
> pliki `cert.pem` i `key.pem` w katalogu `application/certs`. 
> <br/>Bez ważnego pary certyfikatu i klucza serwer 
> wygeneruje własny certyfikat, ale nie będzie on zaufany przez przeglądarkę.

#### Uruchomienie serwera
Natywnie wspierany tylko Linux.<br/>
Uczynić plik `run.sh` wykonywalnym za pomocą polecenia `chmod +x run.sh` i uruchomić go za pomocą polecenia `./run.sh`.