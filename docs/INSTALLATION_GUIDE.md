# 🚀 Guía de Instalación - LaboratorioLao

## 📋 Información General

Esta guía proporciona instrucciones detalladas para instalar y configurar el sistema LaboratorioLao en diferentes entornos (desarrollo, testing y producción).

---

## 📋 Requisitos del Sistema

### 💻 Requisitos Mínimos

#### **Hardware**
- **CPU**: 2 cores, 2.0 GHz
- **RAM**: 4 GB
- **Almacenamiento**: 20 GB disponibles
- **Red**: Conexión a internet estable

#### **Software Base**
- **Sistema Operativo**: Linux (Ubuntu 20.04+), macOS (10.15+), Windows 10+
- **Node.js**: Versión 18.0 o superior
- **MySQL**: Versión 8.0 o superior
- **Git**: Para clonar el repositorio

### 🎯 Requisitos Recomendados

#### **Hardware**
- **CPU**: 4 cores, 3.0 GHz
- **RAM**: 8 GB o más
- **Almacenamiento**: SSD 50 GB
- **Red**: Conexión dedicada

#### **Software**
- **Node.js**: Versión LTS más reciente
- **MySQL**: Versión 8.0.30+
- **PM2**: Para gestión de procesos en producción
- **Nginx**: Como reverse proxy (producción)

---

## 🛠️ Instalación de Dependencias

### 📦 Node.js

#### **Ubuntu/Debian**
```bash
# Actualizar repositorios
sudo apt update

# Instalar Node.js desde NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

#### **macOS (con Homebrew)**
```bash
# Instalar Homebrew si no está instalado
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar Node.js
brew install node

# Verificar instalación
node --version
npm --version
```

#### **Windows**
1. Descargar desde https://nodejs.org/
2. Ejecutar el instalador
3. Seguir el asistente de instalación
4. Verificar en Command Prompt:
```cmd
node --version
npm --version
```

### 🗄️ MySQL

#### **Ubuntu/Debian**
```bash
# Instalar MySQL Server
sudo apt install mysql-server

# Ejecutar configuración segura
sudo mysql_secure_installation

# Iniciar servicio
sudo systemctl start mysql
sudo systemctl enable mysql

# Crear usuario de aplicación
sudo mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE laboratorio_lao CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de aplicación
CREATE USER 'lab_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON laboratorio_lao.* TO 'lab_user'@'localhost';
FLUSH PRIVILEGES;

-- Salir
EXIT;
```

#### **macOS (con Homebrew)**
```bash
# Instalar MySQL
brew install mysql

# Iniciar servicio
brew services start mysql

# Configuración inicial
mysql_secure_installation
```

#### **Windows**
1. Descargar MySQL Installer desde https://dev.mysql.com/downloads/installer/
2. Ejecutar instalación completa
3. Configurar password de root
4. Crear base de datos usando MySQL Workbench

---

## 📥 Descarga e Instalación

### 1️⃣ Clonar Repositorio

```bash
# Clonar el repositorio
git clone https://github.com/anglfer/LaboratorioLao.git

# Navegar al directorio
cd LaboratorioLao

# Verificar estructura
ls -la
```

### 2️⃣ Instalar Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Si hay errores con puppeteer, instalar sin puppeteer
PUPPETEER_SKIP_DOWNLOAD=true npm install

# O forzar instalación (si es necesario)
npm install --force
```

### 3️⃣ Configuración de Variables de Entorno

```bash
# Crear archivo de configuración
cp .env.example .env

# Editar configuración
nano .env
```

#### **Configuración .env**
```env
# Base de datos
DATABASE_URL="mysql://lab_user:secure_password_here@localhost:3306/laboratorio_lao"

# Sesiones
SESSION_SECRET="tu-clave-secreta-muy-larga-y-compleja-aqui"

# Entorno
NODE_ENV="development"

# Puerto del servidor
PORT=3000

# URL base (para producción)
BASE_URL="http://localhost:3000"

# Configuración de email (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# Configuración de PDF
PDF_TIMEOUT=30000

# Logs
LOG_LEVEL="info"
```

### 4️⃣ Configuración de Base de Datos

```bash
# Generar cliente de Prisma
npm run db:generate

# Aplicar migraciones (crear tablas)
npm run db:push

# Poblar datos iniciales
npm run seed
```

### 5️⃣ Verificar Instalación

```bash
# Verificar compilación TypeScript
npm run check

# Construir la aplicación
npm run build

# Iniciar en modo desarrollo
npm run dev
```

### 6️⃣ Acceso al Sistema

Abrir navegador y navegar a:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

**Credenciales por defecto:**
- Email: `admin@laboratorio.com`
- Password: `admin123`

---

## 🔧 Configuración Avanzada

### 🌐 Configuración de Red

#### **Firewall (Ubuntu)**
```bash
# Permitir puerto de la aplicación
sudo ufw allow 3000
sudo ufw allow 5173

# Para producción con Nginx
sudo ufw allow 80
sudo ufw allow 443
```

#### **Configuración de Host**
Para acceso desde otras máquinas en la red local, editar `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0', // Permitir acceso desde cualquier IP
    port: 5173
  },
  // ... resto de configuración
});
```

### 📊 Configuración de Base de Datos Avanzada

#### **Optimización MySQL**
Editar `/etc/mysql/mysql.conf.d/mysqld.cnf`:

```ini
[mysqld]
# Configuración de rendimiento
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
max_connections = 200

# Configuración de caracteres
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Configuración de zona horaria
default-time-zone = '-06:00'

# Logs de consultas lentas
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

Reiniciar MySQL:
```bash
sudo systemctl restart mysql
```

#### **Backup Automático**
Crear script de backup:

```bash
# Crear directorio para backups
sudo mkdir -p /var/backups/laboratorio

# Crear script de backup
sudo nano /usr/local/bin/backup-lab.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/laboratorio"
DB_NAME="laboratorio_lao"
DB_USER="lab_user"
DB_PASS="secure_password_here"

# Crear backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/backup-lab.sh

# Agregar a crontab para backup diario
sudo crontab -e
```

Agregar línea:
```
0 2 * * * /usr/local/bin/backup-lab.sh
```

---

## 🏭 Configuración para Producción

### 🔒 Seguridad

#### **Variables de Entorno Seguras**
```env
# Generar clave secreta fuerte
SESSION_SECRET="una-clave-muy-larga-y-aleatoria-de-al-menos-64-caracteres"

# Modo producción
NODE_ENV="production"

# Base de datos con SSL
DATABASE_URL="mysql://lab_user:password@localhost:3306/laboratorio_lao?sslmode=require"

# Configuración de seguridad adicional
SECURE_COOKIES=true
HTTPS_ONLY=true
```

#### **Configuración SSL/HTTPS**
```bash
# Generar certificados SSL (Let's Encrypt)
sudo apt install certbot

# Obtener certificado
sudo certbot certonly --standalone -d tu-dominio.com
```

### 🌐 Nginx como Reverse Proxy

#### **Instalación**
```bash
sudo apt install nginx
```

#### **Configuración**
Crear archivo `/etc/nginx/sites-available/laboratorio`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    
    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;
    
    # Configuración SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend estático
    location / {
        root /ruta/a/LaboratorioLao/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
    
    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/laboratorio /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 🔄 Gestión con PM2

#### **Instalación**
```bash
# Instalar PM2 globalmente
npm install -g pm2
```

#### **Configuración**
Crear archivo `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'laboratorio-lao',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max_old_space_size=1024'
  }]
};
```

#### **Comandos PM2**
```bash
# Crear directorio de logs
mkdir logs

# Iniciar aplicación
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart laboratorio-lao

# Detener
pm2 stop laboratorio-lao

# Configurar startup automático
pm2 startup
pm2 save
```

---

## 🔍 Verificación y Testing

### ✅ Verificaciones Post-Instalación

#### **1. Base de Datos**
```bash
# Verificar conexión
mysql -u lab_user -p laboratorio_lao -e "SHOW TABLES;"

# Verificar datos iniciales
mysql -u lab_user -p laboratorio_lao -e "SELECT * FROM Role;"
```

#### **2. API Endpoints**
```bash
# Verificar servidor
curl http://localhost:3000/api/dashboard/stats

# Verificar autenticación
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@laboratorio.com","password":"admin123"}'
```

#### **3. Frontend**
```bash
# Verificar build
npm run build

# Verificar archivos generados
ls -la dist/
```

### 🧪 Ejecutar Tests

```bash
# Tests de endpoints
./test-endpoints.sh

# Test de flujo completo
node test-presupuesto-flow.js

# Test de comunicación backend
node test-backend-communication.js
```

---

## 🚨 Solución de Problemas Comunes

### ❌ Error: Cannot find module 'node'

**Problema**: Error de tipos TypeScript
```bash
error TS2688: Cannot find type definition file for 'node'.
```

**Solución**:
```bash
# Instalar tipos de Node.js
npm install --save-dev @types/node

# O reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### ❌ Error de conexión MySQL

**Problema**: `Error: connect ECONNREFUSED 127.0.0.1:3306`

**Solución**:
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Iniciar MySQL si está detenido
sudo systemctl start mysql

# Verificar puertos abiertos
netstat -tlnp | grep :3306
```

### ❌ Error Puppeteer Download

**Problema**: Error al descargar Chrome para Puppeteer

**Solución**:
```bash
# Instalar sin Puppeteer
PUPPETEER_SKIP_DOWNLOAD=true npm install

# O instalar Chrome manualmente
sudo apt update
sudo apt install google-chrome-stable
```

### ❌ Error de permisos

**Problema**: `EACCES: permission denied`

**Solución**:
```bash
# Cambiar propietario de archivos
sudo chown -R $USER:$USER /ruta/a/LaboratorioLao

# O usar npm con permisos adecuados
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile
```

### ❌ Puerto en uso

**Problema**: `Error: listen EADDRINUSE :::3000`

**Solución**:
```bash
# Ver qué proceso usa el puerto
sudo lsof -i :3000

# Matar proceso si es necesario
sudo kill -9 PID

# O cambiar puerto en .env
echo "PORT=3001" >> .env
```

---

## 🔄 Actualización del Sistema

### 📥 Actualizar Código

```bash
# Respaldar base de datos
mysqldump -u lab_user -p laboratorio_lao > backup_pre_update.sql

# Obtener últimos cambios
git pull origin main

# Actualizar dependencias
npm install

# Aplicar migraciones si las hay
npm run db:push

# Reconstruir aplicación
npm run build

# Reiniciar servicios
pm2 restart laboratorio-lao
```

### 🔄 Rollback en caso de problemas

```bash
# Volver a versión anterior
git log --oneline -10
git checkout COMMIT_HASH

# Restaurar base de datos
mysql -u lab_user -p laboratorio_lao < backup_pre_update.sql

# Reconstruir
npm run build
pm2 restart laboratorio-lao
```

---

## 📊 Monitoreo y Mantenimiento

### 📈 Logs y Monitoreo

#### **Configurar Logrotate**
```bash
sudo nano /etc/logrotate.d/laboratorio-lao
```

```
/ruta/a/LaboratorioLao/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### **Monitoreo con PM2**
```bash
# Instalar PM2 monitor
pm2 install pm2-server-monit

# Ver estadísticas en tiempo real
pm2 monit
```

### 🧹 Mantenimiento Regular

#### **Script de Mantenimiento Semanal**
```bash
#!/bin/bash
# /usr/local/bin/maintenance-lab.sh

echo "=== Mantenimiento LaboratorioLao ===" >> /var/log/maintenance.log
date >> /var/log/maintenance.log

# Backup de base de datos
/usr/local/bin/backup-lab.sh

# Limpiar logs antiguos
find /ruta/a/LaboratorioLao/logs -name "*.log" -mtime +7 -delete

# Actualizar estadísticas de MySQL
mysql -u lab_user -p$DB_PASS laboratorio_lao -e "ANALYZE TABLE Cliente, Obra, Presupuesto;"

# Reiniciar aplicación para liberar memoria
pm2 restart laboratorio-lao

echo "Mantenimiento completado" >> /var/log/maintenance.log
```

```bash
# Hacer ejecutable
sudo chmod +x /usr/local/bin/maintenance-lab.sh

# Programar en crontab (cada domingo a las 3 AM)
0 3 * * 0 /usr/local/bin/maintenance-lab.sh
```

---

## 📞 Soporte y Recursos

### 🆘 Obtener Ayuda

1. **Documentación**: Revisar archivos en `/docs`
2. **Logs**: Verificar archivos de log para errores específicos
3. **GitHub Issues**: Reportar problemas en el repositorio
4. **Comunidad**: Buscar soluciones en Stack Overflow

### 📚 Recursos Adicionales

- **Prisma Documentation**: https://www.prisma.io/docs/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices
- **MySQL Performance**: https://dev.mysql.com/doc/refman/8.0/en/optimization.html
- **Nginx Configuration**: https://nginx.org/en/docs/

---

*Guía de instalación generada para LaboratorioLao v1.0.0*