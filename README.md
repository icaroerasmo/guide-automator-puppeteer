# Guide Automator Puppeteer

## Dependências

- [Node.js](https://nodejs.org/en/) v12.15.0
- [WkHtmlToPdf](https://wkhtmltopdf.org/)
- [FFMPEG](https://ffmpeg.org/)
- [Espeak](http://espeak.sourceforge.net/)

## Instalação

O **Espeak**, **FFMPEG** podem ser instalados facilmente em ambientes Debian-like (Distribuições que utilizem o apt como gerenciador de pacotes como o próprio Debian, o Ubuntu, Mint e etc) executando o comando:

```console
foo@bar:~$ sudo apt install espeak ffmpeg
```

Para instalação do **FFMPEG** em outros Sistemas operacionais ou do **Espeak** compilando o código fonte, por favor consultar as documentações das respectivas ferramentas.

O **WkHtmlToPdf** possui versões para os mais diversos sistemas operacionais e é possível realizar o download do binário correspondente ao seu Sistema operacional nesse [link](https://wkhtmltopdf.org/downloads.html). 

**NÃO instale em hipótese alguma o WkHtmlToPdf dos repositórios oficiais da sua distribuição Linux. O binário disponibilizado nos repositórios são compilados sem algumas dependências e a utilização deste resulta em FALHA na execução do Guide Automator Puppeteer.**

Já o node é recomendável que se installe através do [NVM](https://github.com/nvm-sh/nvm) a versão v12.15.0:

```console
foo@bar:~$ nvm install v12.15.0
```

## Executando

#### Manualmente

Se tiver instalado as dependências manualmente você deverá executar o comando:
```console
foo@bar:~$ main.js -d -i examples/Example-1/example.md -cv examples/Example-1/cover.html
```
Observe que os caminhos dos arquivos nos exemplos acima são relativos à pasta corrente. Para executar a partir de outra pasta que não seja a do guide automator você deve anexar o caminho desta como prefixo tanto ao comando quanto aos parâmetros que definem os caminhos dos arquivos que são passados como entrada.

#### Através do Docker

Você também pode executar o Guide Automator Puppeteer via Docker.

Construindo a imagem:

```console
foo@bar:~$ sudo docker build -t guide-automator-puppeteer .
```

Executando o exemplo:

```console
foo@bar:~$ sudo docker run --rm \
  -v $(pwd)/output:/usr/src/output \
  guide-automator-puppeteer \
  -d -i examples/Example-1/example.md -cv examples/Example-1/cover.html -o /usr/src/output
```

A última linha corresponde aos parâmetros passados para o Guide Automator Puppeteer.

Observe o parâmetro -o que define a pasta de saída dos arquivos: este deve ser igual ao parâmetro -v que é inserido na execução do docker na segunda linha. Caso não sejam, não será possível visualizar os arquivos na pasta "output" dentro da pasta do guide-automator-puppeteer.