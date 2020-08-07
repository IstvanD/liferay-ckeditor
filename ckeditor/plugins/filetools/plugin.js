﻿/*
 Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
*/
(function(){function k(a){this.editor=a;this.loaders=[]}function l(a,c,b){var d=a.config.fileTools_defaultFileName;this.editor=a;this.lang=a.lang;"string"===typeof c?(this.data=c,this.file=n(this.data),this.loaded=this.total=this.file.size):(this.data=null,this.file=c,this.total=this.file.size,this.loaded=0);b?this.fileName=b:this.file.name?this.fileName=this.file.name:(a=this.file.type.split("/"),d&&(a[0]=d),this.fileName=a.join("."));this.uploaded=0;this.responseData=this.uploadTotal=null;this.status=
"created";this.abort=function(){this.changeStatus("abort")}}function n(a){var c=a.match(m)[1];a=a.replace(m,"");a=atob(a);var b=[],d,f,g,e;for(d=0;d<a.length;d+=512){f=a.slice(d,d+512);g=Array(f.length);for(e=0;e<f.length;e++)g[e]=f.charCodeAt(e);f=new Uint8Array(g);b.push(f)}return new Blob(b,{type:c})}CKEDITOR.plugins.add("filetools",{lang:"az,bg,ca,cs,da,de,de-ch,en,en-au,eo,es,es-mx,et,eu,fa,fr,gl,hr,hu,id,it,ja,km,ko,ku,lv,nb,nl,no,oc,pl,pt,pt-br,ro,ru,sk,sq,sr,sr-latn,sv,tr,ug,uk,vi,zh,zh-cn",
beforeInit:function(a){a.uploadRepository=new k(a);a.on("fileUploadRequest",function(a){var b=a.data.fileLoader;b.xhr.open("POST",b.uploadUrl,!0);a.data.requestData.upload={file:b.file,name:b.fileName}},null,null,5);a.on("fileUploadRequest",function(c){var b=c.data.fileLoader,d=new FormData;c=c.data.requestData;var f=a.config.fileTools_requestHeaders,g,e;for(e in c){var h=c[e];"object"===typeof h&&h.file?d.append(e,h.file,h.name):d.append(e,h)}d.append("ckCsrfToken",CKEDITOR.tools.getCsrfToken());
if(f)for(g in f)b.xhr.setRequestHeader(g,f[g]);b.xhr.send(d)},null,null,999);a.on("fileUploadResponse",function(a){var b=a.data.fileLoader,d=b.xhr,f=a.data;try{var g=JSON.parse(d.responseText);g.error&&g.error.message&&(f.message=g.error.message);if(g.uploaded)for(var e in g)f[e]=g[e];else a.cancel()}catch(h){f.message=b.lang.filetools.responseError,CKEDITOR.warn("filetools-response-error",{responseText:d.responseText}),a.cancel()}},null,null,999)}});k.prototype={create:function(a,c,b){b=b||l;var d=
this.loaders.length;a=new b(this.editor,a,c);a.id=d;this.loaders[d]=a;this.fire("instanceCreated",a);return a},isFinished:function(){for(var a=0;a<this.loaders.length;++a)if(!this.loaders[a].isFinished())return!1;return!0}};l.prototype={loadAndUpload:function(a,c){var b=this;this.once("loaded",function(d){d.cancel();b.once("update",function(a){a.cancel()},null,null,0);b.upload(a,c)},null,null,0);this.load()},load:function(){var a=this,c=this.reader=new FileReader;a.changeStatus("loading");this.abort=
function(){a.reader.abort()};c.onabort=function(){a.changeStatus("abort")};c.onerror=function(){a.message=a.lang.filetools.loadError;a.changeStatus("error")};c.onprogress=function(b){a.loaded=b.loaded;a.update()};c.onload=function(){a.loaded=a.total;a.data=c.result;a.changeStatus("loaded")};c.readAsDataURL(this.file)},upload:function(a,c){var b=c||{};a?(this.uploadUrl=a,this.xhr=new XMLHttpRequest,this.attachRequestListeners(),this.editor.fire("fileUploadRequest",{fileLoader:this,requestData:b})&&
this.changeStatus("uploading")):(this.message=this.lang.filetools.noUrlError,this.changeStatus("error"))},attachRequestListeners:function(){function a(){"error"!=b.status&&(b.message=b.lang.filetools.networkError,b.changeStatus("error"))}function c(){"abort"!=b.status&&b.changeStatus("abort")}var b=this,d=this.xhr;b.abort=function(){d.abort();c()};d.onerror=a;d.onabort=c;d.upload?(d.upload.onprogress=function(a){a.lengthComputable&&(b.uploadTotal||(b.uploadTotal=a.total),b.uploaded=a.loaded,b.update())},
d.upload.onerror=a,d.upload.onabort=c):(b.uploadTotal=b.total,b.update());d.onload=function(){b.update();if("abort"!=b.status)if(b.uploaded=b.uploadTotal,200>d.status||299<d.status)b.message=b.lang.filetools["httpError"+d.status],b.message||(b.message=b.lang.filetools.httpError.replace("%1",d.status)),b.changeStatus("error");else{for(var a={fileLoader:b},c=["message","fileName","url"],e=b.editor.fire("fileUploadResponse",a),h=0;h<c.length;h++){var k=c[h];"string"===typeof a[k]&&(b[k]=a[k])}b.responseData=
a;delete b.responseData.fileLoader;!1===e?b.changeStatus("error"):b.changeStatus("uploaded")}}},changeStatus:function(a){this.status=a;if("error"==a||"abort"==a||"loaded"==a||"uploaded"==a)this.abort=function(){};this.fire(a);this.update()},update:function(){this.fire("update")},isFinished:function(){return!!this.status.match(/^(?:loaded|uploaded|error|abort)$/)}};CKEDITOR.event.implementOn(k.prototype);CKEDITOR.event.implementOn(l.prototype);var m=/^data:(\S*?);base64,/;CKEDITOR.fileTools||(CKEDITOR.fileTools=
{});CKEDITOR.tools.extend(CKEDITOR.fileTools,{uploadRepository:k,fileLoader:l,getUploadUrl:function(a,c){var b=CKEDITOR.tools.capitalize;return c&&a[c+"UploadUrl"]?a[c+"UploadUrl"]:a.uploadUrl?a.uploadUrl:c&&a["filebrowser"+b(c,1)+"UploadUrl"]?a["filebrowser"+b(c,1)+"UploadUrl"]+"\x26responseType\x3djson":a.filebrowserUploadUrl?a.filebrowserUploadUrl+"\x26responseType\x3djson":null},isTypeSupported:function(a,c){return!!a.type.match(c)},isFileUploadSupported:"function"===typeof FileReader&&"function"===
typeof(new FileReader).readAsDataURL&&"function"===typeof FormData&&"function"===typeof(new FormData).append&&"function"===typeof XMLHttpRequest&&"function"===typeof Blob})})();