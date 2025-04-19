/**
 * Realiza una solicitud fetch con reintentos automáticos
 * Maneja apropiadamente las señales de aborto para evitar errores cuando los componentes se desmontan
 */
export async function fetchWithRetry(url: string, attempts: number = 3, signal?: AbortSignal): Promise<Response> {
  let lastError: Error | null = null;
  let currentAttempt = 0;

  while (currentAttempt < attempts) {
    try {
      // Verificar si la operación ya ha sido abortada antes de intentar
      if (signal?.aborted) {
        console.log('Fetch operation was aborted before execution');
        return new Response(JSON.stringify({ aborted: true }), {
          status: 499, // Cliente cerró la solicitud (código no oficial, pero usado por Nginx)
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const response = await fetch(url, { signal });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}, url: ${url}`);
      }
      return response;
    } catch (error) {
      // Crear una variable tipada para facilitar el manejo
      const typedError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      // Manejar AbortError de forma especial
      if (typedError.name === 'AbortError') {
        console.log('Fetch operation aborted during execution - component may have unmounted');
        // Devolver una respuesta controlada en lugar de lanzar un error
        return new Response(JSON.stringify({ aborted: true }), {
          status: 499,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Guardar el error para referencia y posible lanzamiento posterior
      lastError = typedError;
      
      // Incrementar el contador de intentos
      currentAttempt++;
      
      console.warn(`Request failed (attempt ${currentAttempt}/${attempts}): ${lastError.message}`);
      
      // Si todavía tenemos intentos pendientes, esperar antes del siguiente intento
      if (currentAttempt < attempts) {
        // Verificar nuevamente si se abortó durante la espera
        if (signal?.aborted) {
          console.log('Fetch retry was aborted during waiting period');
          return new Response(JSON.stringify({ aborted: true }), {
            status: 499,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        console.log(`Retrying in 5 seconds...`);
        try {
          await new Promise((resolve, reject) => {
            // Establecer un tiempo de espera que puede ser cancelado
            const timeout = setTimeout(resolve, 5000);
            
            // Si hay una señal, configurar un listener para abortar
            if (signal) {
              signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new DOMException('Aborted', 'AbortError'));
              }, { once: true });
            }
          });
        } catch (waitError) {
          // Si la espera fue abortada, devolver respuesta controlada
          if (waitError instanceof Error && waitError.name === 'AbortError') {
            console.log('Fetch retry waiting period was aborted');
            return new Response(JSON.stringify({ aborted: true }), {
              status: 499,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          // Otros errores durante la espera se pueden ignorar ya que seguiremos intentando
        }
      }
    }
  }

  // Si llegamos aquí, todos los intentos fallaron
  console.error(`Request failed after ${attempts} attempts: ${lastError?.message}`);
  throw new Error(`Request failed after ${attempts} attempts: ${lastError?.message}`);
}

/**
 * Almacén global para cachear respuestas de API
 * Utiliza URL como clave y almacena datos con timestamp para control de expiración
 */
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Caché global que persiste entre renderizados y componentes
const cacheStore = new Map<string, CacheEntry>();

/**
 * Realiza una solicitud fetch con caché y reintentos
 * Si existe una respuesta en caché válida, la devuelve inmediatamente sin realizar una nueva solicitud
 * Si no hay caché o está expirada, realiza la solicitud y almacena el resultado en caché
 * 
 * @param url - URL de la solicitud
 * @param maxAge - Tiempo máximo en milisegundos que la caché es válida (60 segundos por defecto)
 * @param attempts - Número de intentos en caso de fallo
 * @param signal - Señal de AbortController para cancelar la solicitud
 * @returns Response - Respuesta de la solicitud (puede ser desde caché)
 */
export async function fetchWithCacheAndRetry(
  url: string, 
  maxAge: number = 60000, 
  attempts: number = 3, 
  signal?: AbortSignal
): Promise<Response> {
  const cacheKey = url;
  const cachedData = cacheStore.get(cacheKey);
  
  // Verificar si estamos en modo desarrollo para logs
  const isDev = import.meta.env.DEV;
  
  // Verificar si la operación ya ha sido abortada antes de intentar
  if (signal?.aborted) {
    console.log('Cached fetch operation was aborted before execution');
    return new Response(JSON.stringify({ aborted: true }), {
      status: 499,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Usar caché si existe y no está expirada
  if (cachedData && (Date.now() - cachedData.timestamp < maxAge)) {
    if (isDev) {
      console.log(`Using cached data for ${url} (age: ${Date.now() - cachedData.timestamp}ms)`);
    }
    
    return new Response(JSON.stringify(cachedData.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
    });
  }
  
  // Si no hay caché o está expirada, realizar la solicitud
  if (isDev) {
    console.log(`Cache miss for ${url}${cachedData ? ' (expired)' : ''}`);
  }
  
  const response = await fetchWithRetry(url, attempts, signal);
  
  // Si la solicitud fue abortada, no continuar con el almacenamiento en caché
  if (response.status === 499 || signal?.aborted) {
    return response;
  }
  
  // Almacenar en caché si es exitosa
  if (response.ok) {
    try {
      // Clonar la respuesta para no consumirla
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Almacenar los datos en caché
      cacheStore.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      if (isDev) {
        console.log(`Cached data for ${url}`);
        // Mostrar tamaño aproximado de la caché
        console.log(`Cache size: ${cacheStore.size} entries`);
      }
    } catch (error) {
      // Si hay un error al procesar la respuesta, solo la registramos pero devolvemos la respuesta original
      console.warn(`Error caching response for ${url}:`, error);
    }
  }
  
  // Añadir un encabezado personalizado para indicar que es una respuesta fresca
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-Cache', 'MISS');
  
  // Crear una nueva respuesta con los nuevos encabezados
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

/**
 * Limpia entradas específicas o toda la caché
 * @param urls - URLs específicas para limpiar, o undefined para limpiar toda la caché
 */
export function clearCache(urls?: string[]): void {
  if (urls) {
    // Limpiar URLs específicas
    urls.forEach(url => cacheStore.delete(url));
    console.log(`Cleared cache for ${urls.length} URLs`);
  } else {
    // Limpiar toda la caché
    const size = cacheStore.size;
    cacheStore.clear();
    console.log(`Cleared entire cache (${size} entries)`);
  }
}
