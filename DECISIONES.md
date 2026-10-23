## Fecha: 20/10/2026 13:12

## 1. Hosting

Decisión: GitHub Pages, publicando mediante Actions.

Opciones: GitHub Pages, Netlify, Firebase. descarto Netlify porque con GitHub tengo repo, CI y despliegue en un mismo sitio, sin más cuentas.

Por qué: Repaso lo que ya conozco y mantengo el proyecto en un mismo sitio. Descarto Firebase Hosting porque añade otra plataforma y configuración que no necesito para una aplicación estática.

Riesgo pendiente: La app vive en usuario.github.io/prevlio/ y hay que decirle a Angular esa ruta base. Tengo que resolver el posible 404 que salga. No tendré URLs automáticas así que comprobaré los cambios en local y en el móvil.

## 2. Estilos CSS

Decisión: CSS.

Opciones: CSS, Sass/SCSS y Tailwind CSS. Descarto SCSS y Tailwind por ahora.

Por qué: Conozco CSS y puedo centrarme en aprender Angular y Java sin añadir otra tecnología esta semana. Además, Hilo también utiliza CSS. En las 19 ofertas que he revisado, CSS aparece 6 veces, mientras que SCSS y Tailwind no aparecen.

Riesgo o pendiente: Tendré que organizar los estilos y evitar repetir valores, utilizando variables CSS para colores, espacios y otros valores compartidos. Dejaré Tailwind para una aplicación posterior, cuando tenga más soltura con Angular.

## 3. Renderizado: sin SSR ni SSG

Decisión: Renderizado en el navegador, sin SSR ni SSG.

Opciones: Renderizado en el cliente, SSR (renderizado en servidor) y SSG (prerenderizado). Descarto SSR porque GitHub Pages sirve archivos estáticos y no ejecuta un servidor para renderizar Angular. También descarto SSG porque no aporta una ventaja relevante a esta aplicación.

Por qué: Prevlio es una herramienta para organizar el feed de instagram, no una web de contenido público que necesite posicionarse en Google. Las fotos se guardan en IndexedDB en el navegador del usuario y se incorporan dinámicamente.

Riesgo o pendiente: Prevlio necesita JavaScript para montar la interfaz y funcionar; sin él, no se podrán añadir, reordenar ni guardar fotos, se acepta porque es una herramienta interactiva que depende de JavaScript para funcionar y, al ser una PWA, puede cargarse desde la caché del móvil después de la primera visita.

## 4. Integración de IA en Angular

Decisión: None en la integración de IA del asistente de configuración de Angular.

Opciones: None, Claude Code, Codex, Gemini, Cursor, VS Code. Descarto todas de momento.

Por qué: Quiero crear mi propio CLAUDE.md y entender las reglas que utiliza Claude en el proyecto. Prefiero incorporar herramientas adicionales cuando exista un problema concreto que justifique utilizarlas.

Riesgo o pendiente: Tendré que redactar y revisar el CLAUDE.md con ayuda, incluyendo el objetivo del proyecto, el stack, las comprobaciones y las reglas de trabajo. Sin la integración automática, no tendré configurado desde el principio el MCP de Angular para consultar su documentación y herramientas.

## Navegación

Decisión: Dejar fuera de la v1 la barra inferior («Inicio», «Cuadrícula», «Más») y el icono de Ajustes.

Por qué: Prevlio tendrá una sola pantalla. Añadiré navegación cuando existan nuevas pantallas que la necesiten.

## Avisos

Decisión: Mostrar los avisos debajo del encabezado, apilados si aparecen a la vez. Se van cuando la persona los cierra, con un botón × de al menos 44 px. 

Por qué: Los avisos estarán siempre en el mismo sitio. El verde indicará las fotos añadidas correctamente y el rojo, los archivos rechazados, con mensajes que expliquen qué ha ocurrido.

Decisión: Si hay avisos abiertos y se añaden fotos, los nuevos sustituyen a los anteriores.

Por qué:  Si no se cierran los avisos que ya están y alguien sigue subiendo fotos, que salgan más es molesto.

## Botón «Añadir fotos»

Decisión: Cuando no haya fotos, mostrar el botón en el centro de la pantalla. Cuando ya haya fotos, poner un botón + arriba a la derecha.

Por qué: Destaca la acción principal en la pantalla vacía y permite añadir más fotos después sin quitar espacio al feed.

## Diseño

Decisión: Variante A, en blanco y negro y fiel al boceto.

Por qué: Es la que sigue mi guía minimalista.