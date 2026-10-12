# faceAI-extract

Proyecto para descargar 30 rostros generados aleatoriamente desde [thispersondoesnotexist.com](https://thispersondoesnotexist.com/), redimensionarlos a 150x180 y convertirlos a formato WebP conservando el nombre base del archivo.

## ¿Qué hace?

El script realiza lo siguiente:

- descarga una imagen aleatoria de `thispersondoesnotexist.com`
- guarda la versión original en la carpeta `originals`
- redimensiona la imagen a `150x180`
- la convierte a WebP con calidad alta
- guarda el resultado en `output`
- repite el proceso 30 veces

## Requisitos

- Node.js 18 o superior
- npm

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

También puedes usar:

```bash
npm run download
```

## Estructura del proyecto

```text
faceAI-extract/
├── index.js
├── package.json
├── package-lock.json
├── originals/
│   ├── face-01.jpg
│   ├── face-02.jpg
│   └── ...
├── output/
│   ├── face-01.webp
│   ├── face-02.webp
│   └── ...
└── README.md
```

## Configuración

El script define estos valores por defecto:

- `TOTAL = 30`
- `WIDTH = 150`
- `HEIGHT = 180`
- formato de salida: `WebP`

## Nota

Las imágenes se descargan desde un servicio externo y el nombre de salida mantiene el mismo patrón de archivo (`face-01`, `face-02`, etc.), cambiando solo la extensión final.

## Licencia

Este proyecto usa la licencia MIT.
