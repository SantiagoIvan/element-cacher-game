# Circle Zap 🎯

Juego arcade client-side construido con Next.js y TypeScript. El jugador debe capturar el objeto correcto entre varios círculos que caen desde la parte superior de la pantalla.

## Flujo de juego

1. **Pantalla de inicio** — reglas y botón para empezar
2. **Selección de objeto** — el juego elige aleatoriamente una imagen objetivo y se la muestra al jugador, indicando cual tiene que atrapar
3. **Cuenta regresiva** — countdown de 3 segundos antes de arrancar
4. **Partida** — 30 segundos para capturar la mayor cantidad de objetos correctos
5. **Resultado** — score final con rango y opciones para volver a jugar o ir al menú

## Reglas

| Acción | Puntos |
|---|---|
| Clickear el objeto correcto | +10 |
| Clickear un objeto incorrecto | −20 |
| Click en área vacía | −20 |
| Objeto que escapa por abajo | sin penalización |

## Configuración

Todas las variables de juego se configuran desde `.env.local`:

```bash
NEXT_PUBLIC_GAME_DURATION=        # duración de la partida en segundos
NEXT_PUBLIC_SPAWN_INTERVAL=      # ms entre spawns de círculos
NEXT_PUBLIC_CIRCLE_SPEED_MIN=     # velocidad mínima de caída (px/s)
NEXT_PUBLIC_CIRCLE_SPEED_MAX=    # velocidad máxima de caída (px/s)
NEXT_PUBLIC_POINTS_HIT=           # puntos por acertar
NEXT_PUBLIC_POINTS_MISS=-         # puntos por errar
NEXT_PUBLIC_COUNTDOWN_START=       # segundos del countdown inicial
```

## Imágenes

Las imágenes de los objetos viven en `/public` y se definen en `TARGET_IMAGES` dentro del componente:

```ts
const TARGET_IMAGES: TargetImage[] = [
  { src: "/1-frutilla.jpeg",       color: "#F03687" },
  { src: "/2-vainilla.jpeg",       color: "#F6D788" },
  { src: "/3-frutilla-light.jpeg", color: "#F9D6D5" },
  { src: "/4-vainilla-light.jpeg", color: "#F9F5E3" },
];
```

Cada imagen tiene un color asociado que se usa como fondo del círculo y para el efecto de glow. Para agregar o reemplazar imágenes, basta con actualizar este array.

## Setup

```bash
npm install
cp .env.local.example .env.local  # o crearlo manualmente
npm run dev
```