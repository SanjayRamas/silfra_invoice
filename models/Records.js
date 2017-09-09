var mongoose = require('mongoose');

var RecordSchema = new mongoose.Schema({
  invoice : {
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
            name_c: String,
            web_link_c: String,
            address1_c: String,
            address2_c: String,
            postal_c: String
          },
          items: [
            {
              qty: String, 
              description: String, 
              cost: String
            }
          ] }
});


mongoose.model('Record', RecordSchema);