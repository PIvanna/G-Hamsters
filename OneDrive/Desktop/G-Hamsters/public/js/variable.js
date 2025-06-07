let isRegister = false;
let isLogin = false;
let formAuthModal;
let error_text;

formAuthModal = {
  userName: getElement(`input[name="username_modal"]`),
  userSurname: getElement(`input[name="userSurnname_modal"]`),
  userEmail: getElement(`input[name="userEmail_modal"]`),
  userPhoneNumber: getElement(`input[name="userPhoneNumber_modal"]`),
  userPasswordRegister: getElement(`input[name="userPasswordRegister_modal"]`),
  userPasswordRepeat: getElement(`input[name="userPasswordRepeat_modal"]`),
  userPasswordLogin: getElement(`input[name="userPasswordLogin_modal"]`),
  buttonCancel: getElement(`button[name="button-cancel"]`),
  buttonSignIn: getElement(`button[name="button-sign-in"]`),
  buttonLoginIn: getElement(`button[name="button-login-in"]`),
};
formAuthMain = {
  userName: getElement(`input[name="userName_main"]`),
  userSurname: getElement(`input[name="userSurname_main"]`),
  userEmail: getElement(`input[name="userEmail_main"]`),
  userPhoneNumber: getElement(`input[name="userPhoneNumber_main"]`),
  userPasswordRegister: getElement(`input[name="userPasswordRegister_main"]`),
  userPasswordRepeat: getElement(`input[name="userPasswordRepeat_main"]`),
  buttonSignIn: getElement(`button[name="buttonSignIn_main"]`),
};
