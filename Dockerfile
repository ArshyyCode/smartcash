FROM php:8.2-apache

# Mengaktifkan modul rewrite Apache agar URL Laravel rapi
RUN a2enmod rewrite

# Menyalin seluruh file proyek ke dalam server Docker
COPY . /var/www/html/

# Mengatur direktori kerja utama
WORKDIR /var/www/html

# Mengarahkan document root Apache langsung ke folder public Laravel
RUN sed -i -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Membuka port 80 untuk akses web
EXPOSE 80