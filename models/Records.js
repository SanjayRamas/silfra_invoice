var mongoose = require('mongoose');

var RecordSchema = new mongoose.Schema({
        tax: String,
        invoice_number: String,
        logo_url: String,
          customer_info: {
            name: String,
            web_link: String,
            address1: String,
            address2: String,
            postal: String
          },
          company_info: {
            name: String,
            web_link: String,
            address1: String,
            address2: String,
            postal: String
          },
          items: [
            {
              qty: String, 
              description: String, 
              cost: String
            }
          ]
});


mongoose.model('Record', RecordSchema);