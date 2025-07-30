# GitHub Explorer

Una aplicación moderna de Angular para explorar repositorios y desarrolladores de GitHub con una interfaz elegante y funcional.

## 🚀 Características

- **Búsqueda de Repositorios**: Explora millones de repositorios con filtros avanzados
- **Perfiles de Desarrolladores**: Visualiza información detallada de usuarios de GitHub
- **Análisis Visual**: Gráficos interactivos con Chart.js para estadísticas de repositorios
- **Gestión de Favoritos**: Guarda y organiza tus repositorios y usuarios favoritos
- **Interfaz Moderna**: Diseño responsivo con Tailwind CSS y modo oscuro
- **Búsqueda Avanzada**: Filtros por lenguaje, estrellas, forks y fecha de actualización

## 🛠️ Tecnologías

- **Angular 20** - Framework principal
- **TypeScript 5.8** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **Chart.js** - Visualización de datos
- **RxJS** - Programación reactiva
- **GitHub API** - Fuente de datos

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── header/          # Navegación principal
│   ├── loading-skeleton/ # Estados de carga
│   ├── repository-card/ # Tarjetas de repositorios
│   └── user-card/       # Tarjetas de usuarios
├── pages/               # Páginas principales
│   ├── dashboard/       # Búsqueda de repositorios
│   ├── explore/         # Exploración de usuarios
│   ├── favorites/       # Gestión de favoritos
│   └── repository-detail/ # Detalles del repositorio
├── services/            # Servicios de datos
│   ├── github.service.ts # API de GitHub
│   └── favorites.service.ts # Gestión de favoritos
└── types/               # Definiciones de tipos
    └── github.types.ts  # Interfaces de GitHub
```

## 🚦 Instalación y Uso

### Prerrequisitos

- Node.js (versión 18 o superior)
- npm o yarn

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd project
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura la API de GitHub (Opcional)**
   
   Para aumentar el límite de requests, crea un token personal de GitHub:
   
   1. Ve a GitHub → Settings → Developer settings → Personal access tokens
   2. Genera un nuevo token con permisos de lectura pública
   3. Agrega el token en `src/services/github.service.ts`

### Ejecución

```bash
# Servidor de desarrollo
npm start

# Compilación para producción
npm run build
```

La aplicación estará disponible en `http://localhost:4200`

## 🎯 Funcionalidades Principales

### Dashboard - Búsqueda de Repositorios
- Búsqueda por nombre, descripción o tópicos
- Filtros por lenguaje de programación
- Ordenamiento por estrellas, forks, fecha de actualización
- Paginación de resultados
- Filtros rápidos predefinidos

### Explore - Perfiles de Desarrolladores
- Búsqueda de usuarios de GitHub
- Estadísticas detalladas del usuario
- Listado de repositorios del usuario
- Análisis de lenguajes más utilizados
- Sugerencias de desarrolladores populares

### Repository Detail - Análisis Detallado
- Información completa del repositorio
- Gráficos de actividad y commits
- Lista de principales contribuidores
- Distribución de lenguajes de programación
- Estadísticas temporales

### Favorites - Gestión de Favoritos
- Guardar repositorios y usuarios favoritos
- Organización y gestión de colecciones
- Acceso rápido a elementos guardados

## 🎨 Características de UI/UX

- **Diseño Responsivo**: Adaptable a todos los dispositivos
- **Modo Oscuro**: Interfaz adaptable a preferencias del usuario
- **Estados de Carga**: Skeleton screens para mejor experiencia
- **Animaciones Suaves**: Transiciones y efectos visuales
- **Accesibilidad**: Cumple estándares de accesibilidad web

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes configurar las siguientes variables:

```typescript
// src/services/github.service.ts
const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = 'tu-token-aqui'; // Opcional pero recomendado
```

### Personalización de Estilos

Los estilos se pueden personalizar en:
- `src/global_styles.css` - Estilos globales
- `tailwind.config.js` - Configuración de Tailwind

## 📊 API de GitHub

Esta aplicación utiliza la API pública de GitHub v3:

- **Sin autenticación**: 60 requests por hora
- **Con token**: 5,000 requests por hora

### Endpoints utilizados:
- `/search/repositories` - Búsqueda de repositorios
- `/users/{username}` - Información de usuario
- `/users/{username}/repos` - Repositorios del usuario
- `/repos/{owner}/{repo}` - Detalles del repositorio
- `/repos/{owner}/{repo}/contributors` - Contribuidores
- `/repos/{owner}/{repo}/languages` - Lenguajes
- `/repos/{owner}/{repo}/stats/commit_activity` - Estadísticas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Reconocimientos

- [GitHub API](https://docs.github.com/en/rest) - Fuente de datos
- [Angular](https://angular.io/) - Framework de desarrollo
- [Tailwind CSS](https://tailwindcss.com/) - Framework de estilos
- [Chart.js](https://www.chartjs.org/) - Librería de gráficos
- [Heroicons](https://heroicons.com/) - Iconos utilizados

---

Desarrollado con ❤️ usando Angular y TypeScript
