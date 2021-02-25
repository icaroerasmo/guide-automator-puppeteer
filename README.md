# Guide Automator Puppeteer

## Dependências

- [Node.js](https://nodejs.org/en/) v12.15.0
- [WkHtmlToPdf](https://wkhtmltopdf.org/)
- [FFMPEG](https://ffmpeg.org/)
- [Festival](https://www.cstr.ed.ac.uk/projects/festival/)

### Instalação

O **Festival** e **FFMPEG** podem ser instalados facilmente em ambientes Debian-like (Distribuições que utilizem o apt como gerenciador de pacotes como o próprio Debian, o Ubuntu, Mint e etc) executando o comando:

```console
foo@bar:~$ sudo apt install festival ffmpeg
```

Há também uma forma de se instalar o **Festival** em MacOS ou Linux compilando o código fonte como descrito nessa [thread](https://apple.stackexchange.com/questions/128635/installing-the-festival-speech-synthesis-system-with-mavericks) do Apple StackExchange.

Para instalação do **FFMPEG** em outros Sistemas operacionais ou do **Festival** compilando o código fonte, por favor consultar as documentações das respectivas ferramentas.

Já o node é recomendável que se installe através do [NVM](https://github.com/nvm-sh/nvm) a versão v12.15.0:

```console
foo@bar:~$ nvm install v12.15.0
```

O **WkHtmlToPdf** possui versões para os mais diversos sistemas operacionais e é possível realizar o download do binário correspondente ao seu Sistema operacional nesse [link](https://wkhtmltopdf.org/downloads.html).

## Executando

Se preferir reduzir a complexidade da montagem do ambiente em ambientes Linux basta somente ter o **Git** e o **Festival** instalados e executar o script guide-automator.sh passando os parâmetros de execução necessários. Como a seguir:

```console
foo@bar:~$ ./guide-automator.sh -d -i examples/Example-1/example.md -cv examples/Example-1/cover.html
```

Se tiver instalado as dependências manualmente você deverá executar o comando:
```console
foo@bar:~$ main.js -d -i examples/Example-1/example.md -cv examples/Example-1/cover.html
```
Observe que os caminhos dos arquivos nos exemplos acima são relativos à pasta corrente. Para executar a partir de outra pasta que não seja a do guide automator você deve anexar o caminho desta como prefixo tanto ao comando quanto aos parâmetros que definem os caminhos dos arquivos que são passados como entrada.

## Docker

Você também pode executar o Guide Automator Puppeteer via Docker.

Construindo a imagem:

```console
foo@bar:~$ sudo docker build -t guide-automator-puppeteer .
```

Executando o exemplo:

```console
foo@bar:~$ docker run --rm -it \
  guide-automator-puppeteer \
  -d -i examples/Example-1/example.md -cv examples/Example-1/cover.html
```

A última linha corresponde aos parâmetros passados para o Guide Automator Puppeteer.
