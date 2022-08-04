const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



exports.addCase = async (req, res) => {

    const product = await stripe.products.create({
        name: 'Gold Special',
    });
    await stripe.webhookEndpoints.create({
        url: `http://83.136.219.147:8000/v1/api/stripeWebhook/${product.id}`,
        enabled_events: [
            'charge.failed',
            'charge.succeeded',
        ],
    });

    const price = await stripe.prices.create({
        currency: 'inr',
        unit_amount: 1000,
        product: product.id,
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        expires_at: Math.floor(Date.now() / 1000) + (1800), // Configured to expire after 2 hours
    });

    // const paymentLink = await stripe.paymentLinks.create({
    //     line_items: [{ price: price.id, quantity: 1 }],
    //     after_completion: { type: 'redirect', redirect: { url: 'http://83.136.219.147:8000/' } },
    // });

    res.send(session)
}