require("dotenv").load();

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const path = require("path");
var stripe = require("stripe")(process.env.STRIPE_KEY);

app.use(bodyParser.urlencoded({extended: false}));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(require("serve-static")(path.join(__dirname, "public")));

app.get("/", (request, response) => {
    response.redirect("/bill");
});

app.get("/bill", (request, response) => {
    response.render("bill");
});

app.post('/charge', (request, response) => {
  charge(request.body.amount * 100, request.body.service, request.body.stripeToken)
    .then(charge => {
      response.render('success', { amount: charge.amount / 100 });
    })
    .catch(error => {
      response.render('error', error);
    });
});

const charge = (amount, token) => {
  return new Promise((resolve, reject) => {
    stripe.charges.create(
      {
        amount,
        currency: 'usd',
        source: token
      },
      (error, charge) => {
        if (error) {
          reject(error);
        } else {
          resolve(charge);
        }
      }
    );
  });
}

app.listen(process.env.PORT || 3000);
