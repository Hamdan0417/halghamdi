#!/usr/bin/env bash
# تم تعديل السكريبت ليناسب MacBook Pro وتجاوز أخطاء الربط

set -eo pipefail # أزلنا -u لتجنب خطأ unbound variable

HOST="ftp.cheasy.store"
USER="hamdan@halghamdi.com"
PASS="Hghamdi39@"
REMOTE_DIR="."
ENV_FILE=".env"
DIST_DIR="dist"
CONTACT_TEMPLATE="server/contact.php.tpl"

if [[ "${PASS}" == "ضع_كلمة_المرور_هنا" ]]; then
    echo "خطأ: يرجى وضع كلمة مرور الـ FTP في ملف deploy.sh"
    exit 1
fi

cleanup() {
    rm -rf "${DIST_DIR}"
}
trap cleanup EXIT

# التحقق من وجود الملفات المطلوبة
if [[ ! -f "${ENV_FILE}" ]]; then echo "ملف .env غير موجود"; exit 1; fi
if [[ ! -f "${CONTACT_TEMPLATE}" ]]; then echo "قالب contact.php.tpl غير موجود في مجلد server"; exit 1; fi

# قراءة المتغيرات من .env وتصديرها للنظام
export $(grep -v '^#' .env | xargs)

# تجهيز مجلد التوزيع
rm -rf "${DIST_DIR}"
mkdir -p "${DIST_DIR}"
cp -R public/. "${DIST_DIR}/"

# إنشاء ملف .htaccess حسب إعداداتك
cat > "${DIST_DIR}/.htaccess" <<'EOF'
# 1. منع ظهور قائمة الملفات (Index of) تماماً
Options -Indexes

# 2. إجبار السيرفر على اعتبار index.html هو البداية
DirectoryIndex index.html index.php

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # 3. توجيه اللغات ar و en
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(ar|en)$ $1/ [R=301,L]
</IfModule>
EOF

# 1. استبدال مفتاح Turnstile في ملفات HTML/JS
echo "Infecting Site Key..."
find "${DIST_DIR}" -type f \( -name "*.html" -o -name "*.js" \) -exec sed -i '' "s/{{TURNSTILE_SITE_KEY}}/${TURNSTILE_SITE_KEY}/g" {} +

# 2. إنشاء ملف contact.php وحقن البيانات السرية
echo "Generating contact.php..."
cp "${CONTACT_TEMPLATE}" "${DIST_DIR}/contact.php"
sed -i '' "s/{{TURNSTILE_SECRET_KEY}}/${TURNSTILE_SECRET_KEY}/g" "${DIST_DIR}/contact.php"
sed -i '' "s/{{SMTP_HOST}}/${SMTP_HOST}/g" "${DIST_DIR}/contact.php"
sed -i '' "s/{{SMTP_PORT}}/${SMTP_PORT}/g" "${DIST_DIR}/contact.php"
sed -i '' "s/{{SMTP_USER}}/${SMTP_USER}/g" "${DIST_DIR}/contact.php"
sed -i '' "s/{{SMTP_PASS}}/${SMTP_PASS}/g" "${DIST_DIR}/contact.php"
sed -i '' "s/{{EMAIL_TO}}/${EMAIL_TO}/g" "${DIST_DIR}/contact.php"

# 3. الرفع للسيرفر
echo "🚀 Connecting to server and uploading..."
lftp -u "${USER},${PASS}" "${HOST}" <<EOF
set ftp:ssl-allow no
set ssl:verify-certificate no
mirror -R --delete --verbose "${DIST_DIR}/" "${REMOTE_DIR}"
bye
EOF

echo "✅ Done! الموقع الآن متاح على halghamdi.com"
