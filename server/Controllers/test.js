const axios = require("axios").default;
const moment = require('moment');

exports.test = (req, res) => {
    const time = new Date().getTime();
    const date = new Date(time + (24 * 60 * 60 * 1000));
    console.log(moment(new Date(new Date(date).toLocaleString("en-US", { timeZone: "Asia/Kolkata" }))).format('YYYY-MM-DDThh:mm:ssZ'))
    const options = {
        method: 'POST',
        url: 'https://sandbox.cashfree.com/pg/orders',
        headers: {
            Accept: 'application/json',
            'x-client-id': '183272693e472b786285ca6b05272381',
            'x-client-secret': 'bb0465b2164819b8c0b64166e2f90c540cec09b9',
            'x-api-version': '2022-01-01',
            'Content-Type': 'application/json'
        },
        data: {
            customer_details: {
                customer_id: '1',
                customer_email: 'abhishek07verma@yahoo.com',
                customer_phone: '8240992441'
            },
            order_amount: 1,
            order_currency: 'INR',
            order_id: 'ord2235',
            order_expiry_time: new Date(date),
            order_meta: {
                return_url: "https://83.136.219.147:8000?order_id={order_id}&order_token={order_token}",
                notify_url: "http://83.136.219.147:8000/data"
            }
        }
    };

    axios.request(options).then(function (response) {
        res.send(response.data);
    }).catch(function (error) {
        res.send(JSON.parse(error.config.data));
    });
}