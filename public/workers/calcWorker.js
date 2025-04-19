/**
 * Web Worker para cálculos complejos de tasas de cambio
 * Permite ejecutar operaciones intensivas sin bloquear el hilo principal
 */

// Función para calcular tasas de envío para diferentes países
function calculateSendRates(data) {
  const { dolarBlueCompra, marketRates } = data;
  
  const result = {};
  
  if (marketRates.colombia && dolarBlueCompra) {
    result.colombia = (marketRates.colombia.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (marketRates.peru && dolarBlueCompra) {
    result.peru = (marketRates.peru.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (marketRates.brasil && dolarBlueCompra) {
    result.brasil = (marketRates.brasil.bid * (1 - 0.03)) / dolarBlueCompra;
  }
  
  if (marketRates.chile && dolarBlueCompra) {
    result.chile = (marketRates.chile.bid * (1 - 0.031)) / dolarBlueCompra;
  }
  
  if (marketRates.ecuador && dolarBlueCompra) {
    result.ecuador = (marketRates.ecuador.bid * (1 - 0.031)) / dolarBlueCompra;
  }
  
  if (marketRates.paraguay && dolarBlueCompra) {
    result.paraguay = (marketRates.paraguay.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (marketRates.bolivia && dolarBlueCompra) {
    result.bolivia = (marketRates.bolivia.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (marketRates.mexico && dolarBlueCompra) {
    result.mexico = (marketRates.mexico.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (marketRates.uruguay && dolarBlueCompra) {
    result.uruguay = (marketRates.uruguay.bid * (1 - 0.033)) / dolarBlueCompra;
  }
  
  if (dolarBlueCompra) {
    result.paypal = dolarBlueCompra * (1 - 0.12);
    result.zelle = dolarBlueCompra * (1 - 0.07);
  }
  
  return result;
}

// Función para calcular tasas de recepción
function calculateReceiveRates(data) {
  const { argentinaBid, marketRates } = data;
  
  const result = {};
  const SPREAD = 0.05;
  
  if (marketRates.venezuela && marketRates.venezuela.compra) {
    result.venezuela = argentinaBid * marketRates.venezuela.compra * (1 - SPREAD);
  }
  
  if (marketRates.colombia) {
    result.colombia = argentinaBid * marketRates.colombia.ask * (1 - SPREAD);
  }
  
  if (marketRates.peru) {
    result.peru = argentinaBid * marketRates.peru.ask * (1 - SPREAD);
  }
  
  if (marketRates.brasil) {
    result.brasil = argentinaBid * marketRates.brasil.ask * (1 - SPREAD);
  }
  
  if (marketRates.chile) {
    result.chile = argentinaBid * marketRates.chile.ask * (1 - SPREAD);
  }
  
  if (marketRates.ecuador) {
    result.ecuador = argentinaBid * marketRates.ecuador.ask * (1 - SPREAD);
  }
  
  if (marketRates.paraguay) {
    result.paraguay = argentinaBid * marketRates.paraguay.ask * (1 - SPREAD);
  }
  
  if (marketRates.bolivia) {
    result.bolivia = argentinaBid * marketRates.bolivia.ask * (1 - SPREAD);
  }
  
  if (marketRates.mexico) {
    result.mexico = argentinaBid * marketRates.mexico.ask * (1 - SPREAD);
  }
  
  if (marketRates.uruguay) {
    result.uruguay = argentinaBid * marketRates.uruguay.ask * (1 - SPREAD);
  }
  
  return result;
}

// Función principal para procesar cálculos
function performCalculations(data) {
  // Determinar qué tipo de cálculo realizar
  const { calculationType, ...calcData } = data;
  
  switch (calculationType) {
    case 'sendRates':
      return calculateSendRates(calcData);
    case 'receiveRates':
      return calculateReceiveRates(calcData);
    case 'remesasRates':
      // Calcular ambas tasas para remesas
      const sendRates = calculateSendRates(calcData);
      const receiveRates = calculateReceiveRates(calcData);
      
      // Combinar resultados en formato adecuado para la UI
      return {
        sendRates,
        receiveRates
      };
    default:
      return { error: 'Unknown calculation type' };
  }
}

// Escuchar mensajes del hilo principal
self.addEventListener('message', (e) => {
  const { type, data } = e.data;
  
  if (type === 'calculateRates') {
    try {
      // Realizar cálculos solicitados
      const result = performCalculations(data);
      
      // Enviar resultados de vuelta al hilo principal
      self.postMessage({ 
        type: 'result', 
        requestId: data.requestId || null,
        data: result 
      });
    } catch (error) {
      // Manejar errores durante el cálculo
      self.postMessage({ 
        type: 'error',
        requestId: data.requestId || null,
        error: error.message || 'Error during calculation'
      });
    }
  }
});
