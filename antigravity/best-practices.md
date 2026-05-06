# Checklist de Buenas Prácticas para Next.js (Bienes Raíces)

Un resumen rápido, condensado y directo de las reglas y prácticas esenciales a seguir para el desarrollo de la plataforma.

## 🏗 Arquitectura
* **[ ] App Router:** Usar siempre el directorio `app/`.
* **[ ] Server Components por defecto:** Dejar `"use client"` estrictamente para interactividad (botones, modales, mapas).
* **[ ] ISR (Incremental Static Regeneration):** Usar `revalidate` en peticiones para que la web cargue instantáneamente y la base de datos no se sobrecargue.

## 🖼 Media e Imágenes
* **[ ] `next/image` siempre:** Prohibido usar `<img>`. Usar `<Image />` para optimización automática.
* **[ ] Priorizar la imagen Hero:** Añadir `priority={true}` a la imagen principal de la propiedad para mejorar el LCP.
* **[ ] Tamaños Responsive:** Usar la propiedad `sizes` en las imágenes para ahorrar ancho de banda en móviles.
* **[ ] Lazy Loading en interactividad:** Diferir la carga de Mapas y Tours 3D hasta que el usuario llegue a esa sección.

## 🔍 SEO (Search Engine Optimization)
* **[ ] Títulos Dinámicos:** Usar `generateMetadata()` en cada propiedad (ej. "Casa de lujo en Miami | $1,200,000").
* **[ ] Slugs y Rutas Descriptivas:** Construir URLs semánticas y amigables (ej. `/propiedades/casa-de-lujo-en-miami-123`) en lugar de usar solamente IDs opacos (`/propiedades/123`).
* **[ ] Datos Estructurados (JSON-LD):** Insertar Schema Markup (`SingleFamilyResidence`, `RealEstateAgent`) para destacar en Google.
* **[ ] Etiquetas Open Graph:** Configurar previsualizaciones OG para que los enlaces luzcan premium al enviarse por WhatsApp o Redes Sociales.

## 💾 Estado, Datos y Búsqueda
* **[ ] Filtros en la URL:** Guardar los estados de búsqueda (precio, ubicación, tipo) en los *Search Params* (`?precioMax=800000`), NUNCA en un `useState`.
* **[ ] Paginación Server-Side:** Traer propiedades por lotes (`limit`/`offset` en Supabase) en lugar de traerlas todas de golpe.
* **[ ] Caché de peticiones:** Aprovechar la caché de Next.js (`fetch`) para acelerar la navegación de regreso a las listas.

## ✨ UI/UX y Diseño (Premium Vibe)
* **[ ] Loading Skeletons:** Usar `loading.tsx` y `<Suspense>` para mostrar "esqueletos" en lugar de pantallas blancas o spinners aburridos.
* **[ ] Whitespace y Tipografía:** Usar márgenes amplios y fuentes modernas/limpias para transmitir "lujo" y confianza.
* **[ ] Micro-interacciones:** Animaciones muy sutiles (`hover:scale`, sombras suaves) en las tarjetas de propiedades usando Tailwind CSS o Framer Motion.
* **[ ] Swipe Móvil:** Asegurar que las galerías de fotos permitan arrastrar con el dedo (swipe) de forma nativa.

## 💡 Funcionalidades Clave / Recomendaciones
* **[ ] Calculadora Hipotecaria:** Integrada directamente en el detalle de la propiedad.
* **[ ] Búsqueda por Mapa:** Mapa interactivo que actualice automáticamente el listado al arrastrar o hacer zoom.
* **[ ] Contacto Inmediato:** Botón flotante o tarjeta "sticky" persistente de WhatsApp/Email para no perder el Lead.
* **[ ] Comparador de Propiedades:** Permitir al usuario alinear 2 o 3 opciones para comparar habitaciones, área y precio lado a lado.
* **[ ] Favoritos:** Sistema dual (Guardar en `localStorage` si no están logueados, y en Supabase al iniciar sesión).
