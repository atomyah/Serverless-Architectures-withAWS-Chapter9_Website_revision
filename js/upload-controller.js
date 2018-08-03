var config = {
    apiBaseUrl: 'https://k29gl6w9kl.execute-api.ap-northeast-1.amazonaws.com/dev' // API GatewayのURL
};


$('#upload').on('change', function () {

    var file = $('#upload').get(0).files[0];
    var requestDocumentUrl = config.apiBaseUrl + '/s3-policy-document?filename=' + encodeURI(file.name);

    console.log(file);
    console.log(requestDocumentUrl);

    $.get(requestDocumentUrl, function (data, status) {
        console.log(status);
        console.log(data);
        upload(file, data);
    });
});


function upload(file, data) {
  // FormDataオブジェクトを使ってmultipart/form-dataエンコーディングタイプのHTMLフォームが作られる
      var fd = new FormData();
      fd.append('key', data.key)
      fd.append('acl', 'private');
      fd.append('Content-Type', file.type);
      fd.append('AWSAccessKeyId', data.access_key);
      fd.append('policy', data.encoded_policy)
      fd.append('signature', data.signature);
      fd.append('file', file, file.name);

 // jQueryを使ってAjax POSTリクエストを実行しファイルをアップロードする。
      $.ajax({
          url: 'https://s3-ap-northeast-1.amazonaws.com/p332-serverless-video-upload', // data.upload_urlだと"https://s3.amazonaws.com/serverless-video-upload"になってしまう。
          type: 'POST',
          data: fd,
          processData: false,
          contentType: false,
          xhr: function() {
            var xhr = $.ajaxSettings.xhr();
            if(xhr.upload) {
                  xhr.upload.addEventListener('progress', function(evt){
                      var percentage = evt.loaded / evt.total * 100;

                      console.log(percentage + '%');
                      $('#upload-progress').show();
                      $('#upload-progress').find('.progress-bar').css('width', percentage + '%');
                  }, false);
            }
            return xhr;
          }
      }).done(function (response) {
          alert('Uploaded Finished');
          $('#upload-progress').hide();
      }).fail(function (response) {
          alert('Failed to upload');
          $('#upload-progress').hide();
      })
}
