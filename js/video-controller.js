  var config = {
      apiBaseUrl: 'https://k29gl6w9kl.execute-api.ap-northeast-1.amazonaws.com/dev' // API GatewayのURL
  };


// いちおうPromise使って非同期でS3のファイルデータ、そしてDyanmoのテーブルデータを取ってきて最後に処理できるようにはしてある。
// Dyanmoのテーブルデータはどう処理すればいいかわからず。
Promise.resolve()
.then(function() {
	return new Promise(function getVideoList(resolve, reject) {
		var url = config.apiBaseUrl + '/videos?encoding=' + encodeURIComponent('720p');

    console.log(url);

    $.get(url, function(vdata, status){
        console.log("vdata Loaded: " + JSON.stringify(vdata) + " ,and Status Loaded: " + status); // vdataの中身は、domain, bucket, files
        resolve(vdata);
    });
  })
})
.then(function(vdata) {
  return new Promise(function getDynamoUpdateInfo(resolve, reject) {
    var url = config.apiBaseUrl + '/dynamo';

    $.get(url, function(ddata, status){
        console.log('ddata Loaded: ' + JSON.stringify(ddata) + ' ,and Status Loaded: ' + status); //ddataの中身は、"statusCode","headers","body":{"Items":[{"id":"e174fa314feac8152e2197a40dd1e6437f15a15b"},{...},{..}
        console.log('ddata.body.Items[0].id:  ' + JSON.stringify(ddata.body.Items[0].id))
        resolve([vdata, ddata]); // resolveの引数は一個しか渡せないので配列にしてる
    });
  })
})
.then(function(array) {
	 return new Promise(function updateVideoFrontpage(resolve, reject) {
    console.log('属性で渡されたarray: ' + JSON.stringify(array[0]) + '　と　' + JSON.stringify(array[1]));
    vdata = array[0];
    ddata = array[1]; // ddata,つまりDynamoからとってきたデータ。使いみちがない・・・（泣）

//		var baseUrl = vdata.domain; // これだとbaseUrlはhttps://s3.amazonaws.comとなり、
//    The bucket you are attempting to access must be addressed using the specified endpoint.のエラーだす。
    var baseUrl = 'https://s3-ap-northeast-1.amazonaws.com';
		var bucket = vdata.bucket;

    console.log(baseUrl); // https://s3-ap-northeast-1.amazonaws.com
    console.log(bucket); // p332-serverless-video-transcoded
    console.log(vdata.files); // eTag:, filename:, size: を含んだ配列


		for (var i = 0; i < vdata.files.length; i++) {
				var video = vdata.files[i];

				var clone = $('#video-template').clone().attr('id', 'video-' + i);

//				clone.find('source')
//						 .attr('src', '' + baseUrl + '/' + bucket + '/' + video.filename);
// p261にて下記に変更.
// 変更前は、https://s3-ap-northeast-1.amazonaws.com/p332-serverless-video-transcoded/36a3d1f6816eb23ee4b386cf5f4cfc3e077b3257/Sunset-15779-720p.mp4
// 変更後は、https://p332-serverless-video-transcoded.s3.ap-northeast-1.amazonaws.com/36a3d1f6816eb23ee4b386cf5f4cfc3e077b3257/Sunset-15779-web-720p.mp4?AWSAccessKeyId=ASIAJN3SJNMUR52OJM7A&Expires=1531379928&Signature=VSQrkCo3qZQaRJWPysZW%2BqqwRyQ%3D&x-amz-security-token=FQoDYXdzEEAaDKV44P%2FZJfRRT%2BT1XCLsAZix1oXANkKvRm4zU7d0K9sxTG203k7KeffELU0jKdrEN3S%2BvRkwOpCfNnHnSrR4Wr0hotsrrZJ3UaQTSZIAsZ7rbloMSgq91VI5kCL4tuy5ddp7xq73dfNNcplIa8wsZ0YYLVwOi8HRiquwP%2FqOAYTIdoGhLgiz4NupQtRWg3z2sAJOt083%2FEw0lXtNEFeftjc%2BGWNoUUcioTbe43jwMq8pS2EdIBMQUI6ExiRdidA4uZW4zF6noemGXehJW2fFchI%2BHFEqDpE30Qj5PeDNKaN8MbIU2YQdrXDgIIOpg5tj%2FBBWllEmzRf7EnHnKM76m9oF
          $('#loading-indicator').hide();
          clone.find('source').attr('src', video.filename); // 84行目　var video
          clone.find('.transcoding-indicator').hide();

				$('#video-list').prepend(clone);
		}
	});
})
.catch(function(err) {
  console.log(err);
})
;


// この関数はDynamo Stream情報を取ってこれないので用済みになってしまった。。。
  function updateVideoOnScreen(videoElement, videoObj){
    if (!videoObj) {
      return;
    }
    if(videoObj.key.transcoding) {
        videoElement.find('video').hide();
        videoElement.find('.transcoding-indicator').show();
    } else {
        videoElement.find('video').show();
        videoElement.find('.transcoding-indicator').hide();
    }

    videoElement.find('source').attr('src', video.filename);
  }
