// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');
  
  $.get('/invoices', function(invoices) {
    invoices.forEach(function(invoice) {
      $('<li></li>').text(invoice).appendTo('ul#invoices');
    });
  });

  $('form').submit(function(event) {
    event.preventDefault();
    var invoice = $('input').val();
    $.post('/invoices?' + $.param({invoice: invoice}), function() {
      $('<li></li>').text(invoice).appendTo('ul#invoices');
      $('input').val('');
      $('input').focus();
    });
  });

});
