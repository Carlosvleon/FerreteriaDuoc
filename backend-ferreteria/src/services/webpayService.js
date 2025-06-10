const { WebpayPlus } = require('transbank-sdk');

// Datos de integración oficiales
const transaction = WebpayPlus.Transaction.buildForIntegration(
  '597055555532', // commerceCode
  '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C' // API Key Secret
);

exports.iniciarTransaccion = async (carritoTotal, returnUrl) => {
  const amount = Math.round(carritoTotal); // sin decimales
  const timestamp = Date.now();
  const buyOrder = `orden-${timestamp}`.slice(0,26);
  const sessionId = `sess-${timestamp}`.slice(0,26);

  const response = await transaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );
  return { token: response.token, url: response.url };
};

exports.confirmarTransaccion = async (token) => {
  const result = await transaction.commit(token);
  return result;
};
