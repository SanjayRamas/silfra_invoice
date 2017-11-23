var mongoose = require('mongoose');

var RecordSchema = new mongoose.Schema({
  invoice : {
        invoice_number: String,
        gst_number: String,
        mou_number: String,
        aut_number: String,
        logo_url: String,
        currencySymbol: String,
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
              tax: String,
              cgst: String,
              igst: String,
              export: String,
              description: String, 
              cost: String,
              total: String,
              subtotal: String,
              grandtotal: String
            }
          ] }
});


mongoose.model('Record', RecordSchema);