// -----------------------------------------------------
// -----------------------------------------------------
const getSecurityCode = (data, cb) => {

  const { email } = data;
  var subject='Change Password :: Your security code'

  let code = '';
  for(ii=0;ii<4;ii++) code += Math.round(Math.random()*9);
  
  var text=`
    Swott.Me  - Change Password\n\n
    
    Your security code: ${code}
    \n\n
    If you did not request to change your password, please ignore this email.
  `;

   sendIt( email, subject, text, code, cb );

}

// -----------------------------------------------------
// -----------------------------------------------------
const sendIt = (email, subject, text, code, cb) => {

  const Mailjet = require('node-mailjet').connect(
    'a7993604d2e91b4c4ff53a0cec8cd4aa',
    '04effabfef2f93e6753f6ab9dc1b6de8'
  );
 
  const recipient = [{Email: email}];

  const options = {
    FromEmail: 'swott.me@gmail.com',
    FromName: 'Chinese Video Cards',
    Recipients: recipient,
    Subject: subject,
    'Text-part': text
  };

  const request = Mailjet.post('send')
  .request(options)
  .then( data => {
    cb({code:code});
  })
  .catch( error => {
    cb({result:'Error sending Email'});
    console.log("Error Sending Email", error);
  });
}

// -----------------------------------------------------
// -----------------------------------------------------
exports.getSecurityCode  = getSecurityCode;