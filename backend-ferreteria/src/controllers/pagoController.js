const webpay = require('../services/webpayService');

exports.init = async (req, res) => {
  try {
    const { amount } = req.body;
    const baseUrl = 'https://tu-backend.com/api/pago/retorno';
    const { url, token } = await webpay.initPayment(amount, baseUrl);
    res.json({ url, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.retorno = async (req, res) => {
  try {
    const { token_ws } = req.body;
    const result = await webpay.confirmPayment(token_ws);
    // Aquí puedes guardar la transacción y completar compra...
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
