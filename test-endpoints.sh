#!/bin/bash

echo "=== PRUEBA COMPLETA DE ENDPOINTS DE PRESUPUESTOS ==="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
COOKIE_FILE="cookies.txt"

# Función para mostrar respuesta
show_response() {
    local title="$1"
    local response="$2"
    local status_code="$3"
    
    echo -e "${YELLOW}=== $title ===${NC}"
    echo -e "Status Code: $status_code"
    echo -e "Response:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
}

# Limpiar cookies anteriores
rm -f $COOKIE_FILE

echo "1. AUTENTICACIÓN"
echo "=================="

# Login
echo "🔐 Haciendo login..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -c $COOKIE_FILE \
  -d '{
    "email": "admin@laboratorio.com",
    "password": "admin123"
  }')

STATUS_CODE="${LOGIN_RESPONSE: -3}"
RESPONSE_BODY="${LOGIN_RESPONSE%???}"

show_response "LOGIN" "$RESPONSE_BODY" "$STATUS_CODE"

if [ "$STATUS_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Login exitoso${NC}"
else
    echo -e "${RED}❌ Error en login${NC}"
    exit 1
fi

echo ""
echo "2. VERIFICACIÓN DE DATOS REFERENCIALES"
echo "======================================"

# Obtener clientes
echo "👥 Obteniendo clientes..."
CLIENTES_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/clientes" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${CLIENTES_RESPONSE: -3}"
RESPONSE_BODY="${CLIENTES_RESPONSE%???}"

show_response "GET CLIENTES" "$RESPONSE_BODY" "$STATUS_CODE"

# Obtener obras
echo "🏗️ Obteniendo obras..."
OBRAS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/obras" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${OBRAS_RESPONSE: -3}"
RESPONSE_BODY="${OBRAS_RESPONSE%???}"

show_response "GET OBRAS" "$RESPONSE_BODY" "$STATUS_CODE"

# Obtener conceptos
echo "📋 Obteniendo conceptos..."
CONCEPTOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/conceptos-jerarquicos" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${CONCEPTOS_RESPONSE: -3}"
RESPONSE_BODY="${CONCEPTOS_RESPONSE%???}"

show_response "GET CONCEPTOS" "$RESPONSE_BODY" "$STATUS_CODE"

echo ""
echo "3. OPERACIONES CRUD DE PRESUPUESTOS"
echo "==================================="

# Primero crear un cliente para la prueba
echo "� Creando cliente de prueba..."
CREATE_CLIENTE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/clientes" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{
    "nombre": "Cliente Test Curl",
    "direccion": "Dirección cliente test 123"
  }')

STATUS_CODE="${CREATE_CLIENTE_RESPONSE: -3}"
RESPONSE_BODY="${CREATE_CLIENTE_RESPONSE%???}"

show_response "CREATE CLIENTE" "$RESPONSE_BODY" "$STATUS_CODE"

# Extraer ID del cliente
CLIENTE_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // empty' 2>/dev/null)
if [ -z "$CLIENTE_ID" ] || [ "$CLIENTE_ID" = "null" ]; then
    CLIENTE_ID=1
    echo "⚠️ Usando cliente ID por defecto: 1"
fi

# Crear presupuesto (sin obra, solo presupuesto)
echo "📝 Creando presupuesto..."
CREATE_PRESUPUESTO_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/api/presupuestos" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE \
  -d '{
    "clienteId": '$CLIENTE_ID',
    "iva": 0.16,
    "subtotal": 100000.00,
    "ivaMonto": 16000.00,
    "total": 116000.00,
    "manejaAnticipo": true,
    "porcentajeAnticipo": 30.00,
    "estado": "borrador"
  }')

STATUS_CODE="${CREATE_PRESUPUESTO_RESPONSE: -3}"
RESPONSE_BODY="${CREATE_PRESUPUESTO_RESPONSE%???}"

show_response "CREATE PRESUPUESTO" "$RESPONSE_BODY" "$STATUS_CODE"

# Extraer ID del presupuesto creado
PRESUPUESTO_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // empty' 2>/dev/null)

if [ -n "$PRESUPUESTO_ID" ] && [ "$PRESUPUESTO_ID" != "null" ]; then
    echo -e "${GREEN}✅ Presupuesto creado con ID: $PRESUPUESTO_ID${NC}"
    
    # Obtener presupuesto específico
    echo "🔍 Obteniendo presupuesto específico..."
    GET_PRESUPUESTO_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/presupuestos/$PRESUPUESTO_ID" \
      -H "Content-Type: application/json" \
      -b $COOKIE_FILE)

    STATUS_CODE="${GET_PRESUPUESTO_RESPONSE: -3}"
    RESPONSE_BODY="${GET_PRESUPUESTO_RESPONSE%???}"

    show_response "GET PRESUPUESTO ESPECÍFICO" "$RESPONSE_BODY" "$STATUS_CODE"

    # Actualizar presupuesto
    echo "✏️ Actualizando presupuesto..."
    UPDATE_PRESUPUESTO_RESPONSE=$(curl -s -w "%{http_code}" -X PUT "$BASE_URL/api/presupuestos/$PRESUPUESTO_ID" \
      -H "Content-Type: application/json" \
      -b $COOKIE_FILE \
      -d '{
        "iva": 0.16,
        "subtotal": 120000.00,
        "ivaMonto": 19200.00,
        "total": 139200.00,
        "estado": "revision"
      }')

    STATUS_CODE="${UPDATE_PRESUPUESTO_RESPONSE: -3}"
    RESPONSE_BODY="${UPDATE_PRESUPUESTO_RESPONSE%???}"

    show_response "UPDATE PRESUPUESTO" "$RESPONSE_BODY" "$STATUS_CODE"

else
    echo -e "${RED}❌ No se pudo extraer el ID del presupuesto${NC}"
fi

# Obtener todos los presupuestos
echo "📋 Obteniendo todos los presupuestos..."
GET_ALL_PRESUPUESTOS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/presupuestos" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${GET_ALL_PRESUPUESTOS_RESPONSE: -3}"
RESPONSE_BODY="${GET_ALL_PRESUPUESTOS_RESPONSE%???}"

show_response "GET ALL PRESUPUESTOS" "$RESPONSE_BODY" "$STATUS_CODE"

# Si tenemos un presupuesto ID, intentar eliminarlo
if [ -n "$PRESUPUESTO_ID" ] && [ "$PRESUPUESTO_ID" != "null" ]; then
    echo "🗑️ Eliminando presupuesto..."
    DELETE_PRESUPUESTO_RESPONSE=$(curl -s -w "%{http_code}" -X DELETE "$BASE_URL/api/presupuestos/$PRESUPUESTO_ID" \
      -H "Content-Type: application/json" \
      -b $COOKIE_FILE)

    STATUS_CODE="${DELETE_PRESUPUESTO_RESPONSE: -3}"
    RESPONSE_BODY="${DELETE_PRESUPUESTO_RESPONSE%???}"

    show_response "DELETE PRESUPUESTO" "$RESPONSE_BODY" "$STATUS_CODE"
fi

echo ""
echo "4. PRUEBAS ADICIONALES"
echo "====================="

# Verificar estadísticas
echo "📊 Obteniendo estadísticas..."
STATS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/dashboard/stats" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${STATS_RESPONSE: -3}"
RESPONSE_BODY="${STATS_RESPONSE%???}"

show_response "GET DASHBOARD STATS" "$RESPONSE_BODY" "$STATUS_CODE"

# Verificar información de usuario
echo "👤 Verificando información de usuario..."
USER_INFO_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/api/auth/me" \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)

STATUS_CODE="${USER_INFO_RESPONSE: -3}"
RESPONSE_BODY="${USER_INFO_RESPONSE%???}"

show_response "GET USER INFO" "$RESPONSE_BODY" "$STATUS_CODE"

echo ""
echo -e "${GREEN}=== PRUEBAS COMPLETADAS ===${NC}"
echo "Todas las operaciones CRUD han sido probadas."
echo ""

# Limpiar archivos temporales
rm -f $COOKIE_FILE

echo "Archivo de cookies eliminado."
