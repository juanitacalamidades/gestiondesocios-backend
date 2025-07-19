# 🎭 Backend - Rabotnik

**Rabotnik** es una herramienta digital para la gestión de socios de la Asociación de Artes de Calle del País Vasco. Este backend permite manejar la base de datos de socios, gestionar autenticación de usuarios y automatizar procesos como la expiración anual del pago de cuotas.

---

## 🚀 Tecnologías usadas

* **Node.js** + **Express**
* **MongoDB** con **Mongoose**
* **JWT** para autenticación
* **bcrypt** para encriptación de contraseñas
* **dotenv** para variables de entorno
* **cors** para manejo de políticas de acceso
* **Render Cron Jobs** para tareas automatizadas

---

## 🧹 Estructura principal

* `index.js`: punto de entrada de la API, configuración de middlewares y rutas.
* `connect.js`: archivo donde se definen las funciones CRUD de base de datos.
* `models/`: contiene los esquemas de Mongoose para `Socio` y `Usuario`.
* `middlewares/`: incluye el middleware `auth` (protección de rutas) y los manejadores de errores (`404` y general).
* `updateMembership.js`: script que se ejecuta de forma periódica (cron job) para comprobar si ha pasado un año desde el último pago de cuota y actualizar el estado.

---

## 🧾 Modelo de datos: Socio

El modelo `Socio` incluye:

* Datos fiscales y de contacto.
* Tipo de socio: `Compañía`, `Festival`, `Distribuidora`, `Otro`.
* Estado de cuota pagada (booleano) y fecha de pago (`cuota.pagada`, `cuota.fechaDePago`).
* Estado de participación en asambleas anuales.
* Documentación recibida (`video/foto`, `catálogo`, etc.).
* Status general: `activo`, `ex-socio`, `interesado`.

---

## 🔄 Automatización de cuotas

El archivo `updateMembership.js` se ejecuta periódicamente mediante un **cron job en Render**. Este script:

* Busca los socios cuya cuota está marcada como pagada.
* Comprueba si ha pasado más de un año desde `cuota.fechaDePago`.
* Si ha expirado, actualiza `cuota.pagada` a `false`.

---


## 🧱 Estructura de errores

* Middleware para manejar errores generales.
* Middleware `404` para rutas inexistentes.
* Todos los errores se devuelven con código y mensaje adecuado.

---

## 📦 Despliegue

Este backend está desplegado en **Render** como servicio web y cron job.

---

## ✍️ Autoría

Desarrollado por yoanna rodionova.

---

