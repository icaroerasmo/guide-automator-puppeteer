# Github - Getting Started

## Create a new account

  First of all, you need access [https://github.com](https://github.com).

```
go-to-page https://www.google.com
fill-field [name=q] Hello World
submit-form #tsf
screenshot null Google page printscreen
```

## Github screenshot

```
go-to-page https://github.com/login
fill-field #login_field icaroerasmo
fill-field #password <senha aqui>
click .btn
click div.mt-5 > div:nth-child(1) > ul:nth-child(3) > li:nth-child(3) > div:nth-child(1) > a:nth-child(1)
screenshot null Github
```