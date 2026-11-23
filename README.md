[README.md](https://github.com/user-attachments/files/35246018/README.md)
# ARCADIA

> *Utopía...*

**Arcadia** es una tienda web satírica y funcional construida sobre **Solana**. Es un mercado negro de un mundo distópico donde se venden objetos de una época anterior: algunos simples e inocentes (una Game Boy, robopartes, prótesis antiguas) y otros directamente ilegales.

La página tiene la apariencia de una web de la internet antigua, escondida de la internet actual: simple, tosca, con estética ciberpunk en negro, verde y toques rosas chillones, y un logo en arte ASCII de montañas.

**Demo:** https://arcadiastore.vercel.app

---

## ¿Como Usar?
Primero ve al link adjunto en la parte de arriba.
Creas un perfil con tu wallet y un apodo, puedes comprar productos o vender los tuyos propios desde el boton 'mis productos'.
(Atención error con crear productos relacionados a arma y otros más (debido a un error de sintaxis), por el momento solo puedes seleccionar otros y retro)

## ¿De qué trata?

Arcadia funciona de verdad (cuentas, productos, compras y tickets viven en la blockchain), pero todo está envuelto en una sátira: una federación vigila el comercio, hay productos que no deberían existir y comprarlos tiene consecuencias.

- **Cuentas con wallet:** entras con tu wallet de Solana (Phantom). No hay contraseñas.
- **Tienda:** explora los productos disponibles y agrégalos al carrito.
- **Tickets de compra:** al comprar se genera un ticket. En los productos ilegales, el ticket te indica que debes ajustar el encuentro en un **terreno baldío o una zona lejana**.
- **Mis productos:** puedes publicar y administrar tus propios productos.
- **Perfil:** avatar en ASCII a elegir, nombre, wallet y opción de cambiar de wallet.
- **Memorial:** los usuarios eliminados por "la federación" tras vender contenido ilegal quedan registrados como "fallecidos". Se accede desde la ventana de *Acerca de*.

---

## Tecnologías

| Parte | Tecnología |
|---|---|
| Programa (backend) | Rust + [Anchor](https://www.anchor-lang.com/) en Solana |
| Entorno del backend | [Solana Playground](https://beta.solpg.io/) |
| Frontend | React + Vite + TypeScript |
| Cliente del programa | `@coral-xyz/anchor` 0.29.0 |
| Wallet | Phantom |
| Red | Solana devnet |
| Despliegue del frontend | Vercel |

---

## Arquitectura

El proyecto está dividido en dos partes y sigue principios **SOLID** para poder modificarlo con facilidad con el tiempo.

### Backend (programa de Anchor)

CRUD completo sobre la blockchain:

- Usuarios (crear cuenta, cambiar de wallet)
- Productos (crear, leer, actualizar, eliminar)
- Compras
- Generación de tickets

Los **12 tests** del backend cubren CRUD, compra, ticket y cambio de wallet.

### Frontend (`arcadia_frontend`)

Clases separadas, cada una con una sola responsabilidad:

- **Wallet:** conexión y verificación de la wallet
- **Productos:** lectura y gestión de productos
- **Tickets:** generación y presentación del ticket de compra

---



## Flujo de uso

```
Conectar wallet → Crear cuenta / Login → Tienda → Carrito → Compra → Ticket
                                            ↓
                                  Perfil · Mis productos · Acerca de → Memorial
```

---

## Pantallas

- Login
- Crear cuenta
- Tienda
- Carrito y ticket
- Perfil
- Mis productos
- Añadir producto
- Ventana explicativa satírica
- Acerca de (con el memorial)
- Pantalla "en desarrollo"

---

## Estado del proyecto

En desarrollo irregular. La página se actualiza con el tiempo.

---

## Actualizaciones 
0.1.0 - Utopia
-Parece que hay infiltrados de la federación (El admin puede eliminar usuarios mediante transacciones)
<img width="1868" height="952" alt="image" src="https://github.com/user-attachments/assets/d327af0f-d898-45bf-a614-68dfe1226424" />
-Perfiles ya disponible, cuidado con lo que vendes.
<img width="1868" height="994" alt="image" src="https://github.com/user-attachments/assets/1c522270-6049-4db5-8a87-f7eccaed57d4" />

-¿Primer edgerunner muerto? Añadido acerca de con un novedades y un memorial a los caidos
<img width="686" height="188" alt="image" src="https://github.com/user-attachments/assets/70026b6e-e446-4111-ae60-0088e73f9017" />

-Proximamente un sistema de reputación y más expansión de historia (quizá nunca)



## Aviso

Arcadia es una **obra de sátira y ficción**. Los productos, la federación y el futuro memorial en próximas actualizaciones pertenecen a un mundo distópico inventado. El proyecto corre en devnet con SOL de prueba, no tiene valor real.
arcadia_frontend es una version previa a la web, es una version de pruebas que solo funciona en la terminal.
---

## Créditos

- Arte ASCII de las montañas del logo: [asciiart.eu](https://www.asciiart.eu/), con créditos a su creador original.
- Logo inspirado en el estilo de Sierra.
