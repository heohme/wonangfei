(function(){'use strict';
function message(text){var el=document.getElementById('toast');el.textContent=text;el.style.display='block';setTimeout(function(){el.style.display='none';},4500);}
window.WNFWeb={setDealLink:function(el,url){if(/^https:\/\/(?:www\.smzdm\.com\/p\/\d+\/|www\.apple\.com\.cn\/shop\/|store\.dji\.com\/cn\/product\/|www\.bang-olufsen\.com\/zh-cn\/cn\/)/.test(url))el.href=url;else el.removeAttribute('href');},saveImage:async function(dataUrl){
 try{
  var raw=atob(dataUrl.split(',')[1]),bytes=new Uint8Array(raw.length);for(var i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  var blob=new Blob([bytes],{type:'image/png'}),filename='wonangfei-'+new Date().toISOString().slice(0,10)+'.png';
  if(typeof File==='function'&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'){
   var file=new File([blob],filename,{type:'image/png'});
   if(navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'窝囊费 · 每一秒，都算数'});return;}catch(error){if(error.name==='AbortError')return;}}
  }
  var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},60000);
  message('已发起图片下载；若浏览器未响应，可长按小票图片保存。');
 }catch(error){message('请长按小票图片保存，或使用浏览器截图。');}
}};
})();
