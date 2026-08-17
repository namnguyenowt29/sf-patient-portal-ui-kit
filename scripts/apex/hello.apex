// Use .apex files to store anonymous Apex.
// You can execute anonymous Apex in VS Code by selecting the
//     apex text and running the command:
//     SFDX: Execute Anonymous Apex with Currently Selected Text
// You can also execute the entire file by running the command:
//     SFDX: Execute Anonymous Apex with Editor Contents

UIBundleRegistration.RegistrationRequest request = new UIBundleRegistration.RegistrationRequest();
request.email = 'quocnam.dn29@gmail.com';
request.firstName = 'Nam';
request.lastName = 'Nguyen';
request.password = 'Quocnam1103!';
request.startUrl = '/';

System.debug(UIBundleRegistration.registerUser(request));
