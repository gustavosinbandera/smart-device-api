# Paso 1: Registrar o importar tu dominio en Route 53

    Abrir la consola de AWS y navegar a Route 53

    En el menú de la izquierda, bajo Domains, haz clic en Registered domains.

## Pulsa Register domain si aún no tienes ninguno:

        Teclea el nombre de dominio que quieras (p. ej. midominio.com).

        Comprueba la disponibilidad y sigue el asistente para comprarlo.

# Si ya tienes el dominio registrado en otro proveedor, en su lugar ve a Hosted zones y haz clic en Create hosted zone:

        En Domain Name, introduce tu dominio (p. ej. midominio.com).

        En Type, deja Public Hosted Zone.

        Haz clic en Create hosted zone.

        Copia los Name Servers que te muestra y pégalos en la configuración DNS de tu registrador actual para delegar la zona a Route 53.


https://us-east-1.console.aws.amazon.com/route53/domains/home?region=us-east-1#/DomainDetails/domoticore.co
```
Name servers

    ns-1894.awsdns-44.co.uk
    ns-1416.awsdns-49.org
    ns-535.awsdns-02.net
    ns-496.awsdns-62.com
```


# Paso 2: Añadir un registro Alias en Route 53

    En la consola de Route 53, ve a Hosted zones y haz clic en tu zona domoticore.co.

    Pulsa el botón Create record.

    En Record name, escribe:

app

(esto creará el subdominio app.domoticore.co).

En Record type, selecciona A – IPv4 address.

Activa Alias (cambia el toggle a “Yes”).

En Route traffic to, elige Alias to CloudFront distribution.

En Choose distribution, abre el desplegable y selecciona tu distribución de CloudFront (aparecerá como algo tipo d1234abcdef8.cloudfront.net).

Deja los demás valores por defecto y pulsa Create record.



# A) Crear la Hosted Zone desde la consola de AWS

    Abre la consola de AWS y ve al servicio Route 53.

    En el menú lateral, selecciona Hosted zones.

    Clic en Create hosted zone.

    Rellena los campos:

        Domain name: tu dominio, p. ej. domoticore.co.

        Type: deja Public hosted zone (para que sea accesible desde Internet).

        (Opcional) Description: algo como “Zona pública para domoticore.co”.

    Pulsa Create hosted zone.

    Al crearla verás automáticamente dos registros:

        Un registro NS con los name-servers de AWS.

        Un registro SOA para autoritativa.


# Paso 2: Añadir un registro Alias en Route 53

    En la consola de Route 53, ve a Hosted zones y haz clic en tu zona domoticore.co.

    Pulsa el botón Create record.

    En Record name, escribe:

app

(esto creará el subdominio app.domoticore.co).

En Record type, selecciona A – IPv4 address.

Activa Alias (cambia el toggle a “Yes”).

En Route traffic to, elige Alias to CloudFront distribution.

En Choose distribution, abre el desplegable y selecciona tu distribución de CloudFront (aparecerá como algo tipo d1234abcdef8.cloudfront.net).

Deja los demás valores por defecto y pulsa Create record.




# Paso 2A: Crear el bucket S3 para tu React App

    Abre la consola de S3.

    Haz clic en Create bucket.

    Ponle un nombre único, p. ej. react-app-domoticore-co.

    Deja el resto por defecto y crea el bucket.

    Una vez creado, sube el contenido de tu carpeta build/ (el resultado de npm run build) a ese bucket.

        Asegúrate de que el objeto index.html y los directorios static/… quedan en la raíz del bucket.

    En Permissions del bucket, habilita Block public access → Off y añade una Bucket Policy que permita s3:GetObject público:

{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::react-app-domoticore-co/*"
  }]
}


