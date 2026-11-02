## Qué es

Aplicación para que usuarios de instagram puedan previsualizar, añadir, eliminar o reordenar fotos en su feed antes de publicarlas.

## Stack

- **Frontend:** Angular 22, TypeScript y HTML, Node 24.
- **Estilos:** CSS.
- **Almacenamiento local:** IndexedDB para guardar las imágenes en el navegador.
- **Tipo de aplicación:** PWA, sin SSR ni SSG.
- **Hosting:** GitHub Pages. La app se sirve desde /prevlio/, no desde la raíz del dominio.
- **CI y despliegue:** GitHub Actions.
- **Backend:** No se necesita para el MVP.

## Cómo se comprueba

- npm ci
- npm test -- --watch=false
- npm run build

Si alguna comprobación falla, investigar el motivo y explicar el resultado. No dar la tarea por terminada si hay errores sin resolver.

## Reglas

Responde en español; escribe el código, las variables, las funciones y las clases en inglés.

Antes de modificar código, analiza los archivos afectados, propon los cambios y espera mi aprobación.

No instales dependencias sin permiso y sin explicar para qué sirven.

Explica los cambios, ejecuta las comprobaciones e indica los errores pendientes.

No hagas commits ni pushes; los hago yo.

Si una petición contradice DECISIONES.md, explica el conflicto y pregunta antes de actuar.

No modificar tests que ya existen sin pedirlo.