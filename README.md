# Laluca · Panel de Tráfico

Panel único para organizar el tráfico de una agencia de comunicación.

## Incluye

- Tabla de **Tráfico** con cliente, proyecto, estado, responsable, fechas y horas.
- Cálculo automático de **horas presupuestadas, realizadas, reservadas, restantes y sin planificar**.
- **Planificación semanal** por persona y día con arrastrar y soltar.
- Vista **Mi trabajo** para cada técnico, con temporizador y registro manual de tiempo.
- Vista de **Proyectos / rentabilidad** a partir de la tarifa por hora.
- **Equipo / capacidad** semanal.
- Importación de **CSV** procedente de Excel o Google Sheets.
- Pantalla preparada para conectar **Holded** y **Google Calendar** en una segunda fase.

## Datos

Esta primera versión usa datos ficticios y guarda los cambios en `localStorage` del navegador. No contiene información real de clientes.

## Probar localmente

Puedes abrir `index.html` directamente o servir la carpeta con:

```bash
python3 -m http.server 8080
```

Luego abre `http://localhost:8080`.

## Uso real multiusuario

La siguiente fase debe sustituir `localStorage` por un backend compartido (por ejemplo Cloudflare Workers + D1), manteniendo la interfaz actual. Las credenciales de Holded y los tokens OAuth de Google Calendar deben guardarse únicamente en servidor.
