# Menu principal do G1 até o G1 Bahia

## Introdução

  Este documento demonstra a navegação da página inicial do G1 [https://g1.com.br](https://g1.com.br) até o G1 Bahia com o objetivo de demonstrar o funcionamento da ferramenta Guide Automator.

## G1 screenshots

```
viewport 1365 982
go-to-page https://g1.globo.com/
screenshot "Página principal"
click "div.header-principal:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1)" #menu-container
screenshot "Menu principal"
click "#menu-1-regioes a" #menu-container
screenshot "Menu regiões"
click "#menu-2-nordeste a" #menu-container
screenshot "Menu Nordeste"
click "#menu-3-bahia" #menu-container
screenshot "Menu Bahia"
click '#menu-3-bahia > .menu-level > #menu-4-primeira-pagina > .menu-item-link > .menu-item-title'
screenshot "G1 Bahia"
screenshot '#feed-placeholder > div > div > div._l > div:nth-child(1) > div > div > div:nth-child(5) > div' 'Image 1'
```