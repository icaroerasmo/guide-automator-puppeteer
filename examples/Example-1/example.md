# Menu principal do G1 até o G1 Bahia

## Introdução

  Este documento demonstra a navegação da página inicial do G1 [https://g1.com.br](https://g1.com.br) até o G1 Bahia com o objetivo de demonstrar o funcionamento da ferramenta Guide Automator.

## G1 screenshots

```
viewport 1365 982
go-to-page https://g1.globo.com/
click '.cookie-banner-lgpd_button-box'
screenshot "Página principal"
click "div.header-principal:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)" #menu-container
screenshot "Menu principal"
click "#menu-1-regioes a" #menu-container
screenshot "Menu regiões"
screenshot '.medium-centered' 'Image 1'
```