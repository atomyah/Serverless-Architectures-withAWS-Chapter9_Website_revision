var config = {
    UserPoolId: '', // ユーザープール名：24-hour-videoのプール ID
    ClientId: '' // アプリクライアント24-Hour-Video-ClientのクライアントID
};
var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(config);
var cognitoUser;

//console.log('userPool is ' + userPool);

$('#user_add_btn').click(function () {
    email    = $("#inputEmail").val();
    password = $("#inputPassword").val();
    if (!password || !email) {
        return false;
    }
    var attributeList = [
        {
            Name: 'email',
            Value: email
        },
    ];

    userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err) {
            console.log(err);
            message_text = err;
            message_class = "alert-danger";
        } else {
            cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            message_text = cognitoUser.getUsername() + "が作成されました";
            message_class = "alert-success";
        }
        $("#message").text(message_text);
        $("#message").addClass(message_class);
        $('#message').show();
        setTimeout(function () {
            $('#message').fadeOut();
            $("#message").removeClass(message_class);
        }, 5000);

        var url = "confirm.html?username=" + cognitoUser.getUsername();
        $(location).attr("href", url);
    });
});

$('#confirmation-button').click(function() {
  confirmation_code = $("#confirmation_code").val();
  email = location.search.match(/username=(.*?)(&|$)/)[1];
  console.log('confirmation_code is ' + confirmation_code);
  console.log('email is ' + email);

  userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(config);

  var userData = {
      Username : email,
      Pool : userPool
  };
  cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  console.log('cognitoUser is ' + cognitoUser);

    cognitoUser.confirmRegistration(confirmation_code,
      true, function (err, result) {
          if (err) {
              console.log(err);
          } else {
              console.log('call result: ' + result);
              message_text = 'Confirmation' + result;
              message_class = "alert-success";
          }
          $("#message").text(message_text);
          $("#message").addClass(message_class);
          $('#message').show();
          setTimeout(function () {
              $('#message').fadeOut();
              $("#message").removeClass(message_class);
          }, 5000);

          var url = "login.html";
          $(location).attr("href", url);
      });
});

$("#login-button").click(function(event){
    event.preventDefault();
    var authenticationData = {
        Username : $('#email').val(),
        Password : $('#password').val()
    };
    var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
    userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(config);
    var userData = {
        Username : $('#email').val(),
        Pool : userPool
    };
    cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (authresult) {
            //console.log('access token + ' + authresult.getIdToken().getJwtToken());

            var url = "index.html";

            $('form').fadeOut(700, function(){
                $(location).attr("href", url);
            });
            $('.wrapper').addClass('form-success');

        },
        onFailure: function(err) {
            alert(err.message);
        },
    });
});

$("#logout-button").click(function(){
//    userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(config);
    userPool.getCurrentUser().signOut()
    console.log('Successfully logged out');

    var url = "login.html";
    $(location).attr("href", url);

});
