import "./index.scss";
const SHA256 = require('crypto-js/sha256');

const server = "http://curso.altusdemo.cloud:8080";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});

document.getElementById("transfer-amount").addEventListener('click', () => {
  
  const address = document.getElementById("exchange-address").value;
  const signature = document.getElementById("signature").value;
  const message_hash = SHA256(JSON.stringify({
    "recipient": document.getElementById("recipient").value,
    "amount": document.getElementById("send-amount").value
  })).toString();
  const body = JSON.stringify({
    address, message_hash, signature
  });
  const request = new Request(`${server}/verify_signature`, { method: 'POST', body });
  fetch(request,{ headers: { 'Content-Type': 'application/json' }} ).then((response) => {
    return response.json();
  }).then(({ valid }) => {
    if (valid) {
      const sender = document.getElementById("exchange-address").value;
      const amount = document.getElementById("send-amount").value;
      const recipient = document.getElementById("recipient").value;
      const body = JSON.stringify({
        sender, amount, recipient
      });
      const request = new Request(`${server}/send`, { method: 'POST', body });
      fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
        return response.json();
      }).then(({ balance }) => {
        document.getElementById("balance").innerHTML = balance;
        document.getElementById("signature").value = "";
        document.getElementById("recipient").value = "";
        document.getElementById("send-amount").value = "";
        modal.style.display = "none";
      });
    } else {
      console.log("Signature is invalid");
      document.getElementById("error-message").style.visibility = "visible";
      setTimeout(() => {
        document.getElementById("error-message").style.visibility = "hidden"; 
        document.getElementById("signature").value = "";
      }, 1000);
      
    }
  });

});

var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("init-transfer");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
  const message = JSON.stringify({
    "recipient": document.getElementById("recipient").value,
    "amount": document.getElementById("send-amount").value
  });
  document.getElementById("message_json").innerHTML = "'" + message + "'";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}
