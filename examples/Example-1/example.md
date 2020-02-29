# Navegação do Menu principal do G1 até o G1 Bahia

## Introdução

  Este documento demonstra a navegação da página inicial do G1 [https://g1.com](https://g1.com) até o G1 Bahia com o objetivo de demonstrar o funcionamento da ferramenta Guide Automator.

## G1 screenshots

```
go-to-page https://g1.globo.com/
screenshot null Página principal
click div.header-principal:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)
wait 500
screenshot null Menu principal
wait 500
click #menu-1-regioes a
wait 500
screenshot null Menu regiões
click #menu-2-nordeste a
wait 500
screenshot null Menu Nordeste
click #menu-3-bahia a
wait 500
screenshot null Menu Bahia
click .first-layer > li:nth-child(3) > a:nth-child(1)
wait 500
screenshot null G1 Bahia
```

