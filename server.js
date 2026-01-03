const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const CONSUMER_KEY="YOUR_KEY";
const CONSUMER_SECRET="YOUR_SECRET";
const PASSKEY="YOUR_PASSKEY";
const SHORTCODE="174379";
const CALLBACK_URL="https://YOUR-BACKEND/mpesa/callback";

async function token(){
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers:{ Authorization:`Basic ${auth}` } }
  );
  return res.data.access_token;
}

app.post("/mpesa/pay", async(req,res)=>{
  const { phone, amount } = req.body;
  const access = await token();
  const time = new Date().toISOString().replace(/[^0-9]/g,"").slice(0,-3);
  const password = Buffer.from(`${SHORTCODE}${PASSKEY}${time}`).toString("base64");

  await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode:SHORTCODE,
      Password:password,
      Timestamp:time,
      TransactionType:"CustomerPayBillOnline",
      Amount:amount,
      PartyA:phone,
      PartyB:SHORTCODE,
      PhoneNumber:phone,
      CallBackURL:CALLBACK_URL,
      AccountReference:"TheHooch",
      TransactionDesc:"Payment"
    },
    { headers:{ Authorization:`Bearer ${access}` } }
  );

  res.json({success:true});
});

app.listen(3000,()=>console.log("M-Pesa server running"));
