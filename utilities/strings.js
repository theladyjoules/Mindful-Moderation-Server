exports.string = (s) => {
  let string = '';
  switch(s) {
    case 'generic':
      string = 'An error occured';
      break;
    case 'discount':
      string = 'We are unable to apply this discount code.';
      break;
    case 'login':
      string = 'The email or password you entered is invalid.';
      break;
    case 'forgotPassword':
      string = 'The email you entered is invalid.';
      break;
    case 'forgotPasswordEmail':
      string = 'Password reset email sent. Please check your email.';
      break;
    case 'passwordUpdateSuccess':
      string = 'Password successfully updated.';
      break;
    case 'billingAddressError':
        string = 'Please verify that your billing address is correct.';
        break;
    case 'sessionexpired':
        string = 'Your session has expired. Please login.';
        break;
    case 'emailAlreadyRegistered':
        string = 'This email address is already registered.';
        break;
    case 'required':
        string = 'This field is required.';
        break;
    case 'password':
        string = 'Requires: 8 characters, 1 uppercase, 1 lowercase, and 1 number.';
        break;
    case 'passwordConfirm':
        string = 'Passwords must match.';
        break;
    case 'email':
        string = 'Please enter a valid email.';
        break;
    case 'phone':
        string = 'Please enter a valid phone number.';
        break;
    case 'birthday':
        string = 'Please enter your birthday in MM/DD/YYYY format.';
        break;
    case 'birthdaySub18':
        string = 'You must be 18 years or older to register.';
        break;
    case 'phoneNumber':
        string = 'Phone number must be valid.';
        break;
    case 'state':
        string = 'Please select your state.';
        break;
    case 'zipCode':
        string = 'Please enter a valid zip code.';
        break;
    case 'cc100':
      string = 'An error occurred.';
      break;
    case 'cc110':
      string = 'An error occurred.';
      break;
    case 'cc200':
      string = 'Please enter your name.';
      break;
    case 'cc300':
      string = 'An error occurred.';
      break;
    case 'cc310':
      string = 'Please enter a valid credit card number.';
      break;
    case 'cc315':
      string = 'Please enter a valid credit card number.';
      break;
    case 'cc320':
      string = 'Please select your credit card type.';
      break;
    case 'cc330':
      string = 'Please enter the expiration month.';
      break;
    case 'cc340':
      string = 'Please enter the expiration year.';
      break;
    case 'cc350':
      string = 'CVV2 field submitted but does not match the card.';
      break;
    case 'cc355':
      string = 'Please enter your CVV2.';
      break;
    case 'cc357':
      string = 'An invalid character was entered, such as a letter in a numeric field.';
      break;
    case 'cc360':
      string = 'Payment declined by financial institution, or some other error has occurred.';
      break;
    case 'cc370':
      string = 'Expiration date invalid.';
      break;
    case 'cc400':
      string = 'An error occurred.';
      break;
    case 'cc500':
      string = 'An error occurred.';
      break;
    case 'cc510':
      string = 'An error occurred.';
      break;
    case 'cc520':
      string = 'An error occurred.';
      break;
    case 'cc530':
      string = 'An error occurred.';
      break;
    case 'cc531':
      string = 'An error occurred.';
      break;
    case 'cc550':
        string = 'An error occurred.';
        break;
    case 'whatCVV2':
        string = 'The Card Verification Code, or CVC*, is an extra code printed on your debit or credit card. With most cards (Visa, MasterCard, bank cards, etc.) it is the final three digits of the number printed on the signature strip on the reverse of your card. On American Express (AMEX) cards, it is usually a four digit code on the front.';
        break;
    default:
      break;
  }
  return string;
}