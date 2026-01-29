# 🔧 Sistema de Gestión de Calibraciones

Sistema web para gestionar el listado maestro de equipos de calibración. Desarrollado con HTML, CSS, JavaScript vanilla y la librería SheetJS para manejo de archivos Excel.

## ✨ Características

- **📥 Importar Excel**: Carga archivos .xlsx con la estructura del listado maestro
- **➕ Nuevo Registro**: Agregar nuevos equipos de calibración
- **✏️ Actualizar**: Modificar información de equipos existentes
- **🗑️ Eliminar**: Remover equipos del sistema
- **🔍 Búsqueda y Filtros**: Buscar por ID, nombre, serie, ubicación, PRP5, tipo, estado
- **📊 Dashboard**: Estadísticas en tiempo real (total, vigentes, por vencer, vencidos)
- **📥 Exportar Excel**: Descargar el listado actualizado en formato Excel
- **💾 Persistencia**: Los datos se guardan automáticamente en localStorage del navegador

## 🎯 Estructura del Excel

El sistema espera un archivo Excel con las siguientes columnas (a partir de la fila 3):

1. No
2. ID
3. NOMBRE DEL EQUIPO
4. Modelo
5. No. SERIE
6. FABRICANTE
7. RANGO (Irlo agregando)
8. UBICACION
9. RESPONSIBLE
10. Fecha de calibracion
11. VENCIMIENTO CALIBRACIÓN
12. Precio $
13. VENCIMIENTO CALIBRACIÓN A 2 ANOS
14. Etiqueta
15. Certificado
16. PRP5
17. Interno / Externo
18. Notas

## 🚀 Instalación

### Para usar localmente:

1. Clona o descarga este repositorio
2. Abre `index.html` en tu navegador
3. Carga tu archivo Excel existente o comienza a registrar equipos manualmente

### Para GitHub Pages:

1. Sube los archivos a tu repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama `main` y carpeta `/` (root)
4. Guarda y espera unos minutos
5. Tu sistema estará disponible en: `https://tu-usuario.github.io/tu-repositorio/`

## 📖 Guía de Uso

### 1️⃣ Cargar Datos Existentes

- Haz clic en "Elegir archivo" y selecciona tu archivo Excel
- El sistema cargará automáticamente todos los registros
- Los datos se guardarán en el navegador

### 2️⃣ Agregar Nuevo Equipo

- Clic en botón "➕ Nuevo"
- Llena el formulario (ID y Nombre son obligatorios)
- Clic en "Guardar"

### 3️⃣ Actualizar Equipo

- Clic en botón "✏️ Actualizar"
- Busca por ID o Nombre del equipo
- Modifica los campos necesarios
- Clic en "Actualizar"

### 4️⃣ Eliminar Equipo

- Clic en botón "🗑️ Eliminar"
- Busca por ID o Nombre del equipo
- Confirma la eliminación

### 5️⃣ Usar Filtros

- Clic en botón "🔍 Filtros"
- Selecciona los criterios deseados:
  - Ubicación
  - PRP5
  - Tipo (Interno/Externo)
  - Estado de calibración (Vigente/Próximo/Vencido)
- Clic en "Aplicar Filtros"

### 6️⃣ Exportar Datos

- Clic en botón "📥 Descargar Excel"
- El archivo se descargará con el formato correcto
- Nombre del archivo: `Calibraciones_YYYY-MM-DD.xlsx`

## 🎨 Estados de Calibración

El sistema clasifica automáticamente los equipos según su fecha de vencimiento:

- 🟢 **VIGENTE**: Más de 30 días para vencer
- 🟡 **PRÓXIMO**: Vence en 30 días o menos
- 🔴 **VENCIDO**: Ya venció la calibración

## 💡 Consejos

- **Respaldo Regular**: Descarga el Excel periódicamente como respaldo
- **Búsqueda Rápida**: Usa la barra de búsqueda superior para encontrar equipos rápidamente
- **Filtros Múltiples**: Combina varios filtros para análisis específicos
- **localStorage**: Los datos se guardan en tu navegador, no se pierden al recargar la página

## 🔒 Consideraciones de Seguridad

- Los datos se almacenan localmente en el navegador (localStorage)
- No hay conexión a servidor ni base de datos externa
- Los archivos Excel se procesan completamente en el navegador
- Para uso empresarial, considera implementar autenticación y base de datos

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura
- **CSS3**: Diseño responsive con gradientes y animaciones
- **JavaScript ES6+**: Lógica de la aplicación
- **SheetJS (xlsx.js)**: Lectura y escritura de archivos Excel
- **localStorage**: Persistencia de datos en el navegador

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso libre.

## 👥 Autor

Sistema desarrollado para la gestión de equipos de calibración en entornos industriales.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea una rama para tu característica
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**Última actualización**: 2025
