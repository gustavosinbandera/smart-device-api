## Resumen de comandos DynamoDB para la tabla `Devices`

### Inserción de datos de prueba

Ejecuta estos seis comandos para insertar los ítems de ejemplo directamente desde la CLI:

```bash
# 1. Metadatos de esp32-abc123
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id":     { "S": "esp32-abc123" },
    "sk":            { "S": "#METADATA#" },
    "type":          { "S": "Controladora 7R5D" },
    "user_id":       { "S": "user-001" },
    "raspi_id":      { "S": "rpi-001" },
    "registered_at": { "S": "2025-07-02T15:30:00Z" },
    "analog_inputs":  { "N": "0" },
    "analog_outputs": { "N": "0" },
    "digital_inputs": { "N": "5" },
    "digital_outputs":{ "N": "7" }
  }'

# 2. GPIO#1 de esp32-abc123
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id": { "S": "esp32-abc123" },
    "sk":        { "S": "GPIO#1" },
    "gpio":      { "S": "gpio-1" },
    "aliases": {
      "L": [
        { "S": "bombillo" },
        { "S": "bombilla" },
        { "S": "foco" }
      ]
    }
  }'

# 3. GPIO#2 de esp32-abc123
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id": { "S": "esp32-abc123" },
    "sk":        { "S": "GPIO#2" },
    "gpio":      { "S": "gpio-2" },
    "aliases": {
      "L": [
        { "S": "ventilador" },
        { "S": "extractor" }
      ]
    }
  }'

# 4. Metadatos de esp32-demo-001
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id":     { "S": "esp32-demo-001" },
    "sk":            { "S": "#METADATA#" },
    "type":          { "S": "Controladora DEMO" },
    "user_id":       { "S": "8408e488-9031-70f9-2bef-deaaa82706e1" },
    "raspi_id":      { "S": "rpi-002" },
    "registered_at": { "S": "2025-07-03T20:35:00Z" },
    "analog_inputs":  { "N": "0" },
    "analog_outputs": { "N": "0" },
    "digital_inputs": { "N": "4" },
    "digital_outputs":{ "N": "6" }
  }'

# 5. GPIO#1 de esp32-demo-001
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id": { "S": "esp32-demo-001" },
    "sk":        { "S": "GPIO#1" },
    "gpio":      { "S": "gpio-1" },
    "aliases": {
      "L": [
        { "S": "led" },
        { "S": "luz" }
      ]
    }
  }'

# 6. GPIO#2 de esp32-demo-001
aws dynamodb put-item \
  --region us-east-1 \
  --table-name Devices \
  --item '{
    "device_id": { "S": "esp32-demo-001" },
    "sk":        { "S": "GPIO#2" },
    "gpio":      { "S": "gpio-2" },
    "aliases": {
      "L": [
        { "S": "sensor" },
        { "S": "medidor" }
      ]
    }
  }'
```

---

### Consultas desde la CLI

1. **Traer todos los ítems de un dispositivo** (`esp32-abc123`):

```bash
aws dynamodb query \
  --region us-east-1 \
  --table-name Devices \
  --key-condition-expression "device_id = :d" \
  --expression-attribute-values '{":d":{"S":"esp32-abc123"}}'
```

2. **Traer sólo GPIOs** (items cuyo `sk` comienza con `GPIO#`):

```bash
aws dynamodb query \
  --region us-east-1 \
  --table-name Devices \
  --key-condition-expression "device_id = :d AND begins_with(sk, :g)" \
  --expression-attribute-values '{":d":{"S":"esp32-abc123"},":g":{"S":"GPIO#"}}'
```

3. **Traer sólo metadatos** (`#METADATA#`):

```bash
aws dynamodb get-item \
  --region us-east-1 \
  --table-name Devices \
  --key '{"device_id":{"S":"esp32-abc123"},"sk":{"S":"#METADATA#"}}'
```




























---

## Tabla `RaspberryPis`

### Esquema recomendado

* **Partition Key**: `raspi_id` (S)
* **Atributos**:

  * `user_id` (S)
  * `location` (S)
  * `registered_at` (S, ISO8601)
  * `is_active` (BOOL)
  * `last_seen` (S, ISO8601)
  * `fw_version` (S)
  * `notes` (S)

### Datos de prueba de ejemplo

```bash
# 1. Insertar rpi-001 (Casa principal)
aws dynamodb put-item \
  --region us-east-1 \
  --table-name RaspberryPis \
  --item '{
    "raspi_id":      { "S": "rpi-001" },
    "user_id":       { "S": "user-001" },
    "location":      { "S": "Casa principal" },
    "registered_at": { "S": "2025-07-02T15:00:00Z" },
    "is_active":     { "BOOL": true },
    "last_seen":     { "S": "2025-07-09T08:45:00-05:00" },
    "fw_version":    { "S": "v1.0.3" },
    "notes":         { "S": "Broker Mosquitto, TLS habilitado" }
  }'

# 2. Insertar rpi-002 (Oficina secundaria)
aws dynamodb put-item \
  --region us-east-1 \
  --table-name RaspberryPis \
  --item '{
    "raspi_id":      { "S": "rpi-002" },
    "user_id":       { "S": "8408e488-9031-70f9-2bef-deaaa82706e1" },
    "location":      { "S": "Oficina secundaria" },
    "registered_at": { "S": "2025-07-03T20:00:00Z" },
    "is_active":     { "BOOL": false },
    "last_seen":     { "S": "2025-07-08T22:10:00-05:00" },
    "fw_version":    { "S": "v1.0.2" },
    "notes":         { "S": "Pendiente actualización de certs" }
  }'
```

### Consultas desde la CLI

1. **Obtener todos los ítems de RaspberryPis**

```bash
aws dynamodb scan \
  --region us-east-1 \
  --table-name RaspberryPis
```

2. **Obtener una RaspberryPi específica** (`rpi-001`)

```bash
aws dynamodb get-item \
  --region us-east-1 \
  --table-name RaspberryPis \
  --key '{"raspi_id":{"S":"rpi-001"}}'
```

3. **Filtrar por estado activo**

```bash
aws dynamodb scan \
  --region us-east-1 \
  --table-name RaspberryPis \
  --filter-expression "is_active = :a" \
  --expression-attribute-values '{":a":{"BOOL":true}}'
```
